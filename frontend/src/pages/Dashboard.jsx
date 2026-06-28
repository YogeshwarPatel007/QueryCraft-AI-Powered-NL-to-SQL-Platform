import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { getHistory } from "../api/queryApi";
import { useDatabase } from "../hooks/useDatabase";
import { Link } from "react-router-dom";
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { connections } = useDatabase();
  const [recent, setRecent] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((res) => {
        setAllHistory(res.data.history);
        setRecent(res.data.history.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalQueries = allHistory.length;
  const successQueries = allHistory.filter((q) => q.status === "success").length;
  const successRate = totalQueries > 0 ? Math.round((successQueries / totalQueries) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-surface text-text font-body">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl text-text">
            {getGreeting()}{user ? `, ${user.name}` : ""} 👋
          </h2>
          <p className="text-muted text-sm mt-1">Here's what's happening with your queries today.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Queries"
            value={totalQueries}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
            accent="accent"
          />
          <StatCard
            label="Connected Databases"
            value={connections.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            }
            accent="teal"
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            accent="info"
          />
          <StatCard
            label="Plan"
            value="Free"
            subtitle="100 queries/month"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            }
            accent="warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            to="/query"
            className="flex items-center gap-3 bg-ink border border-line rounded-xl px-5 py-4 hover-lift shadow-elevation-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">New Query</p>
              <p className="text-xs text-muted">Ask a question</p>
            </div>
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-3 bg-ink border border-line rounded-xl px-5 py-4 hover-lift shadow-elevation-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center group-hover:bg-teal group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Connect Database</p>
              <p className="text-xs text-muted">Add a connection</p>
            </div>
          </Link>

          <Link
            to="/history"
            className="flex items-center gap-3 bg-ink border border-line rounded-xl px-5 py-4 hover-lift shadow-elevation-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-info-light text-info flex items-center justify-center group-hover:bg-info group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">View History</p>
              <p className="text-xs text-muted">Past queries</p>
            </div>
          </Link>
        </div>

        {/* Recent Queries */}
        <div className="bg-ink border border-line rounded-2xl shadow-elevation-1 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-[15px] text-text">Recent Queries</h3>
            <Link to="/query" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              New query
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {loading && (
            <div className="px-6 py-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 shimmer-bg rounded w-2/3" />
                    <div className="h-4 shimmer-bg rounded w-1/4 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && recent.length === 0 && (
            <EmptyState
              icon="💬"
              title="No queries yet"
              description="Ask your database a question in plain English and see the results here."
              action={
                <Link to="/query" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                  Ask your first question →
                </Link>
              }
            />
          )}

          {recent.map((q, i) => (
            <div
              key={q.id}
              className={`px-6 py-4 flex items-center justify-between hover:bg-surface-hover transition-colors ${
                i < recent.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    q.status === "success"
                      ? "bg-teal-light text-teal"
                      : "bg-danger-light text-danger"
                  }`}
                >
                  {q.status}
                </span>
                <p className="text-sm text-text truncate">{q.natural_language}</p>
              </div>
              <p className="text-muted text-xs whitespace-nowrap ml-4" title={new Date(q.created_at).toLocaleString()}>
                {timeAgo(q.created_at)}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, subtitle, icon, accent = "accent" }) {
  const bgMap = {
    accent: "bg-accent-light text-accent",
    teal: "bg-teal-light text-teal",
    info: "bg-info-light text-info",
    warning: "bg-warning-light text-warning",
  };

  return (
    <div className="bg-ink border border-line rounded-2xl p-5 hover-lift shadow-elevation-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${bgMap[accent]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-text">{value}</p>
      {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}