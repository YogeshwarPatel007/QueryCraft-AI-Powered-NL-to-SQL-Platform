import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import GoogleButton from "../components/GoogleButton";

function passwordStrength(pw) {
  if (!pw) return { label: "", width: "0%", color: "", score: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Weak", width: "25%", color: "bg-danger", score: 1 },
    { label: "Fair", width: "50%", color: "bg-warning", score: 2 },
    { label: "Good", width: "75%", color: "bg-info", score: 3 },
    { label: "Strong", width: "100%", color: "bg-teal", score: 4 },
  ];
  return levels[Math.max(0, score - 1)] || levels[0];
}

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const strength = passwordStrength(form.password);

  const checks = [
    { label: "At least 8 characters", pass: form.password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(form.password) },
    { label: "One number", pass: /[0-9]/.test(form.password) },
    { label: "One special character", pass: /[^A-Za-z0-9]/.test(form.password) },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup(form);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start asking your database questions in plain English."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-semibold hover:underline">Log in</Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 my-6">
        <span className="flex-1 h-px bg-line" />
        <span className="text-muted text-xs font-medium">or sign up with email</span>
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
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Full name</label>
          <input
            type="text"
            placeholder="Your name"
            className="w-full bg-ink border border-line rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
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

          {form.password && (
            <div className="mt-3 space-y-2.5">
              {/* Strength bar */}
              <div>
                <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className={`text-xs mt-1 font-medium ${
                  strength.score <= 1 ? "text-danger" :
                  strength.score === 2 ? "text-warning" :
                  strength.score === 3 ? "text-info" : "text-teal"
                }`}>{strength.label}</p>
              </div>

              {/* Password checks */}
              <div className="grid grid-cols-2 gap-1.5">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-center gap-1.5 text-xs">
                    {c.pass ? (
                      <svg className="w-3.5 h-3.5 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-line shrink-0" />
                    )}
                    <span className={c.pass ? "text-teal" : "text-muted"}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent-hover transition-all rounded-xl py-3 font-semibold text-sm text-white mt-1 disabled:opacity-50 shadow-sm hover:shadow-glow flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow" />
          )}
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-[11px] text-muted text-center leading-relaxed">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-accent hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>
  );
}