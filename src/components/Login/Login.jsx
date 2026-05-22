import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthShell, StatusMessage } from "../Auth/AuthShell";
import api from "../../services/api";
import styles from "./Login.module.css";

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
      const response = await api.post("/api/auth/login", formData);
      setSuccess(response.data.message);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Ha ocurrido un error con la API.",
      );
      setSuccess("");
    }
  };

  return (
    <AuthShell variant="login">
      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>
              Corporate ID / Email
            </span>
            <span className={styles.inputRow}>
              <span aria-hidden="true" className={styles.atIcon}>
                @
              </span>
              <input
                autoComplete="email"
                className={styles.input}
                name="email"
                onChange={handleChange}
                placeholder="Enter your credentials"
                required
                type="email"
                value={formData.email}
              />
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.splitLabel}>
              Security Key
              <button
                className={styles.resetButton}
                type="button"
              >
                Reset access?
              </button>
            </span>
            <span className={styles.inputRow}>
              <svg
                aria-hidden="true"
                className={styles.keyIcon}
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
                className={styles.input}
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={styles.revealButton}
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

          <label className={styles.checkboxField}>
            <input
              className={styles.checkbox}
              defaultChecked
              type="checkbox"
            />
            Enforce session encryption
          </label>

          <button
            className={styles.submitButton}
            type="submit"
          >
            Initialize Session
          </button>

          {(error || success) && (
            <div className={styles.messages}>
              {error && <StatusMessage kind="error">{error}</StatusMessage>}
              {success && <StatusMessage kind="success">{success}</StatusMessage>}
            </div>
          )}
        </form>

        <div className={styles.switchView}>
          New to NovaPay?{" "}
          <Link className={styles.link} to="/register">
            Create Account
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Quantum-Safe</span>
        <span>Level 4 Vault</span>
      </footer>
    </AuthShell>
  );
}

export default Login;
