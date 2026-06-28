import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAlerts, markAlertRead } from "../api/alertApi";

export default function AlertsPanel({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id, isRead) {
    if (isRead) return;
    try {
      await markAlertRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error(err);
    }
  }

  function handleDiscuss(alert) {
    onClose();
    // Pre-seed Analyst Chat with alert context
    navigate("/query", { 
      state: { 
        initialMessage: `Regarding the alert: "${alert.headline}". ${alert.explanation}`,
        connectionId: alert.db_connection_id 
      } 
    });
  }

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-line shadow-elevation-3 z-50 flex flex-col animate-slideLeft">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-ink">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h2 className="font-display font-semibold text-lg text-text">Alerts</h2>
            {alerts.filter(a => !a.is_read).length > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                {alerts.filter(a => !a.is_read).length} new
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin-slow" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center p-8">
              <svg className="w-12 h-12 text-muted/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p className="text-sm text-muted">No alerts yet.</p>
              <p className="text-xs text-muted/70 mt-1">We'll notify you when significant changes happen.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`bg-ink border rounded-xl overflow-hidden transition-colors ${
                  !alert.is_read ? "border-accent/50 shadow-sm" : "border-line"
                }`}
              >
                <div 
                  className={`p-4 cursor-pointer hover:bg-surface/50 transition-colors ${
                    !alert.is_read ? "bg-accent/5" : ""
                  }`}
                  onClick={() => {
                    handleMarkRead(alert.id, alert.is_read);
                    setExpandedId(expandedId === alert.id ? null : alert.id);
                  }}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {!alert.is_read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                      ) : (
                        <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!alert.is_read ? "font-semibold text-text" : "font-medium text-text-secondary"}`}>
                        {alert.headline}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted">
                        <span className="bg-surface2 px-1.5 py-0.5 rounded text-text-secondary truncate">
                          {alert.connection_name}
                        </span>
                        <span>•</span>
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <svg 
                        className={`w-4 h-4 text-muted transition-transform ${expandedId === alert.id ? "rotate-180" : ""}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedId === alert.id && (
                  <div className="px-4 pb-4 pt-1 bg-surface/30 border-t border-line/50 animate-slideDown">
                    <div className="text-sm text-text-secondary leading-relaxed space-y-3">
                      <div>
                        <strong className="text-xs text-text block mb-1">AI Explanation:</strong>
                        {alert.explanation}
                      </div>
                      
                      {alert.suggested_action && alert.suggested_action !== alert.explanation && (
                        <div className="bg-accent-light/30 border border-accent/20 rounded-lg p-3">
                          <strong className="text-xs text-accent flex items-center gap-1.5 mb-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.496 1.509 1.333 1.509 2.316V18" />
                            </svg>
                            Suggested Action
                          </strong>
                          <p className="text-xs text-text">{alert.suggested_action}</p>
                        </div>
                      )}

                      {alert.steps && alert.steps.length > 0 && (
                        <div>
                          <p className="text-xs text-muted mb-2 font-medium">Show my work ({alert.steps.length} queries):</p>
                          <div className="space-y-2">
                            {alert.steps.map((step, i) => (
                              <div key={i} className="bg-ink border border-line rounded p-2 text-[10px]">
                                <p className="font-semibold text-text mb-1">{step.subQuestion}</p>
                                <pre className="text-accent overflow-x-auto">{step.sql}</pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => handleDiscuss(alert)}
                        className="w-full mt-4 bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        Discuss this in Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
