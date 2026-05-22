import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthShell, StatusMessage } from "../Auth/AuthShell";
import api from "../../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [accountType, setAccountType] = useState("personal");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/register", formData);
      setSuccess(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar usuario");
      setSuccess("");
    }
  };

  return (
    <AuthShell variant="register">
      <section className="mx-auto w-full max-w-xl rounded-[1.35rem] border border-slate-200/10 bg-[#111a2d] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.32)] sm:p-12">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00cfe6]">
              Full Name
            </span>
            <span className="flex h-16 items-center gap-4 rounded-[1rem] bg-[#080e1e] px-5 ring-1 ring-white/5 focus-within:ring-cyan-300/35">
              <svg
                aria-hidden="true"
                className="text-cyan-50/75"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M20 20a8 8 0 0 0-16 0h16ZM15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <input
                autoComplete="name"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-cyan-50 outline-none placeholder:text-slate-500"
                name="name"
                onChange={handleChange}
                placeholder="Alexander Sterling"
                required
                type="text"
                value={formData.name}
              />
            </span>
          </label>

          <label className="block space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00cfe6]">
              Email Address
            </span>
            <span className="flex h-16 items-center gap-4 rounded-[1rem] bg-[#080e1e] px-5 ring-1 ring-white/5 focus-within:ring-cyan-300/35">
              <span aria-hidden="true" className="text-3xl text-cyan-50/75">
                @
              </span>
              <input
                autoComplete="email"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-cyan-50 outline-none placeholder:text-slate-500"
                name="email"
                onChange={handleChange}
                placeholder="a.sterling@novapay.io"
                required
                type="email"
                value={formData.email}
              />
            </span>
          </label>

          <label className="block space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00cfe6]">
              Account Type
            </span>
            <select
              className="h-16 w-full rounded-[1rem] bg-[#080e1e] px-5 text-base text-cyan-50 outline-none ring-1 ring-white/5 focus:ring-cyan-300/35"
              onChange={(event) => setAccountType(event.target.value)}
              value={accountType}
            >
              <option value="personal">Personal Account</option>
              <option value="business">Business Account</option>
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00cfe6]">
                Password
              </span>
              <input
                autoComplete="new-password"
                className="h-16 w-full rounded-[1rem] bg-[#080e1e] px-5 text-base text-cyan-50 outline-none ring-1 ring-white/5 placeholder:text-slate-500 focus:ring-cyan-300/35"
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type="password"
                value={formData.password}
              />
            </label>

            <label className="block space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00cfe6]">
                Confirm
              </span>
              <input
                autoComplete="new-password"
                className="h-16 w-full rounded-[1rem] bg-[#080e1e] px-5 text-base text-cyan-50 outline-none ring-1 ring-white/5 placeholder:text-slate-500 focus:ring-cyan-300/35"
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                type="password"
                value={formData.confirmPassword}
              />
            </label>
          </div>

          <div className="flex gap-4 rounded-[1rem] border border-cyan-300/10 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50/75">
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#00d7ee] text-xs font-black text-[#00d7ee]"
            >
              OK
            </span>
            <p>
              Account protected by NovaShield security monitoring and real-time
              threat detection.
            </p>
          </div>

          <button
            className="h-16 w-full rounded-[1rem] bg-[#0dd1e7] text-base font-black uppercase tracking-[0.24em] text-[#041827] shadow-[0_14px_36px_rgba(13,209,231,0.24)] transition hover:bg-[#42e4f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            type="submit"
          >
            Initialize Account
          </button>

          {(error || success) && (
            <div className="space-y-3">
              {error && <StatusMessage kind="error">{error}</StatusMessage>}
              {success && <StatusMessage kind="success">{success}</StatusMessage>}
            </div>
          )}
        </form>

        <div className="mt-9 border-t border-white/5 pt-8 text-center text-sm font-semibold text-slate-400">
          Already part of the network?{" "}
          <Link className="text-[#00d7ee] transition hover:text-cyan-100" to="/login">
            Sign In
          </Link>
        </div>
      </section>

      <footer className="mx-auto mt-9 flex w-full max-w-xl flex-wrap justify-center gap-x-10 gap-y-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        <span>PCI DSS Level 1</span>
        <span>Instant Settlement</span>
        <span>Global API 2.0</span>
      </footer>
    </AuthShell>
  );
}

export default Register;
