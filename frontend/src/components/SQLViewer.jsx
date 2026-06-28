import { useState, useEffect } from "react";

const SQL_KEYWORDS = new Set([
  "SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","ON",
  "GROUP","BY","ORDER","ASC","DESC","LIMIT","OFFSET","INSERT","INTO",
  "VALUES","UPDATE","SET","DELETE","CREATE","DROP","ALTER","TABLE",
  "INDEX","AND","OR","NOT","IN","IS","NULL","AS","DISTINCT","COUNT",
  "SUM","AVG","MIN","MAX","HAVING","BETWEEN","LIKE","CASE","WHEN",
  "THEN","ELSE","END","UNION","ALL","EXISTS","WITH","RETURNING",
]);

function highlightSQL(sql) {
  if (!sql) return [];
  return sql.split(/(\s+|[(),;])/).map((token, i) => {
    if (SQL_KEYWORDS.has(token.toUpperCase())) {
      return <span key={i} className="text-accent font-semibold">{token}</span>;
    }
    if (/^'[^']*'$/.test(token)) {
      return <span key={i} className="text-warning">{token}</span>;
    }
    if (/^\d+$/.test(token)) {
      return <span key={i} className="text-teal">{token}</span>;
    }
    return <span key={i} className="text-text-secondary">{token}</span>;
  });
}

export default function SQLViewer({ sql, onRunEdited, onOptimize, loading }) {
  const [editedSql, setEditedSql] = useState(sql || "");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedSql(sql || "");
    setEditing(false);
  }, [sql]);

  if (!sql) return null;

  function handleCopy() {
    navigator.clipboard.writeText(editing ? editedSql : sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-4 bg-ink border border-line rounded-2xl shadow-elevation-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <p className="text-xs font-semibold text-text uppercase tracking-wider">Generated SQL</p>
          {editing && (
            <span className="text-[10px] bg-warning-light text-warning px-2 py-0.5 rounded-full font-semibold">
              Editing
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleCopy}
            className="text-xs text-muted hover:text-text px-2.5 py-1.5 rounded-lg hover:bg-surface transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copy
              </>
            )}
          </button>
          {onOptimize && (
            <button
              onClick={() => onOptimize(sql)}
              disabled={loading}
              className="text-xs text-muted hover:text-accent px-2.5 py-1.5 rounded-lg hover:bg-surface transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Optimize
            </button>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              editing
                ? "text-warning bg-warning-light"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {!editing && (
        <pre className="text-sm p-4 overflow-x-auto font-mono leading-relaxed">
          {highlightSQL(sql)}
        </pre>
      )}

      {editing && (
        <div className="p-4">
          <textarea
            className="w-full bg-surface border border-accent/20 text-text-secondary text-sm p-4 rounded-xl font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            rows={6}
            value={editedSql}
            onChange={(e) => setEditedSql(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Only read-only SELECT queries allowed
            </p>
            <button
              onClick={() => onRunEdited(editedSql)}
              disabled={loading || !editedSql.trim()}
              className="bg-accent hover:bg-accent-hover transition-all text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
                  Running…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Run edited query
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}