import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep asking your data questions."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent font-semibold hover:underline">Sign up</Link>
        </>
      }
    >
      <GoogleButton label="Continue with Google" />

      <div className="flex items-center gap-3 my-6">
        <span className="flex-1 h-px bg-line" />
        <span className="text-muted text-xs font-medium">or continue with email</span>
        <span className="flex-1 h-px bg-line" />
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-ink border border-line rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-text-secondary">Password</label>
            <button type="button" className="text-xs text-accent hover:underline font-medium">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-ink border border-line rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all pr-14 placeholder:text-muted"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs hover:text-text font-medium px-1.5 py-0.5 rounded hover:bg-surface transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent-hover transition-all rounded-xl py-3 font-semibold text-sm text-white mt-1 disabled:opacity-50 shadow-sm hover:shadow-glow flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
          )}
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}