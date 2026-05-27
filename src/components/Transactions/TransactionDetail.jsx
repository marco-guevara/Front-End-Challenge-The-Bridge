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
    </main>
  );
}

export default TransactionDetail;
