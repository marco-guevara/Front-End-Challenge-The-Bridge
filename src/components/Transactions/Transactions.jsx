import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Search,
  SlidersHorizontal,
  User,
  UserCircle,
  Users,
} from "lucide-react";

import styles from "./Transactions.module.css";
import useAuth from "../../context/useAuth";
import {
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../../services/api";
import { confirmAction, showError, showSuccess } from "../../utils/alerts";
import {
  formatCurrency,
  formatDateTime,
  getTransactionScore,
} from "../../utils/formatters";
import {
  interactiveTap,
  staggerContainer,
  surfaceItem,
  tableRowItem,
} from "../../utils/motionPresets";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import AnimatedPage from "../Motion/AnimatedPage";

const navigationItems = [
  { label: "Panel", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Transacciones", icon: ListChecks, path: "/transactions" },
  { label: "Clientes", icon: Users, path: "/clients" },
];

function mapTransaction(transaction) {
  return {
    id: transaction.id_transaccion,
    time: formatDateTime(transaction.fecha, transaction.hora),
    timestamp: getTransactionTimestamp(transaction),
    userId: transaction.id_usuario,
    amount: formatCurrency(transaction.importe),
    country: transaction.pais_pago,
    score: getTransactionScore(transaction),
    isFraud: transaction.es_fraude,
    fraudReason: transaction.shap_reasons?.razones_fraude,
    legitReason: transaction.shap_reasons?.razones_legitima,
  };
}

function getTransactionTimestamp(transaction) {
  const date = parseTransactionDate(transaction.fecha);
  const time = parseTransactionTime(transaction.hora);

  return date && !Number.isNaN(date.getTime()) ? date.getTime() + time : time;
}

function parseTransactionDate(dateValue) {
  if (!dateValue) return null;

  if (dateValue instanceof Date) return dateValue;

  const normalizedDate = String(dateValue).trim();
  const dayFirstDate = normalizedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dayFirstDate) {
    const [, day, month, year] = dayFirstDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(normalizedDate);
}

function parseTransactionTime(hourValue) {
  if (hourValue === null || hourValue === undefined || hourValue === "") {
    return 0;
  }

  if (typeof hourValue === "number") {
    return hourValue * 60 * 60 * 1000;
  }

  const normalizedHour = String(hourValue).trim();
  const [hours = 0, minutes = 0, seconds = 0] = normalizedHour
    .split(":")
    .map(Number);

  if ([hours, minutes, seconds].some(Number.isNaN)) {
    return Number(normalizedHour || 0) * 60 * 60 * 1000;
  }

  return (
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000
  );
}

function getReasonList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(getReasonList);
  if (typeof value === "object") return Object.values(value).flatMap(getReasonList);

  return [String(value)];
}

function isPendingTransaction(transaction) {
  const reviewStatus = transaction.revisado ?? transaction.reviewed;

  if (reviewStatus === null || reviewStatus === undefined || reviewStatus === "") {
    return true;
  }

  if (typeof reviewStatus === "boolean") {
    return !reviewStatus;
  }

  return ["pendiente", "pending", "no revisado", "unreviewed"].includes(
    String(reviewStatus).trim().toLowerCase(),
  );
}

async function fetchTransactions(params = {}) {
  const transactions = await getTransactions({
    ...params,
    revisado: "Pendiente",
  });

  return transactions.filter(isPendingTransaction).map(mapTransaction);
}

function formatRole(role) {
  return role === "Analyst" ? "Analista" : role || "Analista";
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [fraudFilter, setFraudFilter] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const analyst = {
    name: user?.name || user?.email || "Analista",
    role: formatRole(user?.role),
  };
  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (transactionId.trim()) {
        const response = await getTransactionById(transactionId.trim());

        const transaction = Array.isArray(response) ? response[0] : response;

        setTransactions(
          transaction && isPendingTransaction(transaction)
            ? [mapTransaction(transaction)]
            : [],
        );
        setCurrentPage(1);
        setSelectedTransaction(null);
        return;
      }

      const params = {};

      if (fraudFilter !== "") {
        params.es_fraude = fraudFilter;
      }

      const mappedTransactions = await fetchTransactions(params);

      setTransactions(mappedTransactions);
      setCurrentPage(1);
      setSelectedTransaction(null);
    } catch {
      setError("No se pudieron cargar las transacciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    fetchTransactions()
      .then((mappedTransactions) => {
        if (ignore) return;

        setTransactions(mappedTransactions);
        setCurrentPage(1);
        setSelectedTransaction(null);
      })
      .catch(() => {
        if (!ignore) setError("No se pudieron cargar las transacciones");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const prioritizedTransactions = [...transactions].sort((a, b) => {
    return a.timestamp - b.timestamp;
  });

  const transactionsPerPage = 10;

  const totalPages = Math.ceil(
    prioritizedTransactions.length / transactionsPerPage,
  );

  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;

  const paginatedTransactions = prioritizedTransactions.slice(
    startIndex,
    endIndex,
  );

  const handleLogout = async () => {
    const isConfirmed = await confirmAction({
      title: "Cerrar sesión",
      text: "¿Seguro que quieres cerrar la sesión?",
      confirmButtonText: "Cerrar sesión",
      icon: "question",
      confirmButtonColor: "#7c3aed",
    });

    if (!isConfirmed) return;

    try {
      await logout();
      navigate("/login");
    } catch (err) {
      await showError("No se pudo cerrar la sesión", err.message);
    }
  };

  const handleReviewTransaction = async (reviewStatus) => {
    if (!selectedTransaction) return;

    const isFraudDecision = reviewStatus === "Fraude";
    const isConfirmed = await confirmAction({
      title: isFraudDecision ? "¿Marcar como fraude?" : "¿Aprobar transacción?",
      text: isFraudDecision
        ? "La transacción quedará revisada y marcada como fraude. Esta acción solo podrá cambiarse mediante soporte técnico."
        : "La transacción quedará revisada y marcada como no fraudulenta. Esta acción solo podrá cambiarse mediante soporte técnico.",
      confirmButtonText: isFraudDecision ? "Marcar fraude" : "Aprobar",
      icon: isFraudDecision ? "warning" : "question",
    });

    if (!isConfirmed) return;

    try {
      setIsReviewing(true);
      await updateTransaction(selectedTransaction.id, {
        revisado: "Revisado",
        es_fraude: isFraudDecision,
        auditor_fraude: isFraudDecision,
      });

      setError("");
      setTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction.id !== selectedTransaction.id,
        ),
      );

      setSelectedTransaction(null);
      await showSuccess(
        "Decisión guardada",
        isFraudDecision
          ? "Transacción marcada como fraude"
          : "Transacción aprobada",
      );
    } catch {
      setError("No se pudo actualizar la transacción");
      await showError(
        "No se guardó la decisión",
        "No se pudo actualizar la transacción",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const handleResetFilters = async () => {
    try {
      setIsLoading(true);
      setError("");

      setTransactions(await fetchTransactions());
      setFraudFilter("");
      setTransactionId("");
      setCurrentPage(1);
      setSelectedTransaction(null);
    } catch {
      setError("No se pudieron resetear los filtros");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img
            alt=""
            aria-hidden="true"
            className={styles.brandMark}
            src="/novapay-icon.png"
          />
          <div>
            <h1>NovaPay</h1>
            <span>Gestor de transacciones</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navigationItems.map(({ label, icon: Icon, path }) => (
            <button
              className={
                path === "/transactions" ? styles.activeNav : styles.navItem
              }
              key={label}
              onClick={() => navigate(path)}
              type="button"
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.analystCard}>
            <UserCircle aria-hidden="true" size={20} />
            <strong>{analyst.name}</strong>
            <span>{analyst.role}</span>
          </div>

          <button
            className={styles.logout}
            onClick={handleLogout}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <section className={styles.content}>
          <section className={styles.filterBar}>
            <label>
              <span>Fraude</span>
              <select
                value={fraudFilter}
                onChange={(e) => setFraudFilter(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </label>

            <label className={styles.searchField}>
              <span>ID de transacción</span>
              <div className={styles.searchInput}>
                <Search aria-hidden="true" size={16} />
                <input
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Buscar por ID de transacción"
                  type="text"
                  value={transactionId}
                />
              </div>
            </label>

            <button
              className={styles.primaryButton}
              onClick={loadTransactions}
              type="button"
            >
              <SlidersHorizontal aria-hidden="true" size={16} />
              Aplicar filtros
            </button>
            <button
              className={styles.secondaryButton}
              onClick={handleResetFilters}
              type="button"
            >
              Limpiar filtros
            </button>
          </section>

          <motion.section
            animate="show"
            className={styles.workspaceGrid}
            initial="hidden"
            variants={staggerContainer}
          >
            <motion.article className={styles.ledger} variants={surfaceItem}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Transacciones</h3>
                  <p className={styles.headerMeta}>
                    <span>Mostrando transacciones pendientes</span>
                    <strong>
                      {isLoading
                        ? "Cargando..."
                        : `${prioritizedTransactions.length.toLocaleString(
                            "es-ES",
                          )} pendientes`}
                    </strong>
                  </p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha y hora</th>
                      <th>Usuario</th>
                      <th>Importe</th>
                      <th>Puntuación</th>
                      <th>Fraude</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="6">
                          <LoadingSpinner label="Cargando transacciones..." />
                        </td>
                      </tr>
                    )}

                    {error && (
                      <tr>
                        <td colSpan="6">{error}</td>
                      </tr>
                    )}

                    {!isLoading &&
                      !error &&
                      paginatedTransactions.map((transaction) => (
                        <motion.tr
                          className={
                            selectedTransaction?.id === transaction.id
                              ? styles.selectedRow
                              : ""
                          }
                          key={transaction.id}
                          layout
                          onClick={() => setSelectedTransaction(transaction)}
                          variants={tableRowItem}
                        >
                          <td>{transaction.id}</td>
                          <td>{transaction.time}</td>
                          <td>
                            <strong>{transaction.userId}</strong>
                            <span>{transaction.country}</span>
                          </td>
                          <td className={styles.amount}>
                            {transaction.amount}
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                transaction.score >= 80 ? styles.redBadge : ""
                              }`}
                            >
                              {transaction.score}%
                            </span>
                          </td>
                          <td>{transaction.isFraud ? "Sí" : "No"}</td>
                        </motion.tr>
                      ))}

                    {!isLoading &&
                      !error &&
                      prioritizedTransactions.length === 0 && (
                        <tr>
                          <td colSpan="6">No hay transacciones</td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <button
                  aria-label="Ir a la primera página"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setSelectedTransaction(null);
                    setCurrentPage(1);
                  }}
                  type="button"
                >
                  <ChevronsLeft aria-hidden="true" size={16} />
                </button>

                <button
                  aria-label="Ir a la página anterior"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setSelectedTransaction(null);
                    setCurrentPage((page) => Math.max(1, page - 1));
                  }}
                  type="button"
                >
                  <ChevronLeft
                    aria-hidden="true"
                    className={styles.paginationIcon}
                    size={15}
                  />
                  <span className={styles.paginationButtonLabel}>
                    Anterior
                  </span>
                </button>

                <span>
                  <span className={styles.paginationFullLabel}>
                    Página {currentPage} de {totalPages || 1}
                  </span>
                  <span className={styles.paginationShortLabel}>
                    {currentPage}/{totalPages || 1}
                  </span>
                </span>

                <button
                  aria-label="Ir a la página siguiente"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => {
                    setSelectedTransaction(null);
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                  }}
                  type="button"
                >
                  <span className={styles.paginationButtonLabel}>
                    Siguiente
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={styles.paginationIcon}
                    size={15}
                  />
                </button>

                <button
                  aria-label="Ir a la última página"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => {
                    setSelectedTransaction(null);
                    setCurrentPage(totalPages);
                  }}
                  type="button"
                >
                  <ChevronsRight aria-hidden="true" size={16} />
                </button>
              </div>
            </motion.article>
            <motion.aside className={styles.reviewPanel} variants={surfaceItem}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Detalle de transacción</h3>
                  <p>
                    {selectedTransaction
                      ? `${selectedTransaction.id} seleccionada`
                      : "Selecciona una transacción"}
                  </p>
                </div>
                <span className={styles.livePill}>Revisión</span>
              </div>

              <div className={styles.scoreBlock}>
                <div>
                  <span>Puntuación de fraude</span>
                  <strong>
                    {selectedTransaction
                      ? `${selectedTransaction.score}%`
                      : "-"}
                  </strong>
                </div>
                <div
                  className={styles.scoreRing}
                  style={{
                    "--score": selectedTransaction
                      ? `${selectedTransaction.score}%`
                      : "0%",
                  }}
                >
                  {selectedTransaction ? selectedTransaction.score : "-"}
                </div>
              </div>

              <dl className={styles.detailList}>
                <div>
                  <dt>Motivo de fraude</dt>
                  <dd>
                    {getReasonList(selectedTransaction?.fraudReason).length > 0 ? (
                      <ul className={styles.reasonList}>
                        {getReasonList(selectedTransaction.fraudReason).map((reason, index) => (
                          <li key={`${reason}-${index}`}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Motivo legítimo</dt>
                  <dd>
                    {getReasonList(selectedTransaction?.legitReason).length > 0 ? (
                      <ul className={styles.reasonList}>
                        {getReasonList(selectedTransaction.legitReason).map((reason, index) => (
                          <li key={`${reason}-${index}`}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
              </dl>

              <div className={styles.detailActions}>
                <motion.button
                  {...interactiveTap}
                  type="button"
                  disabled={!selectedTransaction}
                  onClick={() => {
                    if (!selectedTransaction) return;
                    navigate(`/transactions/${selectedTransaction.id}`);
                  }}
                >
                  <ListChecks aria-hidden="true" size={14} />
                  Detalle
                </motion.button>

                <motion.button
                  {...interactiveTap}
                  type="button"
                  disabled={!selectedTransaction}
                  onClick={() => {
                    if (!selectedTransaction) return;
                    navigate(`/clients/${selectedTransaction.userId}`);
                  }}
                >
                  <User aria-hidden="true" size={14} />
                  Cliente
                </motion.button>

                <motion.button
                  {...interactiveTap}
                  className={styles.approveButton}
                  type="button"
                  disabled={
                    !selectedTransaction ||
                    selectedTransaction.isFraud ||
                    isReviewing
                  }
                  onClick={() => handleReviewTransaction("Aprobada")}
                >
                  {selectedTransaction?.isFraud ? "Ya es fraude" : "Aprobar"}
                </motion.button>

                <motion.button
                  {...interactiveTap}
                  className={styles.rejectButton}
                  type="button"
                  disabled={!selectedTransaction || isReviewing}
                  onClick={() => handleReviewTransaction("Fraude")}
                >
                  Marcar fraude
                </motion.button>
              </div>
            </motion.aside>
          </motion.section>
        </section>
      </main>
    </AnimatedPage>
  );
}

export default Transactions;
