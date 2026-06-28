export default function ResultSummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="mt-4 bg-teal-light border border-teal/15 rounded-2xl p-5 animate-fadeUp">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            AI Summary
            <span className="text-[10px] bg-teal/10 px-2 py-0.5 rounded-full font-semibold normal-case tracking-normal">
              Gemini
            </span>
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}