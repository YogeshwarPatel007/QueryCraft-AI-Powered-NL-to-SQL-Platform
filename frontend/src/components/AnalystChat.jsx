import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/chatApi";
import VoiceInput from "./VoiceInput";

export default function AnalystChat({ connectionId, initialMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const initialMessageSent = useRef(false);

  useEffect(() => {
    if (initialMessage && connectionId && !initialMessageSent.current) {
      setInput(initialMessage);
      initialMessageSent.current = true;
      // Auto-send after a small delay to ensure input is set
      setTimeout(() => {
        handleSendRef.current(initialMessage);
      }, 500);
    }
  }, [initialMessage, connectionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Reset conversation when connection changes
  useEffect(() => {
    setMessages([]);
    setConversationId(null);
  }, [connectionId]);

  async function handleSend(overrideText = null) {
    const text = typeof overrideText === "string" ? overrideText : input.trim();
    if (!text || loading || !connectionId) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        connectionId,
        message: text,
        conversationId,
        history,
      });

      const { answer, steps, conversationId: newConvId } = res.data;
      if (newConvId) setConversationId(newConvId);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, steps },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.response?.data?.error || "Something went wrong. Please try again.",
          steps: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTranscript(final, interim) {
    setInput(final || interim);
  }

  return (
    <div className="flex flex-col h-full bg-ink rounded-2xl border border-line shadow-elevation-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line bg-surface/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-text">AI Data Analyst</p>
            <p className="text-[10px] text-muted">Multi-step reasoning over your data</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text mb-1">Ask complex questions</p>
            <p className="text-xs text-muted leading-relaxed max-w-[220px]">
              I'll break it into sub-queries, run each one, and synthesize a complete answer.
            </p>
            <div className="flex flex-col gap-1.5 mt-4 w-full">
              {[
                "Who are the top customers this quarter?",
                "What's the monthly revenue trend?",
                "Which products have the most returns?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-[11px] text-left text-accent bg-accent-light/50 hover:bg-accent-light px-3 py-2 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-line p-3 bg-surface/30">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 bg-surface border border-line rounded-xl px-3 py-2.5 text-sm text-text resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted min-h-[40px] max-h-[100px]"
            placeholder={connectionId ? "Ask about your data…" : "Select a database first"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!connectionId || loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !connectionId}
            className="shrink-0 w-9 h-9 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 transition-all flex items-center justify-center shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
          <VoiceInput
            isListening={isListening}
            setIsListening={setIsListening}
            onTranscript={handleTranscript}
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-accent text-white rounded-br-md"
              : "bg-surface border border-line text-text rounded-bl-md"
          }`}
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-[10px] font-semibold text-accent">AI Analyst</span>
            </div>
          )}
          {message.content}
        </div>

        {/* Show my work toggle */}
        {!isUser && message.steps && message.steps.length > 0 && (
          <div className="mt-1.5">
            <button
              onClick={() => setShowSteps((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-muted hover:text-accent transition-colors font-medium px-1"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showSteps ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {showSteps ? "Hide my work" : "Show my work"} ({message.steps.length} sub-quer{message.steps.length !== 1 ? "ies" : "y"})
            </button>

            {showSteps && (
              <div className="mt-2 space-y-2 animate-slideDown">
                {message.steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({ step, index }) {
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="bg-surface/80 border border-line rounded-xl overflow-hidden text-xs">
      {/* Header */}
      <div className="px-3 py-2 border-b border-line flex items-center justify-between">
        <span className="font-medium text-text flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">
            {index + 1}
          </span>
          {step.subQuestion}
        </span>
      </div>

      {/* SQL */}
      <pre className="px-3 py-2 font-mono text-[11px] text-accent bg-accent-light/30 border-b border-line overflow-x-auto whitespace-pre-wrap">
        {step.sql}
      </pre>

      {/* Result or Error */}
      {step.error ? (
        <div className="px-3 py-2 text-danger text-[11px]">
          ⚠ {step.error}
        </div>
      ) : step.result && step.result.length > 0 ? (
        <div>
          <button
            onClick={() => setShowResult((v) => !v)}
            className="w-full px-3 py-1.5 text-left text-[11px] text-muted hover:text-text hover:bg-surface-hover transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-2.5 h-2.5 transition-transform ${showResult ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {step.result.length} row{step.result.length !== 1 ? "s" : ""} returned
          </button>

          {showResult && (
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="bg-surface2/50">
                    {Object.keys(step.result[0]).map((col) => (
                      <th key={col} className="text-left px-2 py-1 text-muted font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.result.slice(0, 10).map((row, ri) => (
                    <tr key={ri} className="border-t border-line/50">
                      {Object.values(row).map((val, ci) => (
                        <td key={ci} className="px-2 py-1 text-text whitespace-nowrap">
                          {val === null ? <span className="text-muted/40 italic">null</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {step.result.length > 10 && (
                <p className="px-2 py-1 text-[10px] text-muted border-t border-line/50">
                  … and {step.result.length - 10} more rows
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-2 text-muted text-[11px]">No rows returned</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface border border-line rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-[11px] text-muted ml-1">Analyzing your data…</span>
      </div>
    </div>
  );
}
