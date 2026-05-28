import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import AnimatedPage from "../Motion/AnimatedPage";

import styles from "./AuthShell.module.css";

function BoltMark({ compact = false }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.boltMark} ${compact ? styles.boltMarkCompact : ""}`}
    >
      <img
        alt=""
        className={compact ? styles.boltIconCompact : ""}
        src="/novapay-icon.png"
      />
    </span>
  );
}

function AuthShell({ children }) {
  return (
    <AnimatedPage as="main" className={styles.shell}>
      <div className={`${styles.stage} ${styles.loginStage}`}>
        <header className={styles.loginHeader}>
          <BoltMark compact />
          <p className={styles.loginBrandName}>NovaPay</p>
          <p className={styles.grade}>Gestor de transacciones</p>
        </header>

        {children}
      </div>
    </AnimatedPage>
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

function LoadingSession() {
  return (
    <AuthShell>
      <StatusMessage kind="success">
        <LoadingSpinner label="Cargando sesión..." />
      </StatusMessage>
    </AuthShell>
  );
}

export { AuthShell, LoadingSession, StatusMessage };
