import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import QueryInput from "../components/QueryInput";
import SQLViewer from "../components/SQLViewer";
import ChartToggle from "../components/ChartToggle";
import ClarificationPanel from "../components/ClarificationPanel";
import ResultSummary from "../components/ResultSummary";
import SchemaBrowser from "../components/SchemaBrowser";
import AnalystChat from "../components/AnalystChat";
import { useQuery } from "../hooks/useQuery";
import { useDatabase } from "../hooks/useDatabase";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import AutoChart from "../components/AutoChart";

export default function QueryLab() {
  const { execute, executeRaw, executeExplain, loading, result, explainResult, clarification, error } = useQuery();
  const { connections, activeConnectionId, setActiveConnectionId } = useDatabase();
  const [rightTab, setRightTab] = useState("schema"); // "schema" | "chat"
  const location = useLocation();

  // Prefill from History re-run
  const prefill = location.state?.prefill || "";

  useEffect(() => {
    if (location.state?.initialMessage) {
      if (location.state.connectionId && location.state.connectionId !== activeConnectionId) {
        setActiveConnectionId(location.state.connectionId);
      }
      setRightTab("chat");
    }
  }, [location.state, activeConnectionId, setActiveConnectionId]);

  const activeConnection = connections.find((c) => c.id === activeConnectionId);

  function handleRun(text) {
    if (!activeConnectionId) return;
    execute(text, activeConnectionId);
  }

  function handleRunEdited(editedSql) {
    if (!activeConnectionId) return;
    executeRaw(editedSql, activeConnectionId);
  }

  function handleOptimize(sql) {
    if (!activeConnectionId) return;
    executeExplain(sql, activeConnectionId);
  }

  return (
    <div className="flex min-h-screen bg-surface text-text font-body">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-hidden min-w-0">
        {/* ─── Top Bar ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-text">Query Lab</h2>
              <p className="text-muted text-xs">
                Ask in plain English — AI writes the SQL, your read-only role runs it
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database selector */}
            {connections.length > 0 && (
              <select
                className="bg-ink border border-line rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all cursor-pointer min-w-[160px]"
                value={activeConnectionId || ""}
                onChange={(e) => setActiveConnectionId(Number(e.target.value))}
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.connection_name}
                  </option>
                ))}
              </select>
            )}

            {/* Connection status */}
            {activeConnection && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-teal bg-teal-light border border-teal/15 rounded-full px-3 py-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                Connected
              </span>
            )}
          </div>
        </div>

        {/* ─── Main Content ──────────────────────────── */}
        {connections.length === 0 ? (
          <div className="bg-ink border border-line rounded-2xl shadow-elevation-1 flex-1">
            <EmptyState
              icon="🔌"
              title="No database connected yet"
              description="Add a read-only connection to start asking questions about your data."
              action={
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover transition-colors text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add a database connection
                </Link>
              }
            />
          </div>
        ) : (
          <div className="flex gap-5 flex-1 min-h-0">
            {/* ─── Left Panel — Query Flow ──────────────── */}
            <div className="flex-1 min-w-0 overflow-y-auto pr-1">
              <QueryInput onRun={handleRun} loading={loading} prefill={prefill} />

              {/* Loading */}
              {loading && (
                <div className="mt-4 flex items-center gap-3 text-sm text-muted bg-accent-light rounded-xl px-4 py-3 animate-fadeUp">
                  <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin-slow" />
                  <span>Analyzing your question and generating SQL…</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 bg-danger-light border border-danger/20 rounded-2xl p-4 text-sm text-danger flex items-start gap-3 animate-fadeUp">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <ClarificationPanel clarification={clarification} onSelect={handleRun} />

              {result && (
                <div className="mt-2 space-y-0">
                  <ResultSummary summary={result.summary} />
                  <AutoChart chartConfig={result.chartConfig} data={result.data} />
                  <SQLViewer sql={result.sql} onRunEdited={handleRunEdited} onOptimize={handleOptimize} loading={loading} />
                  
                  {explainResult && (
                    <div className="mt-4 bg-ink border border-accent rounded-xl p-5 shadow-sm animate-fadeUp">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.36c-2.32 0-4.48-1.28-5.5-3.32-1.02-2.04-.84-4.5.47-6.38L8.64 6.8a2 2 0 013.23-.27l3.72 5.21c.21.3.46.56.74.78.28.21.6.38.94.49.34.11.7.16 1.06.14.36-.02.72-.11 1.05-.25.33-.14.63-.34.89-.59z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L10 8L16 10L13 2Z" />
                        </svg>
                        <h3 className="text-sm font-bold text-text uppercase tracking-wide">DBA Performance Optimization</h3>
                      </div>
                      <div className="text-sm text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
                        {explainResult.analysis}
                      </div>
                      <details className="text-xs group">
                        <summary className="cursor-pointer text-accent hover:text-accent-hover font-semibold list-none flex items-center gap-1">
                          <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          View Raw EXPLAIN ANALYZE Output
                        </summary>
                        <pre className="mt-2 p-3 bg-surface border border-line rounded-lg overflow-x-auto text-muted font-mono whitespace-pre text-[10px] leading-tight">
                          {explainResult.explainOutput}
                        </pre>
                      </details>
                    </div>
                  )}

                  <ChartToggle data={result.data} />
                </div>
              )}

              {/* Empty state */}
              {!result && !clarification && !error && !loading && (
                <div className="mt-6 bg-ink border-2 border-dashed border-line rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent-light mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </div>
                  <p className="text-text font-semibold text-sm mb-1">Ask your database a question</p>
                  <p className="text-muted text-xs mb-3 max-w-sm mx-auto">
                    Results, generated SQL, and an AI summary will appear here.
                  </p>
                  <p className="text-muted text-xs">
                    Try: <span className="text-accent font-mono font-medium">"show top 5 customers by total spend"</span>
                  </p>
                </div>
              )}
            </div>

            {/* ─── Right Panel — Tabs (Schema / Chat) ──── */}
            <div className="hidden xl:flex flex-col w-[360px] shrink-0 min-h-0">
              {/* Tab header */}
              <div className="flex bg-ink border border-line rounded-xl p-1 mb-3 shrink-0">
                <button
                  onClick={() => setRightTab("schema")}
                  className={`flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    rightTab === "schema"
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-text hover:bg-surface"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                  </svg>
                  Schema Browser
                </button>
                <button
                  onClick={() => setRightTab("chat")}
                  className={`flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    rightTab === "chat"
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-text hover:bg-surface"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Analyst Chat
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {rightTab === "schema" && (
                  <div className="h-full overflow-y-auto">
                    <SchemaBrowser connectionId={activeConnectionId} />
                  </div>
                )}
                {rightTab === "chat" && (
                  <div className="h-full">
                    <AnalystChat connectionId={activeConnectionId} initialMessage={location.state?.initialMessage} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}