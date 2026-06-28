import { useEffect, useState } from "react";

const ENGLISH = "show top 3 customers by total spend";
const SQL_PARTS = [
  { text: "SELECT", color: "sql-keyword" },
  { text: " name, ", color: "sql-normal" },
  { text: "SUM", color: "sql-function" },
  { text: "(amount) ", color: "sql-normal" },
  { text: "AS", color: "sql-keyword" },
  { text: " total\n", color: "sql-normal" },
  { text: "FROM", color: "sql-keyword" },
  { text: " orders\n", color: "sql-normal" },
  { text: "JOIN", color: "sql-keyword" },
  { text: " customers ", color: "sql-normal" },
  { text: "ON", color: "sql-keyword" },
  { text: " ...\n", color: "sql-normal" },
  { text: "GROUP BY", color: "sql-keyword" },
  { text: " name\n", color: "sql-normal" },
  { text: "ORDER BY", color: "sql-keyword" },
  { text: " total ", color: "sql-normal" },
  { text: "DESC", color: "sql-keyword" },
  { text: " LIMIT 3;", color: "sql-normal" },
];

const ROWS = [
  { name: "Priya Sharma", total: "₹84,200" },
  { name: "Arjun Mehta", total: "₹71,950" },
  { name: "Sara Khan", total: "₹65,300" },
];

export default function TranslationConsole() {
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let timeouts = [];

    function run() {
      setStage(0);
      setTyped("");

      ENGLISH.split("").forEach((_, i) => {
        timeouts.push(
          setTimeout(() => setTyped(ENGLISH.slice(0, i + 1)), 35 * i)
        );
      });

      const typingDone = 35 * ENGLISH.length;
      timeouts.push(setTimeout(() => setStage(1), typingDone + 400));
      timeouts.push(setTimeout(() => setStage(2), typingDone + 700));
      timeouts.push(setTimeout(() => setStage(3), typingDone + 1100));
      timeouts.push(setTimeout(() => setStage(4), typingDone + 2400));
      timeouts.push(setTimeout(run, typingDone + 5500));
    }

    run();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-ink border border-line rounded-2xl shadow-elevation-4 overflow-hidden w-full max-w-md">
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-surface">
        <span className="w-3 h-3 rounded-full bg-danger/60" />
        <span className="w-3 h-3 rounded-full bg-warning/60" />
        <span className="w-3 h-3 rounded-full bg-teal/60" />
        <span className="ml-3 text-xs text-muted font-mono">query-lab</span>
      </div>

      <div className="p-5 min-h-[270px] flex flex-col gap-4 bg-ink">
        {/* English input */}
        <div className="font-mono text-sm text-text">
          <span className="text-accent">›</span>{" "}
          {typed}
          {stage === 0 && <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-blink align-middle rounded-sm" />}
        </div>

        {/* Transition */}
        {stage >= 2 && (
          <div className="flex items-center gap-2 text-xs text-muted font-mono animate-fadeUp">
            <svg className="w-3.5 h-3.5 text-accent animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            translating to SQL…
          </div>
        )}

        {/* SQL block */}
        {stage >= 3 && (
          <pre className="font-mono text-[13px] leading-relaxed bg-surface rounded-xl p-3 border border-line whitespace-pre-wrap animate-fadeUp">
            {SQL_PARTS.map((p, i) => (
              <span key={i} className={p.color}>{p.text}</span>
            ))}
          </pre>
        )}

        {/* Results table */}
        {stage >= 4 && (
          <div className="animate-fadeUp">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-muted border-b border-line">
                  <th className="text-left py-1.5 font-medium">name</th>
                  <th className="text-left py-1.5 font-medium">total</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-line/50">
                    <td className="py-1.5 text-text">{r.name}</td>
                    <td className="py-1.5 text-teal font-semibold">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}