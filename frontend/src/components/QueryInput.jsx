import { useState, useEffect, useRef } from "react";
import VoiceInput from "./VoiceInput";

const SUGGESTIONS = [
  "Show all customers",
  "Top 5 orders by amount",
  "Revenue by month this year",
  "Customers who ordered last week",
];

export default function QueryInput({ onRun, loading, prefill }) {
  const [text, setText] = useState(prefill || "");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (prefill) setText(prefill);
  }, [prefill]);

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (text.trim() && !loading) onRun(text);
    }
  }

  function handleTranscript(final, interim) {
    setText(final || interim);
  }

  return (
    <div className="bg-ink rounded-2xl border border-line shadow-elevation-1 overflow-hidden">
      <div className="p-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full bg-surface border border-line rounded-xl p-4 text-sm text-text resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted"
            rows={3}
            placeholder="Ask something like: show top 5 customers by total spend this month"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {text && (
            <button
              onClick={() => setText("")}
              className="absolute top-3 right-3 text-muted hover:text-text p-1 rounded-lg hover:bg-surface2 transition-colors"
              title="Clear"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted">
              {text.length > 0 ? `${text.length} characters` : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted hidden sm:inline-flex items-center gap-1">
              <kbd className="bg-surface2 border border-line rounded px-1.5 py-0.5 text-[10px] font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="bg-surface2 border border-line rounded px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd>
              <span className="ml-0.5">to run</span>
            </span>
            <button
              className="bg-accent hover:bg-accent-hover transition-all text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-sm hover:shadow-glow flex items-center gap-2"
              disabled={loading || !text.trim()}
              onClick={() => onRun(text)}
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
                  Run Query
                </>
              )}
            </button>
            <VoiceInput
              isListening={isListening}
              setIsListening={setIsListening}
              onTranscript={handleTranscript}
            />
          </div>
        </div>
      </div>

      {/* Suggestion chips */}
      {!text && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          <span className="text-[11px] text-muted mr-1">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setText(s)}
              className="text-xs bg-accent-light text-accent px-3 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-colors font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}