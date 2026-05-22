import styles from "./AuthShell.module.css";

function BoltMark({ compact = false }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.boltMark} ${compact ? styles.boltMarkCompact : ""}`}
    >
      <svg
        className={compact ? styles.boltIconCompact : ""}
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
    <main className={styles.shell}>
      <div
        className={`${styles.stage} ${
          isRegister ? styles.registerStage : styles.loginStage
        }`}
      >
        {isRegister ? (
          <header className={styles.registerHeader}>
            <div className={styles.registerBrand}>
              <BoltMark />
              <p className={styles.brandName}>NovaPay</p>
            </div>
            <p className={styles.tagline}>
              Next-generation digital finance. Secure your future with electric
              precision.
            </p>
          </header>
        ) : (
          <header className={styles.loginHeader}>
            <BoltMark compact />
            <p className={styles.loginBrandName}>NovaPay</p>
            <p className={styles.grade}>
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
      className={`${styles.status} ${
        kind === "error" ? styles.errorStatus : styles.successStatus
      }`}
    >
      {children}
    </p>
  );
}

export { AuthShell, StatusMessage };
