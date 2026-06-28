import { useState } from "react";
import { runQuery, runRawQuery, runExplainQuery } from "../api/queryApi";

export function useQuery() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { sql, data, summary }
  const [clarification, setClarification] = useState(null);
  const [error, setError] = useState(null);
  const [lastQuestion, setLastQuestion] = useState("");

  async function execute(question, dbConnectionId) {
    setLoading(true);
    setError(null);
    setClarification(null);
    setResult(null);
    setLastQuestion(question);

    try {
      const res = await runQuery({ question, dbConnectionId });

      if (res.data.needsClarification) {
        setClarification(res.data);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function executeRaw(editedSql, dbConnectionId) {
    setLoading(true);
    setError(null);

    try {
      const res = await runRawQuery({ sql: editedSql, question: lastQuestion, dbConnectionId });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  const [explainResult, setExplainResult] = useState(null);

  async function executeExplain(sql, dbConnectionId) {
    setLoading(true);
    setError(null);
    setExplainResult(null);

    try {
      const res = await runExplainQuery({ sql, dbConnectionId });
      setExplainResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return { execute, executeRaw, executeExplain, loading, result, explainResult, clarification, error };
}