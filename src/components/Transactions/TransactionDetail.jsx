import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  CalendarClock,
  CreditCard,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";

import { getTransactionById, updateTransaction } from "../../services/api";
import styles from "./TransactionDetail.module.css";

function normalizeTransaction(data) {
  const payload = data?.data || data?.transaction || data?.transaccion || data;

  return Array.isArray(payload) ? payload[0] : payload;
}

function formatDateTime(transaction) {
  if (!transaction?.fecha) return "-";

  const date = new Date(transaction.fecha);
  const formattedDate = Number.isNaN(date.getTime())
    ? transaction.fecha
    : date.toLocaleDateString();

  return transaction.hora !== undefined
    ? `${formattedDate} · ${transaction.hora}:00`
    : formattedDate;
}

function parseJsonValue(value) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStructuredExplainability(explainability) {
  const parsedExplainability = parseJsonValue(explainability);

  return Boolean(
    isPlainObject(parsedExplainability) &&
      (parsedExplainability.razones_fraude ||
        parsedExplainability.razones_legitima ||
        parsedExplainability.razones_legitimas ||
        parsedExplainability.explicacion ||
        parsedExplainability.explanation ||
        parsedExplainability.nivel ||
        parsedExplainability.score),
  );
}

function getStructuredExplainability(transaction) {
  const candidates = [
    transaction.shap_reasons,
    transaction.explicabilidad,
    transaction.explainability,
    transaction.explainability_data,
  ];

  return (
    candidates.map(parseJsonValue).find(hasStructuredExplainability) || null
  );
}

function getReasonList(value) {
  const parsedValue = parseJsonValue(value);

  if (!parsedValue) return [];
  if (Array.isArray(parsedValue)) return parsedValue.flatMap(getReasonList);
  if (!isPlainObject(parsedValue)) return [String(parsedValue)];

  return Object.entries(parsedValue).map(([key, itemValue]) =>
    typeof itemValue === "string" || typeof itemValue === "number"
      ? `${key}: ${itemValue}`
      : key,
  );
}

function displayValue(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function displayBoolean(value) {
  if (value === null || value === undefined) return "-";
  return value ? "Yes" : "No";
}

function TransactionDetail() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [decisionMessage, setDecisionMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    getTransactionById(id)
      .then((data) => {
        if (!ignore) setTransaction(normalizeTransaction(data));
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const saveDecision = async (payload, message, loadingKey, localPatch = payload) => {
    try {
      setDecisionLoading(loadingKey);
      setDecisionError("");
      setDecisionMessage("");

      const updatedTransaction = normalizeTransaction(
        await updateTransaction(transaction.id_transaccion || id, payload),
      );

      setTransaction((currentTransaction) => {
        if (!isPlainObject(updatedTransaction)) {
          return { ...currentTransaction, ...localPatch };
        }

        return {
          ...currentTransaction,
          ...localPatch,
          ...updatedTransaction,
        };
      });
      setDecisionMessage(message);
    } catch (err) {
      setDecisionError(err.message);
    } finally {
      setDecisionLoading("");
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading transaction...</p>
      </main>
    );
  }

  if (error || !transaction) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error || "Transaction not found"}</p>
      </main>
    );
  }

  const score = Math.min(
    100,
    Math.max(0, Math.round(Number(transaction.f_score || 0) * 100)),
  );
  const amount = Number(transaction.importe || 0).toFixed(2);
  const structuredExplainability = getStructuredExplainability(transaction);
  const fraudReasons = getReasonList(structuredExplainability?.razones_fraude);
  const legitReasons = getReasonList(
    structuredExplainability?.razones_legitima ||
      structuredExplainability?.razones_legitimas,
  );
  const explanationText =
    structuredExplainability?.explicacion ||
    structuredExplainability?.explanation ||
    structuredExplainability?.resumen ||
    structuredExplainability?.summary ||
    "";

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/transactions">Transactions</Link>
        <span>/</span>
        <strong>{String(id).slice(0, 12)}...</strong>
      </nav>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Advanced Review</span>
          <h1>Transaction Detail</h1>
          <p>
            <span>{transaction.id_transaccion || id}</span>
            <span>{formatDateTime(transaction)}</span>
            <span>€{amount}</span>
          </p>
        </div>

        <div className={styles.badges}>
          <span className={transaction.es_fraude ? styles.dangerBadge : styles.successBadge}>
            {transaction.es_fraude ? "Fraud Detected" : "No Fraud"}
          </span>
          <span className={styles.warningBadge}>{transaction.revisado || "Pending"}</span>
        </div>
      </section>

      <section className={styles.actionBar}>
        <button
          className={styles.approveButton}
          disabled={Boolean(decisionLoading)}
          onClick={() =>
            saveDecision(
              { es_fraude: false, revisado: "Revisado", auditor_fraude: false },
              "Transaction approved",
              "approve",
              {
                es_fraude: false,
                revisar: false,
                revisado: "Revisado",
                auditor_fraude: false,
              },
            )
          }
          type="button"
        >
          <CheckCircle2 aria-hidden="true" size={16} />
          {decisionLoading === "approve" ? "Approving..." : "Approve Transaction"}
        </button>
        <button
          className={styles.rejectButton}
          disabled={Boolean(decisionLoading)}
          onClick={() =>
            saveDecision(
              { es_fraude: true, revisado: "Revisado", auditor_fraude: true },
              "Transaction marked as fraud",
              "fraud",
              {
                es_fraude: true,
                revisar: false,
                revisado: "Revisado",
                auditor_fraude: true,
              },
            )
          }
          type="button"
        >
          <XCircle aria-hidden="true" size={16} />
          {decisionLoading === "fraud" ? "Saving..." : "Mark as Fraud"}
        </button>
        <Link className={styles.clientButton} to={`/clients/${transaction.id_usuario}`}>
          <UserRound aria-hidden="true" size={16} />
          View Client
        </Link>
      </section>

      {(decisionMessage || decisionError) && (
        <p
          className={
            decisionError ? styles.decisionError : styles.decisionFeedback
          }
        >
          {decisionError || decisionMessage}
        </p>
      )}

      <section className={styles.riskGrid}>
        <article className={styles.scoreCard}>
          <div
            className={styles.scoreRing}
            style={{ "--score": `${score}%` }}
          >
            <span>{score}%</span>
          </div>
          <p>Fraud Score</p>

          <dl className={styles.scoreFacts}>
            <div>
              <dt>Is Fraud</dt>
              <dd>{transaction.es_fraude ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt>Needs Review</dt>
              <dd>{transaction.revisar ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{displayValue(transaction.categoria)}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>€{amount}</dd>
            </div>
          </dl>
        </article>

        <article className={styles.explainabilityCard}>
          <div className={styles.cardTitle}>
            <h2>Explainability</h2>
            <p>Model signals that influenced this fraud score.</p>
          </div>

          {structuredExplainability ? (
            <div className={styles.explainabilitySummary}>
              <div className={styles.explainabilityMetrics}>
                <div>
                  <span>Risk level</span>
                  <strong>{displayValue(structuredExplainability.nivel)}</strong>
                </div>
                <div>
                  <span>Model score</span>
                  <strong>{displayValue(structuredExplainability.score)}</strong>
                </div>
              </div>

              <div className={styles.reasonColumns}>
                <section>
                  <h3>Fraud reasons</h3>
                  {fraudReasons.length === 0 ? (
                    <p>No fraud reasons available</p>
                  ) : (
                    <ul>
                      {fraudReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h3>Legitimate reasons</h3>
                  {legitReasons.length === 0 ? (
                    <p>No legitimate reasons available</p>
                  ) : (
                    <ul>
                      {legitReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {explanationText && (
                <section className={styles.explanationText}>
                  <h3>API explanation</h3>
                  <p>{explanationText}</p>
                </section>
              )}
            </div>
          ) : (
            <p className={styles.emptyState}>No explainability data available</p>
          )}
        </article>
      </section>

      <section className={styles.summaryGrid}>
        <article>
          <ShieldAlert aria-hidden="true" size={22} />
          <span>Fraud Score</span>
          <strong>{score}%</strong>
        </article>
        <article>
          <CreditCard aria-hidden="true" size={22} />
          <span>Payment Country</span>
          <strong>{transaction.pais_pago || "-"}</strong>
        </article>
        <article>
          <CalendarClock aria-hidden="true" size={22} />
          <span>Category</span>
          <strong>{transaction.categoria || "-"}</strong>
        </article>
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <h2>General Information</h2>
          <dl>
            <div><dt>Transaction ID</dt><dd>{transaction.id_transaccion || id}</dd></div>
            <div><dt>User ID</dt><dd>{transaction.id_usuario || "-"}</dd></div>
            <div><dt>Date</dt><dd>{formatDateTime(transaction)}</dd></div>
            <div><dt>Amount</dt><dd>€{amount}</dd></div>
            <div><dt>Category</dt><dd>{displayValue(transaction.categoria)}</dd></div>
            <div><dt>Hour</dt><dd>{transaction.hora !== undefined ? `${transaction.hora}:00` : "-"}</dd></div>
          </dl>
        </article>

        <article className={styles.infoCard}>
          <h2>Payment Information</h2>
          <dl>
            <div><dt>Payment Country</dt><dd>{displayValue(transaction.pais_pago)}</dd></div>
            <div><dt>Card Type</dt><dd>{displayValue(transaction.tipo_tarjeta)}</dd></div>
            <div><dt>Online</dt><dd>{displayBoolean(transaction.es_online)}</dd></div>
            <div><dt>Same Shipping/Billing</dt><dd>{displayBoolean(transaction.mismo_envio_facturacion)}</dd></div>
            <div><dt>VPN/Proxy</dt><dd>{displayBoolean(transaction.uso_vpn_proxy)}</dd></div>
            <div><dt>3D Secure</dt><dd>{displayBoolean(transaction.paso_3d_secure)}</dd></div>
          </dl>
        </article>

        <article className={styles.infoCard}>
          <h2>Device and Account</h2>
          <dl>
            <div><dt>Device Type</dt><dd>{displayValue(transaction.tipo_dispositivo)}</dd></div>
            <div><dt>Min Since Last TX</dt><dd>{transaction.minutos_desde_ultima_tx ?? "-"} min</dd></div>
            <div><dt>Account Age</dt><dd>{transaction.dias_antiguedad_cuenta ?? "-"} days</dd></div>
            <div><dt>Email Verified</dt><dd>{displayBoolean(transaction.email_verificado)}</dd></div>
            <div><dt>Issuing Country</dt><dd>{displayValue(transaction.pais_emision)}</dd></div>
          </dl>
        </article>
      </section>
    </main>
  );
}

export default TransactionDetail;
