import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthShell, StatusMessage } from "../Auth/AuthShell";
// import api from "../../services/api";
import styles from "./Register.module.css";
import useAuth from "../../context/useAuth";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [accountType, setAccountType] = useState("personal");
  // const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {error, register, setError} = useAuth()

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await register(formData);
      setSuccess(response.message);
      setError("");
    } catch (err) {
      setSuccess("");
    }
  };

  return (
    <AuthShell variant="register">
      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>
              Full Name
            </span>
            <span className={styles.inputRow}>
              <svg
                aria-hidden="true"
                className={styles.fieldIcon}
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
                className={styles.input}
                name="name"
                onChange={handleChange}
                placeholder="Alexander Sterling"
                required
                type="text"
                value={formData.name}
              />
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Email Address
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
                placeholder="a.sterling@novapay.io"
                required
                type="email"
                value={formData.email}
              />
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Account Type
            </span>
            <select
              className={styles.select}
              onChange={(event) => setAccountType(event.target.value)}
              value={accountType}
            >
              <option value="personal">Personal Account</option>
              <option value="business">Business Account</option>
            </select>
          </label>

          <div className={styles.passwordFields}>
            <label className={styles.field}>
              <span className={styles.label}>
                Password
              </span>
              <input
                autoComplete="new-password"
                className={styles.passwordInput}
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type="password"
                value={formData.password}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Confirm
              </span>
              <input
                autoComplete="new-password"
                className={styles.passwordInput}
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                type="password"
                value={formData.confirmPassword}
              />
            </label>
          </div>

          <div className={styles.notice}>
            <span
              aria-hidden="true"
              className={styles.noticeMark}
            >
              OK
            </span>
            <p>
              Account protected by NovaShield security monitoring and real-time
              threat detection.
            </p>
          </div>

          <button
            className={styles.submitButton}
            type="submit"
          >
            Initialize Account
          </button>

          {(error || success) && (
            <div className={styles.messages}>
              {error && <StatusMessage kind="error">{error}</StatusMessage>}
              {success && <StatusMessage kind="success">{success}</StatusMessage>}
            </div>
          )}
        </form>

        <div className={styles.switchView}>
          Already part of the network?{" "}
          <Link className={styles.link} to="/login">
            Sign In
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>PCI DSS Level 1</span>
        <span>Instant Settlement</span>
        <span>Global API 2.0</span>
      </footer>
    </AuthShell>
  );
}

export default Register;
