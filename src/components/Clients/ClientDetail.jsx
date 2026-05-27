import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Ban, CheckCircle2, ShieldCheck, UserRound } from "lucide-react";

import {
  getClientById,
  getClientTransactions,
  updateClient,
} from "../../services/api";
import styles from "./Clients.module.css";

function getClientName(client) {
  return `${client?.nombre || client?.name || "Unknown"} ${client?.apellido || ""}`.trim();
}

function getTransactionId(transaction) {
  return transaction.id_transaccion || transaction.id;
}

function getTransactionTimestamp(transaction) {
  const date = transaction.fecha ? new Date(transaction.fecha) : null;
  const time = Number(transaction.hora || 0) * 60 * 60 * 1000;

  return date && !Number.isNaN(date.getTime()) ? date.getTime() + time : time;
}

function isPendingReview(transaction) {
  return !transaction.revisado || transaction.revisado === "Pendiente";
}

function formatTransactionDate(transaction) {
  if (!transaction.fecha) return "-";

  const date = new Date(transaction.fecha);
  const formattedDate = Number.isNaN(date.getTime())
    ? transaction.fecha
    : date.toLocaleDateString();

  return transaction.hora !== undefined
    ? `${formattedDate} · ${transaction.hora}:00`
    : formattedDate;
}

function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([
      getClientById(id),
      getClientTransactions(id),
    ])
      .then(([clientData, transactionData]) => {
        if (ignore) return;
        setClient(clientData);
        const lastTransactions = Array.isArray(transactionData)
          ? [...transactionData]
              .sort(
                (firstTransaction, secondTransaction) =>
                  getTransactionTimestamp(secondTransaction) -
                  getTransactionTimestamp(firstTransaction),
              )
              .slice(0, 5)
          : [];

        setTransactions(lastTransactions);
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

  const stats = useMemo(() => {
    const fraud = transactions.filter((transaction) => transaction.es_fraude).length;
    const pending = transactions.filter(isPendingReview).length;
    const volume = transactions.reduce(
      (total, transaction) => total + Number(transaction.importe || 0),
      0,
    );

    return { fraud, pending, volume };
  }, [transactions]);

  const toggleBlock = async () => {
    if (!client) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updated = await updateClient(id, { bloqueado: !client.bloqueado });
      setClient(updated);
      setSuccessMessage(
        updated.bloqueado ? "Client blocked" : "Client unblocked",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading client...</p>
      </main>
    );
  }

  if (error && !client) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/clients">
        Back to clients
      </Link>

      <section className={styles.profileHeader}>
        <div className={styles.avatar}>
          <UserRound aria-hidden="true" size={34} />
        </div>
        <div>
          <span className={styles.eyebrow}>Client Profile</span>
          <h1>{getClientName(client)}</h1>
          <p>{client?.email || id}</p>
        </div>
        <span className={client?.bloqueado ? styles.blocked : styles.active}>
          {client?.bloqueado ? "Blocked" : "Active"}
        </span>
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <section className={styles.statsGrid}>
        <article>
          <span>Last transactions</span>
          <strong>{transactions.length}</strong>
        </article>
        <article>
          <span>Fraud flags</span>
          <strong>{stats.fraud}</strong>
        </article>
        <article>
          <span>Pending reviews</span>
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <span>Volume</span>
          <strong>€{stats.volume.toFixed(2)}</strong>
        </article>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Account Detail</h2>
              <p>Risk context used by analysts before taking action.</p>
            </div>
            <ShieldCheck aria-hidden="true" size={22} />
          </div>

          <dl className={styles.detailList}>
            <div><dt>Client ID</dt><dd>{id}</dd></div>
            <div><dt>DNI</dt><dd>{client?.dni || "-"}</dd></div>
            <div><dt>Country</dt><dd>{client?.pais_emision || "-"}</dd></div>
            <div><dt>Account age</dt><dd>{client?.dias_antiguedad_cuenta ?? "-"} days</dd></div>
            <div><dt>Email verified</dt><dd>{client?.email_verificado ? "Yes" : "No"}</dd></div>
            <div><dt>3D Secure</dt><dd>{client?.paso_3d_secure ? "Passed" : "Not passed"}</dd></div>
          </dl>

          <button
            className={client?.bloqueado ? styles.unblockButton : styles.blockButton}
            disabled={saving}
            onClick={toggleBlock}
            type="button"
          >
            {client?.bloqueado ? (
              <CheckCircle2 aria-hidden="true" size={16} />
            ) : (
              <Ban aria-hidden="true" size={16} />
            )}
            {saving ? "Saving..." : client?.bloqueado ? "Unblock Client" : "Block Client"}
          </button>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Last 5 Transactions</h2>
              <p>Most recent activity linked to this client.</p>
            </div>
          </div>

          <div className={styles.miniTable}>
            {transactions.length === 0 ? (
              <p>No transactions found</p>
            ) : (
              transactions.map((transaction) => {
                const transactionId = getTransactionId(transaction);

                return (
                  <Link
                    className={styles.transactionRow}
                    key={transactionId}
                    to={`/transactions/${transactionId}`}
                  >
                    <span>
                      <strong>{transaction.categoria || "-"}</strong>
                      <small>{formatTransactionDate(transaction)}</small>
                    </span>
                    <span>{transaction.pais_pago || "-"}</span>
                    <strong>€{Number(transaction.importe || 0).toFixed(2)}</strong>
                  </Link>
                );
              })
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

export default ClientDetail;
