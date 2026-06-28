export default function ClarificationPanel({ clarification, onSelect }) {
  if (!clarification) return null;

  return (
    <div className="mt-4 bg-warning-light border border-warning/20 rounded-2xl p-5 animate-fadeUp">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-text mb-1">Need clarification</p>
          <p className="text-sm text-text-secondary">
            Your question could mean a few things — which did you mean?
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 ml-11">
        {clarification.suggestions?.map((s, i) => (
          <button
            key={i}
            className="text-left bg-ink border border-line rounded-xl px-4 py-3 hover:border-accent hover:shadow-sm transition-all text-sm text-text group"
            onClick={() => onSelect(s.label)}
          >
            <span className="text-accent group-hover:text-accent-hover font-medium mr-2">→</span>
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted mt-4 ml-11">Or type something more specific above.</p>
    </div>
  );
}