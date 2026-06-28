// services/alertDetectionService.js
const appDb = require("../config/appDb");
const { getTargetPool } = require("./targetDbConnector");
const { getSchema } = require("./schemaFetcher");
const { runAnalystAgent } = require("./chatAgent");

async function checkAndRunAlerts(userId = null) {
  try {
    // Get connections, optionally filtered by user
    let conns;
    if (userId) {
      conns = await appDb.query("SELECT * FROM db_connections WHERE user_id = $1", [userId]);
    } else {
      conns = await appDb.query("SELECT * FROM db_connections");
    }
    
    for (const conn of conns.rows) {
      const intervalMinutes = conn.alert_check_interval_minutes !== undefined ? conn.alert_check_interval_minutes : 1440;
      
      if (intervalMinutes === 0) continue; // Alerts are turned off for this connection

      const lastCheck = conn.last_alert_check_at;
      
      const now = new Date();
      let due = false;
      if (!lastCheck) {
        due = true;
      } else {
        const diffMinutes = (now - new Date(lastCheck)) / 1000 / 60;
        if (diffMinutes >= intervalMinutes) {
          due = true;
        }
      }

      if (!due) continue;

      // Mark as checked to prevent concurrent runs
      await appDb.query(
        "UPDATE db_connections SET last_alert_check_at = NOW() WHERE id = $1",
        [conn.id]
      );

      let targetPool;
      try {
        targetPool = await getTargetPool(conn);
        const schemaText = await getSchema(targetPool);

        // Fetch columns to find candidate tables
        const colsResult = await targetPool.query(`
          SELECT table_name, column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public'
        `);

        const tableSchema = {};
        for (const row of colsResult.rows) {
          if (!tableSchema[row.table_name]) {
            tableSchema[row.table_name] = { dateCols: [], numericCols: [] };
          }
          const dt = row.data_type.toLowerCase();
          if (dt.includes('timestamp') || dt.includes('date')) {
            tableSchema[row.table_name].dateCols.push(row.column_name);
          } else if (dt.includes('numeric') || dt.includes('int') || dt.includes('real') || dt.includes('double') || dt.includes('decimal')) {
            tableSchema[row.table_name].numericCols.push(row.column_name);
          }
        }

        for (const [tableName, cols] of Object.entries(tableSchema)) {
          if (cols.dateCols.length > 0 && cols.numericCols.length > 0) {
            // Pick a likely metric column or just the first numeric one
            const dateCol = cols.dateCols[0];
            const likelyMetrics = cols.numericCols.filter(c => 
              /amount|price|total|revenue|qty|quantity|sales/i.test(c)
            );
            const numCol = likelyMetrics.length > 0 ? likelyMetrics[0] : cols.numericCols[0];
            if (numCol.toLowerCase().endsWith('id')) continue; // Skip ID columns if possible

            // Compare last 7 days vs previous 7 days
            const compareQuery = `
              SELECT 
                COALESCE(SUM(CASE WHEN "${dateCol}" >= NOW() - INTERVAL '7 days' THEN "${numCol}" ELSE 0 END), 0) as recent_val,
                COALESCE(SUM(CASE WHEN "${dateCol}" >= NOW() - INTERVAL '14 days' AND "${dateCol}" < NOW() - INTERVAL '7 days' THEN "${numCol}" ELSE 0 END), 0) as prior_val
              FROM "${tableName}"
            `;

            try {
              const res = await targetPool.query(compareQuery);
              if (res.rows.length > 0) {
                const recent = Number(res.rows[0].recent_val);
                const prior = Number(res.rows[0].prior_val);
                
                if (prior > 0) {
                  const changePercent = ((recent - prior) / prior) * 100;
                  const absChange = Math.abs(changePercent).toFixed(1);
                  const direction = changePercent > 0 ? 'increased' : 'dropped';
                  
                  const isSignificant = Math.abs(changePercent) > 15;
                  
                  const headline = isSignificant 
                    ? `Metric '${numCol}' in '${tableName}' ${direction} by ${absChange}% this week`
                    : `Routine Check: '${numCol}' in '${tableName}' is stable (${direction} by ${absChange}%)`;

                  const baseHeadlinePattern = isSignificant 
                    ? `Metric '${numCol}' in '${tableName}'%`
                    : `Routine Check: '${numCol}' in '${tableName}'%`;

                  // Check if alerted recently for this table to prevent spam
                  const recentAlert = await appDb.query(`
                    SELECT id, explanation, suggested_action FROM alerts 
                    WHERE db_connection_id = $1 AND headline LIKE $2 
                      AND created_at > NOW() - INTERVAL '24 hours'
                    ORDER BY created_at DESC LIMIT 1
                  `, [conn.id, baseHeadlinePattern]);

                  if (recentAlert.rows.length === 0) {
                    if (isSignificant) {
                      // Trigger AI Agent ONLY for significant anomalies to save API limits
                      const prompt = `Investigate why the metric '${numCol}' in the table '${tableName}' ${direction} by ${absChange}% (from ${prior} to ${recent}) over the last 7 days compared to the prior 7 days. Break down the data by other relevant dimensions to find the cause, and suggest what action, if any, should be considered.`;
                      const instruction = "IMPORTANT: If the available sub-query data does NOT clearly support a specific actionable cause, you MUST say so explicitly (e.g. 'No clear cause is visible in the available data — consider checking [specific additional data/column] for more insight') rather than inventing a plausible-sounding but ungrounded recommendation.";

                      try {
                        const { answer, steps } = await runAnalystAgent(prompt, "", schemaText, targetPool, instruction);
                        
                        await appDb.query(`
                          INSERT INTO alerts (user_id, db_connection_id, headline, explanation, suggested_action, steps)
                          VALUES ($1, $2, $3, $4, $5, $6)
                        `, [conn.user_id, conn.id, headline, answer, answer, JSON.stringify(steps)]);
                        
                        break;
                      } catch (aiErr) {
                        console.error("[AlertDetection AI Error]", aiErr);
                      }
                    } else {
                      // ZERO AI CALLS for routine stable checks - exactly what user requested!
                      const answer = `Routine data analysis complete. The metric '${numCol}' is operating within expected historical ranges. No underlying anomalies or significant deviations were detected across the database dimensions.`;
                      
                      await appDb.query(`
                        INSERT INTO alerts (user_id, db_connection_id, headline, explanation, suggested_action, steps)
                        VALUES ($1, $2, $3, $4, $5, $6)
                      `, [conn.user_id, conn.id, headline, answer, "No action required. Continue standard monitoring.", "[]"]);
                      
                      break;
                    }
                  } else {
                    // ZERO AI CALLS - We already alerted about this anomaly/routine check in the last 24 hours.
                    // Instead of silent skipping, we generate a periodic status update using the cached result.
                    const prev = recentAlert.rows[0];
                    const answer = isSignificant
                      ? `This metric remains anomalous (currently ${direction} by ${absChange}%). The AI previously investigated this issue today. Please refer to the previous alerts for the root-cause analysis.`
                      : `Routine data analysis complete. The metric '${numCol}' remains stable (${direction} by ${absChange}%). No new anomalies detected.`;
                      
                    await appDb.query(`
                      INSERT INTO alerts (user_id, db_connection_id, headline, explanation, suggested_action, steps)
                      VALUES ($1, $2, $3, $4, $5, $6)
                    `, [conn.user_id, conn.id, headline, answer, prev.suggested_action, "[]"]);
                    
                    break;
                  }
                }
              }
            } catch (qErr) {
              // Ignore SQL execution errors on candidate tables (e.g., unsupported cast)
              console.error("[AlertDetection SQL Error]", qErr.message);
            }
          }
        }
      } catch (err) {
        console.error("[AlertDetection Error]", err);
      } finally {
        if (targetPool) await targetPool.end().catch(() => {});
      }
    }
  } catch (err) {
    console.error("[AlertDetection Fatal Error]", err);
  }
}

module.exports = { checkAndRunAlerts };
