import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useDatabase } from "../hooks/useDatabase";
import { useAuth } from "../hooks/useAuth";
import { addConnection, testConnection, deleteConnection, updateConnectionInterval } from "../api/dbApi";
import { updateProfile, updatePassword } from "../api/authApi";

const emptyForm = { connection_name: "", host: "", port: 5432, db_name: "", username: "", password: "" };

const TABS = [
  { id: "profile", label: "Profile", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
  { id: "connections", label: "Connections", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  )},
  { id: "security", label: "Security", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )},
];

export default function Settings() {
  const { connections, refreshConnections, setActiveConnectionId } = useDatabase();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileStatus, setProfileStatus] = useState(null);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwStatus, setPwStatus] = useState(null);

  async function handleTest() {
    setStatus({ type: "loading", message: "Testing connection…" });
    setTesting(true);
    try {
      await testConnection(form);
      setStatus({ type: "success", message: "Connection successful!" });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.error || "Failed" });
    } finally {
      setTesting(false);
    }
  }

  async function handleAdd() {
    try {
      await addConnection(form);
      setForm(emptyForm);
      setStatus(null);
      refreshConnections();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.error || "Failed to add" });
    }
  }

  async function handleDelete(id) {
    await deleteConnection(id);
    refreshConnections();
  }

  function handleConnect(id) {
    setActiveConnectionId(id);
    navigate("/query");
  }

  async function handleIntervalChange(id, interval) {
    try {
      await updateConnectionInterval(id, interval);
      refreshConnections();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleProfileSave() {
    setProfileStatus({ type: "loading", message: "Saving…" });
    try {
      const res = await updateProfile(profileForm);
      setUser(res.data.user);
      setProfileStatus({ type: "success", message: "Profile updated successfully" });
    } catch (err) {
      setProfileStatus({ type: "error", message: err.response?.data?.error || "Failed to update" });
    }
  }

  async function handlePasswordSave() {
    setPwStatus({ type: "loading", message: "Saving…" });
    try {
      await updatePassword(pwForm);
      setPwForm({ currentPassword: "", newPassword: "" });
      setPwStatus({ type: "success", message: "Password updated successfully" });
    } catch (err) {
      setPwStatus({ type: "error", message: err.response?.data?.error || "Failed to update" });
    }
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen bg-surface text-text font-body">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-3xl">
        <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2.5">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </h2>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-ink border border-line rounded-xl p-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-text hover:bg-surface"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Profile Tab ─── */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fadeUp">
            {/* Avatar & name */}
            <div className="bg-ink border border-line rounded-2xl p-6 shadow-elevation-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                  {initial}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-text">{user?.name || "User"}</h3>
                  <p className="text-sm text-muted">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Full name" placeholder="Full name" value={profileForm.name}
                  onChange={(v) => setProfileForm({ ...profileForm, name: v })} />
                <Field label="Email address" placeholder="Email" value={profileForm.email}
                  onChange={(v) => setProfileForm({ ...profileForm, email: v })} />
              </div>

              <StatusMsg status={profileStatus} />

              <button onClick={handleProfileSave}
                className="bg-accent hover:bg-accent-hover transition-all text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow">
                Save profile
              </button>
            </div>
          </div>
        )}

        {/* ─── Connections Tab ─── */}
        {activeTab === "connections" && (
          <div className="space-y-6 animate-fadeUp">
            {/* Add connection */}
            <div className="bg-ink border border-line rounded-2xl p-6 shadow-elevation-1">
              <div className="flex items-center gap-2.5 mb-1">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <h3 className="font-display font-semibold text-[15px] text-text">Add Database Connection</h3>
              </div>
              <p className="text-xs text-muted mb-5 ml-7.5">
                Use a read-only database user (e.g. readonly_ai_user) — never your admin credentials.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Connection name" placeholder="My Database" value={form.connection_name}
                  onChange={(v) => setForm({ ...form, connection_name: v })} />
                <Field label="Host" placeholder="ep-xxxx.neon.tech" value={form.host}
                  onChange={(v) => setForm({ ...form, host: v })} />
                <Field label="Port" placeholder="5432" type="number" value={form.port}
                  onChange={(v) => setForm({ ...form, port: Number(v) })} />
                <Field label="Database name" placeholder="mydb" value={form.db_name}
                  onChange={(v) => setForm({ ...form, db_name: v })} />
                <Field label="Username" placeholder="readonly_ai_user" value={form.username}
                  onChange={(v) => setForm({ ...form, username: v })} />
                <Field label="Password" placeholder="••••••••" type="password" value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })} />
              </div>

              <StatusMsg status={status} />

              <div className="flex gap-3 mt-5">
                <button onClick={handleTest}
                  className="border border-line text-text px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-surface transition-colors flex items-center gap-2">
                  {testing ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin-slow" />
                      Testing…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                <button onClick={handleAdd}
                  className="bg-accent hover:bg-accent-hover transition-all text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Save Connection
                </button>
              </div>
            </div>

            {/* Saved connections */}
            <div>
              <h3 className="font-display font-semibold text-[15px] mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                </svg>
                Saved Connections
                <span className="text-xs bg-surface2 text-muted px-2 py-0.5 rounded-full font-medium">
                  {connections.length}
                </span>
              </h3>

              {connections.length === 0 ? (
                <div className="bg-ink border border-line rounded-2xl p-8 text-center shadow-elevation-1">
                  <p className="text-muted text-sm">No connections yet. Add one above to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((c) => (
                    <div key={c.id} className="bg-ink border border-line rounded-2xl p-5 shadow-elevation-1 hover-lift">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-teal" />
                            <p className="font-semibold text-text text-sm">{c.connection_name}</p>
                          </div>
                          <p className="text-muted text-xs font-mono ml-4">{c.host}:{c.port}/{c.db_name}</p>
                          <p className="text-[11px] text-muted mt-1.5 ml-4">
                            Added {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleConnect(c.id)}
                            className="text-xs text-accent font-medium px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            Connect
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="text-xs text-danger font-medium px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-line/50 flex items-center gap-2 text-xs">
                        <span className="text-muted">Check for issues every:</span>
                        <select
                          value={c.alert_check_interval_minutes || 1440}
                          onChange={(e) => handleIntervalChange(c.id, Number(e.target.value))}
                          className="bg-surface border border-line rounded-lg px-2 py-1 text-text focus:outline-none focus:border-accent transition-colors"
                        >
                          <option value={0}>Off (Disabled)</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={180}>3 hours</option>
                          <option value={360}>6 hours</option>
                          <option value={720}>12 hours</option>
                          <option value={1440}>24 hours</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Security Tab ─── */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fadeUp">
            <div className="bg-ink border border-line rounded-2xl p-6 shadow-elevation-1">
              <div className="flex items-center gap-2.5 mb-5">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <h3 className="font-display font-semibold text-[15px] text-text">Change Password</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Current password" placeholder="Enter current password" type="password" value={pwForm.currentPassword}
                  onChange={(v) => setPwForm({ ...pwForm, currentPassword: v })} />
                <Field label="New password" placeholder="Enter new password" type="password" value={pwForm.newPassword}
                  onChange={(v) => setPwForm({ ...pwForm, newPassword: v })} />
              </div>

              <StatusMsg status={pwStatus} />

              <button onClick={handlePasswordSave}
                className="bg-accent hover:bg-accent-hover transition-all text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow">
                Update password
              </button>
            </div>

            {/* Session info */}
            <div className="bg-ink border border-line rounded-2xl p-6 shadow-elevation-1">
              <h3 className="font-display font-semibold text-[15px] mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Session
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Auto-logout after inactivity</span>
                  <span className="text-text font-medium">30 minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Database credentials</span>
                  <span className="text-teal font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    AES-256 encrypted
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Query execution role</span>
                  <span className="text-teal font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Read-only (SELECT only)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div>
      {label && <label className="text-xs font-semibold text-text-secondary mb-1.5 block">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
      />
    </div>
  );
}

function StatusMsg({ status }) {
  if (!status) return null;
  return (
    <div className={`flex items-center gap-2 text-sm mb-3 py-2 px-3 rounded-lg ${
      status.type === "success" ? "bg-teal-light text-teal" :
      status.type === "error" ? "bg-danger-light text-danger" :
      "text-muted"
    }`}>
      {status.type === "success" && (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status.type === "error" && (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      {status.type === "loading" && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin-slow shrink-0" />
      )}
      {status.message}
    </div>
  );
}