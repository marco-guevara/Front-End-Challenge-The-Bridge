import { ClipLoader } from "react-spinners";

import styles from "./LoadingSpinner.module.css";

function LoadingSpinner({ label = "Cargando...", size = 22 }) {
  return (
    <span className={styles.loadingSpinner} role="status" aria-live="polite">
      <ClipLoader
        aria-hidden="true"
        color="var(--color-primary-soft)"
        loading
        size={size}
        speedMultiplier={0.85}
      />
      <span>{label}</span>
    </span>
  );
}

export default LoadingSpinner;
