import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import TranslationConsole from "../components/TranslationConsole";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "AI-Powered SQL Generation",
    desc: "Type a question the way you'd ask a colleague. Gemini converts it to precise SQL — no syntax knowledge needed.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Read-Only by Design",
    desc: "Every query runs through a dedicated role that can only SELECT. Nothing can be modified, dropped, or deleted — ever.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Charts & Visualizations",
    desc: "Instantly see results as tables, bar charts, line charts, or pie charts. Export data as CSV with one click.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    title: "Schema Explorer",
    desc: "Browse all tables, columns, and data types in your connected database. Preview sample data without writing SQL.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    title: "Editable SQL",
    desc: "Review and modify AI-generated queries before execution. Full control with the safety of read-only execution.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "AI Result Summaries",
    desc: "Get plain-English explanations of query results. Understand what the data means without reading every row.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your database",
    desc: "Add a read-only PostgreSQL connection in under a minute. Your credentials are AES-encrypted.",
    icon: (
      <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Ask in plain English",
    desc: "\"Show me top customers this month\" — type it like you'd say it. No SQL syntax required.",
    icon: (
      <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Get your answer",
    desc: "See results as tables and charts, plus the exact SQL, an AI summary, and export options.",
    icon: (
      <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "10k+", label: "Queries processed" },
  { value: "500+", label: "Databases connected" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Avg response time" },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const num = parseInt(target.replace(/[^0-9]/g, ""));

  useEffect(() => {
    let start = 0;
    const end = num;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [num]);

  const prefix = target.startsWith("<") ? "<" : "";
  const suf = target.includes("+") ? "+" : target.includes("%") ? "%" : suffix;
  const displaySuffix = target.endsWith("s") && !target.includes("+") && !target.includes("%") ? "s" : "";

  return (
    <span>
      {prefix}{count.toLocaleString()}{suf}{displaySuffix}
    </span>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-ink text-text font-body min-h-screen">
      {/* ─── Sticky Nav ─────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-strong border-b border-line shadow-elevation-1"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight text-text">QueryMind</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-muted hover:text-text transition-colors font-medium">
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-accent hover:bg-accent-hover transition-all px-5 py-2.5 rounded-xl font-semibold text-white shadow-sm hover:shadow-glow"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────── */}
      <section className="bg-gradient-hero pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-2 bg-accent-light text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-accent/10">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Powered by Google Gemini
            </div>

            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-[56px] leading-[1.1] mb-6 text-balance">
              Ask your database{" "}
              <br className="hidden sm:block" />
              a question.{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">Get a real answer.</span>
            </h1>

            <p className="text-muted text-lg mb-8 max-w-lg leading-relaxed">
              QueryMind turns plain English into SQL, runs it safely against your
              database, and returns tables, charts, and AI summaries — no SQL
              knowledge required.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="bg-accent hover:bg-accent-hover transition-all px-7 py-3.5 rounded-xl font-semibold text-white shadow-glow hover:shadow-glow-lg text-[15px]"
              >
                Start asking questions →
              </Link>
              <Link to="/login" className="text-muted hover:text-text transition-colors text-sm font-medium">
                Already have an account? Log in
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end animate-fadeUp" style={{ animationDelay: "0.15s" }}>
            <TranslationConsole />
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────── */}
      <section className="border-y border-line bg-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-extrabold text-3xl text-text mb-1">{s.value}</p>
              <p className="text-muted text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">How it works</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text">
            Three steps to your first answer
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="relative bg-ink border border-line rounded-2xl p-8 hover-lift shadow-elevation-1"
            >
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-line" />
              )}
              <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-5">
                {s.icon}
              </div>
              <span className="font-mono text-accent text-xs font-semibold">Step {s.n}</span>
              <h3 className="font-display font-bold text-lg mt-1.5 mb-2 text-text">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────── */}
      <section className="bg-surface border-y border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-text">
              Everything you need to query smarter
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-ink border border-line rounded-2xl p-7 hover-lift shadow-elevation-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-light text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-[15px] mb-2 text-text">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust / Security ───────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="bg-gradient-to-br from-accent-light via-ink to-teal-light rounded-3xl border border-line p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Security First</p>
              <h2 className="font-display font-bold text-3xl text-text mb-4">
                Built for safety from day one
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Your database credentials are AES-256 encrypted. Every AI-generated query runs through
                a dedicated read-only PostgreSQL role. Write operations are blocked at the database level,
                not just in code.
              </p>
              <div className="space-y-3">
                {[
                  "Read-only database role for all AI queries",
                  "AES-256 encrypted connection credentials",
                  "SQL validation before execution",
                  "Automatic error recovery and retry",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-accent/5 to-teal/5 flex items-center justify-center border border-line">
                <svg className="w-20 h-20 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Footer ─────────────────────────── */}
      <section className="bg-gradient-cta">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Stop writing SQL by hand.
          </h2>
          <p className="text-white/70 mb-8 text-lg max-w-md mx-auto">
            Connect a database and ask your first question in under five minutes.
          </p>
          <Link
            to="/signup"
            className="bg-white text-accent hover:bg-white/90 transition-all px-8 py-3.5 rounded-xl font-bold inline-block shadow-elevation-2 hover:shadow-elevation-4 text-[15px]"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────── */}
      <footer className="border-t border-line bg-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-sm text-muted">
              © {new Date().getFullYear()} QueryMind. Built for people who'd rather ask than write SQL.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="#" className="hover:text-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-text transition-colors">Terms</a>
            <a href="#" className="hover:text-text transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}