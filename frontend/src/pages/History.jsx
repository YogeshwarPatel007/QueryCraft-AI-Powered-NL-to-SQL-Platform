import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getHistory, deleteHistoryItem } from "../api/queryApi";
import EmptyState from "../components/EmptyState";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | success | failed
  const navigate = useNavigate();

  useEffect(() => {
    getHistory()
      .then((res) => setHistory(res.data.history))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    await deleteHistoryItem(id);
    setHistory((h) => h.filter((q) => q.id !== id));
  }

  function handleRerun(query) {
    navigate("/query", { state: { prefill: query.natural_language } });
  }

  const filtered = history.filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (search && !q.natural_language.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const successCount = history.filter((q) => q.status === "success").length;
  const failedCount = history.filter((q) => q.status === "failed").length;

  return (
    <div className="flex min-h-screen bg-surface text-text font-body">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-text flex items-center gap-2.5">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Query History
            </h2>
            <p className="text-muted text-sm mt-0.5">Browse and re-run your past queries.</p>
          </div>
          <span className="text-xs text-muted bg-surface2 px-3 py-1.5 rounded-full font-medium">
            {history.length} total quer{history.length !== 1 ? "ies" : "y"}
          </span>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search queries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-ink border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted"
            />
          </div>
          <div className="flex gap-1 bg-ink border border-line rounded-xl p-1">
            {[
              { id: "all", label: `All (${history.length})` },
              { id: "success", label: `Success (${successCount})` },
              { id: "failed", label: `Failed (${failedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.id
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History list */}
        <div className="bg-ink border border-line rounded-2xl shadow-elevation-1 overflow-hidden">
          {loading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-6 w-16 shimmer-bg rounded-full" />
                  <div className="h-4 shimmer-bg rounded flex-1" />
                  <div className="h-4 w-20 shimmer-bg rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <EmptyState
              icon="📋"
              title={search || filter !== "all" ? "No matching queries" : "No history yet"}
              description={
                search || filter !== "all"
                  ? "Try a different search term or filter."
                  : "Your query history will appear here after you run your first query."
              }
            />
          )}

          {filtered.map((q, i) => (
            <div
              key={q.id}
              className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-hover transition-colors ${
                i < filtered.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      q.status === "success"
                        ? "bg-teal-light text-teal"
                        : "bg-danger-light text-danger"
                    }`}
                  >
                    {q.status}
                  </span>
                  <p className="font-medium text-text text-sm truncate">{q.natural_language}</p>
                </div>
                {q.generated_sql && (
                  <pre className="text-xs text-muted font-mono mt-1 truncate max-w-lg">{q.generated_sql}</pre>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                    </svg>
                    {q.connection_name}
                  </span>
                  <span className="text-[11px] text-muted">{q.row_count} rows</span>
                  <span className="text-[11px] text-muted" title={new Date(q.created_at).toLocaleString()}>
                    {timeAgo(q.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRerun(q)}
                  className="text-xs text-accent hover:text-accent-hover font-medium px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Re-run
                </button>
                <button
                  className="text-xs text-danger hover:text-danger font-medium px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors flex items-center gap-1.5"
                  onClick={() => handleDelete(q.id)}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}