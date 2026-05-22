import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthShell, StatusMessage } from "../Auth/AuthShell";
import api from "../../services/api";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/login", formData);
      setSuccess(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesion");
      setSuccess("");
    }
  };

  return (
    <AuthShell variant="login">
      <section className="w-full max-w-lg rounded-[1.35rem] border border-slate-200/10 bg-[#111a2d] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.38)] sm:p-12">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <label className="block space-y-3">
            <span className="text-sm font-semibold text-slate-300">
              Corporate ID / Email
            </span>
            <span className="flex h-16 items-center gap-4 rounded-[1.1rem] border border-slate-200/10 bg-[#080e1e] px-5 focus-within:border-cyan-300/45 focus-within:ring-2 focus-within:ring-cyan-300/10">
              <span aria-hidden="true" className="text-3xl text-cyan-50/75">
                @
              </span>
              <input
                autoComplete="email"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-cyan-50 outline-none placeholder:text-slate-500"
                name="email"
                onChange={handleChange}
                placeholder="Enter your credentials"
                required
                type="email"
                value={formData.email}
              />
            </span>
          </label>

          <label className="block space-y-3">
            <span className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-300">
              Security Key
              <button
                className="text-[#00cfe6] transition hover:text-cyan-100"
                type="button"
              >
                Reset access?
              </button>
            </span>
            <span className="flex h-16 items-center gap-4 rounded-[1.1rem] border border-slate-200/10 bg-[#080e1e] px-5 focus-within:border-cyan-300/45 focus-within:ring-2 focus-within:ring-cyan-300/10">
              <svg
                aria-hidden="true"
                className="shrink-0 text-cyan-50/75"
                fill="none"
                height="25"
                viewBox="0 0 24 24"
                width="25"
              >
                <path
                  d="M10 14a4 4 0 1 1 1.2-2.86H22v2.1h-2.2v2H17v-2h-2.35A4 4 0 0 1 10 14Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.9"
                />
              </svg>
              <input
                autoComplete="current-password"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-cyan-50 outline-none placeholder:text-slate-500"
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-cyan-50"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="23"
                  viewBox="0 0 24 24"
                  width="23"
                >
                  <path
                    d={
                      showPassword
                        ? "M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z"
                        : "m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.2A11 11 0 0 1 12 5c5.5 0 8.5 7 8.5 7a15.4 15.4 0 0 1-3 3.8M6.2 6.3C4.4 7.7 3.5 9.6 3.5 12c0 0 3 7 8.5 7a10 10 0 0 0 3.1-.5"
                    }
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.9"
                  />
                  {showPassword && (
                    <circle
                      cx="12"
                      cy="12"
                      r="2.7"
                      stroke="currentColor"
                      strokeWidth="1.9"
                    />
                  )}
                </svg>
              </button>
            </span>
          </label>

          <label className="flex w-fit items-center gap-4 text-sm font-semibold text-slate-300">
            <input
              className="h-6 w-6 rounded border-slate-200/20 bg-white accent-[#09d7ee]"
              defaultChecked
              type="checkbox"
            />
            Enforce session encryption
          </label>

          <button
            className="h-16 w-full rounded-[1.05rem] bg-[#0dd1e7] text-lg font-bold text-[#041827] shadow-[0_14px_36px_rgba(13,209,231,0.28)] transition hover:bg-[#42e4f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            type="submit"
          >
            Initialize Session
          </button>

          {(error || success) && (
            <div className="space-y-3">
              {error && <StatusMessage kind="error">{error}</StatusMessage>}
              {success && <StatusMessage kind="success">{success}</StatusMessage>}
            </div>
          )}
        </form>

        <div className="mt-9 border-t border-white/5 pt-8 text-center text-sm font-semibold text-slate-400">
          New to NovaPay?{" "}
          <Link className="text-[#00d7ee] transition hover:text-cyan-100" to="/register">
            Create Account
          </Link>
        </div>
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-11 gap-y-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        <span>Quantum-Safe</span>
        <span>Level 4 Vault</span>
      </footer>
    </AuthShell>
  );
}

export default Login;
