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

import { getTransactionById } from "../../services/api";
import styles from "./TransactionDetail.module.css";

function normalizeTransaction(data) {
  return Array.isArray(data) ? data[0] : data;
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

function getShapReasons(transaction) {
  return transaction.shap_reasons || transaction.shapReasons || transaction.explainability || [];
}

function getReasonLabel(reason, index) {
  return reason.feature || reason.caracteristica || reason.nombre || `Feature ${index + 1}`;
}

function getReasonImpact(reason) {
  return Number(reason.impacto ?? reason.valor ?? reason.value ?? 0);
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

  const score = Math.round(Number(transaction.f_score || 0) * 100);
  const amount = Number(transaction.importe || 0).toFixed(2);
  const shapReasons = getShapReasons(transaction);
  const maxImpact = Math.max(
    1,
    ...shapReasons.map((reason) => Math.abs(getReasonImpact(reason))),
  );

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/transactions">Transactions</Link>
        <span>/</span>
        <strong>{id.slice(0, 12)}...</strong>
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
          <span className={styles.infoBadge}>
            Auditor: {transaction.analista || "Pending"}
          </span>
        </div>
      </section>

      <section className={styles.actionBar}>
        <button className={styles.approveButton} type="button">
          <CheckCircle2 aria-hidden="true" size={16} />
          Approve Transaction
        </button>
        <button className={styles.rejectButton} type="button">
          <XCircle aria-hidden="true" size={16} />
          Mark as Fraud
        </button>
        <Link className={styles.clientButton} to={`/clients/${transaction.id_usuario}`}>
          <UserRound aria-hidden="true" size={16} />
          View Client
        </Link>
      </section>

      <section className={styles.riskGrid}>
        <article className={styles.scoreCard}>
          <div className={styles.scoreRing}>
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
              <dt>Fraud Type</dt>
              <dd>{transaction.tipo_fraude || "-"}</dd>
            </div>
            <div>
              <dt>Analyst</dt>
              <dd>{transaction.analista || "-"}</dd>
            </div>
          </dl>
        </article>

        <article className={styles.explainabilityCard}>
          <div className={styles.cardTitle}>
            <h2>Explainability</h2>
            <p>Model signals that influenced this fraud score.</p>
          </div>

          {shapReasons.length === 0 ? (
            <p className={styles.emptyState}>No explainability data available</p>
          ) : (
            <div className={styles.shapList}>
              <div className={styles.shapLegend}>
                <span className={styles.legit}>Legitimate</span>
                <span className={styles.fraud}>Fraud</span>
              </div>

              {shapReasons.map((reason, index) => {
                const impact = getReasonImpact(reason);
                const width = `${Math.max(8, (Math.abs(impact) / maxImpact) * 100)}%`;
                const isFraudSignal = impact > 0;

                return (
                  <div className={styles.shapRow} key={getReasonLabel(reason, index)}>
                    <span>{getReasonLabel(reason, index)}</span>
                    <div className={styles.shapTrack}>
                      <div
                        className={isFraudSignal ? styles.fraudBar : styles.legitBar}
                        style={{ width }}
                      />
                    </div>
                    <strong className={isFraudSignal ? styles.fraud : styles.legit}>
                      {impact.toFixed(4)}
                    </strong>
                  </div>
                );
              })}
            </div>
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
