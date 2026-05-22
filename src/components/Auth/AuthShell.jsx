function BoltMark({ compact = false }) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center border border-cyan-100/15 bg-[#1b263b] text-[#09d7ee] shadow-[0_0_24px_rgba(0,215,238,0.14)] ${
        compact
          ? "h-14 w-14 rotate-12 rounded-[1.15rem]"
          : "h-12 w-12 rounded-2xl"
      }`}
    >
      <svg
        className={compact ? "-rotate-12" : ""}
        fill="none"
        height="25"
        viewBox="0 0 24 24"
        width="25"
      >
        <path
          d="M13.4 2.75 5.9 13.3h5.35l-.7 7.95 7.55-11.1h-5.25l.55-7.4Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2.1"
        />
      </svg>
    </span>
  );
}

function AuthShell({ children, variant }) {
  const isRegister = variant === "register";

  return (
    <main className="min-h-svh overflow-hidden bg-[#090f1f] text-[#dce7f2]">
      <div
        className={`mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 ${
          isRegister
            ? "justify-center py-8 sm:px-8"
            : "items-center justify-center py-10 sm:px-8"
        }`}
      >
        {isRegister ? (
          <header className="mx-auto mb-9 w-full max-w-xl">
            <div className="mb-5 flex items-center gap-4">
              <BoltMark />
              <p className="text-[1.7rem] font-semibold text-cyan-50">NovaPay</p>
            </div>
            <p className="max-w-sm text-base leading-7 text-cyan-50/85">
              Next-generation digital finance. Secure your future with electric
              precision.
            </p>
          </header>
        ) : (
          <header className="mb-12 flex flex-col items-center text-center">
            <BoltMark compact />
            <p className="mt-8 text-3xl font-semibold text-cyan-50">NovaPay</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.28em] text-[#00c8df]">
              Institutional Grade
            </p>
          </header>
        )}

        {children}
      </div>
    </main>
  );
}

function StatusMessage({ kind, children }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${
        kind === "error"
          ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
          : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      }`}
    >
      {children}
    </p>
  );
}

export { AuthShell, StatusMessage };
