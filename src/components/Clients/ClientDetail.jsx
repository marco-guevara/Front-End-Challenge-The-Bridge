import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Ban, CheckCircle2, ShieldCheck, UserRound } from "lucide-react";

import {
  getClientById,
  getClientTransactions,
  updateClient,
} from "../../services/api";
import { confirmAction, showError, showSuccess } from "../../utils/alerts";
import {
  formatBoolean,
  formatCurrency,
  formatDateTime,
} from "../../utils/formatters";
import styles from "./Clients.module.css";

function getClientName(client) {
  return `${client?.nombre || client?.name || "Sin nombre"} ${client?.apellido || ""}`.trim();
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

    const willBlockClient = !client.bloqueado;
    const isConfirmed = await confirmAction({
      title: willBlockClient ? "¿Bloquear cliente?" : "¿Desbloquear cliente?",
      text: willBlockClient
        ? "El cliente no podrá operar hasta que la cuenta vuelva a revisarse."
        : "El cliente recuperará el acceso a su cuenta.",
      confirmButtonText: willBlockClient ? "Bloquear cliente" : "Desbloquear cliente",
      icon: willBlockClient ? "warning" : "question",
    });

    if (!isConfirmed) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updated = await updateClient(id, { bloqueado: !client.bloqueado });
      setClient(updated);
      const message = updated.bloqueado ? "Cliente bloqueado" : "Cliente desbloqueado";

      setSuccessMessage(message);
      await showSuccess("Cliente actualizado", message);
    } catch (err) {
      setError(err.message);
      await showError("No se actualizó el cliente", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Cargando cliente...</p>
      </main>
    );
  }

  if (error && !client) {
    return (
      <main className={styles.page}>
        <Link className={styles.backLink} to="/clients">
          Volver a clientes
        </Link>
        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link className={styles.backLink} to="/clients">
        Volver a clientes
      </Link>

      <section className={styles.profileHeader}>
        <div className={styles.avatar}>
          <UserRound aria-hidden="true" size={34} />
        </div>
        <div>
          <span className={styles.eyebrow}>Perfil de cliente</span>
          <h1>{getClientName(client)}</h1>
          <p>{client?.email || id}</p>
        </div>
        <span className={client?.bloqueado ? styles.blocked : styles.active}>
          {client?.bloqueado ? "Bloqueado" : "Activo"}
        </span>
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <section className={styles.statsGrid}>
        <article>
          <span>Últimas transacciones</span>
          <strong>{transactions.length}</strong>
        </article>
        <article>
          <span>Alertas de fraude</span>
          <strong>{stats.fraud}</strong>
        </article>
        <article>
          <span>Revisiones pendientes</span>
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <span>Volumen</span>
          <strong>{formatCurrency(stats.volume)}</strong>
        </article>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Detalle de cuenta</h2>
              <p>Contexto de riesgo usado por analistas antes de actuar.</p>
            </div>
            <ShieldCheck aria-hidden="true" size={22} />
          </div>

          <dl className={styles.detailList}>
            <div><dt>ID cliente</dt><dd>{id}</dd></div>
            <div><dt>DNI</dt><dd>{client?.dni || "-"}</dd></div>
            <div><dt>País</dt><dd>{client?.pais_emision || "-"}</dd></div>
            <div><dt>Antigüedad de cuenta</dt><dd>{client?.dias_antiguedad_cuenta ?? "-"} días</dd></div>
            <div><dt>Email verificado</dt><dd>{formatBoolean(client?.email_verificado)}</dd></div>
            <div><dt>3D Secure</dt><dd>{formatBoolean(client?.paso_3d_secure, "Superado", "No superado")}</dd></div>
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
            {saving ? "Guardando..." : client?.bloqueado ? "Desbloquear cliente" : "Bloquear cliente"}
          </button>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Últimas 5 transacciones</h2>
              <p>Actividad más reciente asociada a este cliente.</p>
            </div>
          </div>

          <div className={styles.miniTable}>
            {transactions.length === 0 ? (
              <p>No se encontraron transacciones</p>
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
                      <small>
                        {formatDateTime(transaction.fecha, transaction.hora)}
                      </small>
                    </span>
                    <span>{transaction.pais_pago || "-"}</span>
                    <strong>{formatCurrency(transaction.importe)}</strong>
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
