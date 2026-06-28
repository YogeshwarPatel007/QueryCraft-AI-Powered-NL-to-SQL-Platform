import { Link } from "react-router-dom";

const FLOATING_SNIPPETS = [
  { sql: "SELECT name, SUM(amount)\nFROM orders\nGROUP BY name", x: "10%", y: "20%", delay: "0s" },
  { sql: "WHERE created_at\n  >= now() - '30 days'", x: "60%", y: "15%", delay: "1s" },
  { sql: "JOIN customers ON\n  orders.cust_id = id", x: "25%", y: "65%", delay: "2s" },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-ink text-text font-body flex">
      {/* Brand panel — hidden on small screens */}
      <div className="hidden lg:flex w-1/2 bg-gradient-auth flex-col justify-between p-12 relative overflow-hidden">
        {/* Floating decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white">QueryMind</span>
        </Link>

        {/* Floating SQL snippets */}
        <div className="z-10 flex-1 flex items-center justify-center relative">
          {FLOATING_SNIPPETS.map((s, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: s.x,
                top: s.y,
                animationDelay: s.delay,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              <pre className="font-mono text-[11px] bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80 border border-white/10 shadow-lg whitespace-pre">
                {s.sql}
              </pre>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="z-10">
          <p className="text-white/90 text-lg font-display font-semibold mb-2">
            Ask questions. Get answers.
          </p>
          <p className="text-white/60 text-sm leading-relaxed max-w-md">
            Every query runs through a read-only database role.
            Your data can be read — never changed.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-ink">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-text">QueryMind</span>
            </Link>
          </div>

          <h2 className="font-display font-bold text-2xl text-text mb-1">{title}</h2>
          {subtitle && <p className="text-muted text-sm mb-7">{subtitle}</p>}
          {children}
          {footer && <p className="text-muted text-sm mt-7 text-center">{footer}</p>}
        </div>
      </div>
    </div>
  );
}