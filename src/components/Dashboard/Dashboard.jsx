import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CircleDot,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Triangle,
  User,
  UserCircle,
  Users,
} from "lucide-react";

import styles from "./Dashboard.module.css";
import useAuth from "../../context/useAuth";
import { getDashboardStats, getTransactions } from "../../services/api";
import { confirmAction, showError } from "../../utils/alerts";
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
const DASHBOARD_TRANSACTION_LIMIT = 1000;

// Normaliza la respuesta de la API al formato que usa la tabla del dashboard.
function mapPendingTransaction(transaction) {
  return {
    id: transaction.id_transaccion,
    time: formatDateTime(transaction.fecha, transaction.hora),
    customer: transaction.id_usuario,
    userId: transaction.id_usuario,
    amount: formatCurrency(transaction.importe),
    country: transaction.pais_pago,
    score: getTransactionScore(transaction),
    fraudReason: transaction.shap_reasons?.razones_fraude,
    legitReason: transaction.shap_reasons?.razones_legitima,
  };
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

function getTransactionTimestamp(transaction) {
  const date = transaction.fecha ? new Date(transaction.fecha) : null;
  const time = Number(transaction.hora || 0) * 60 * 60 * 1000;

  return date && !Number.isNaN(date.getTime()) ? date.getTime() + time : time;
}

function formatRole(role) {
  return role === "Analyst" ? "Analista" : role || "Analista";
}

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const analyst = {
    name: user?.name || user?.email || "Analista",
    role: formatRole(user?.role),
  };
  // Recarga stats y transacciones pendientes cada vez que se entra al dashboard.
  // Revisiones pendientes se calcula desde la lista filtrada porque el endpoint de stats
  // puede no reflejar inmediatamente las transacciones recién revisadas.
  useEffect(() => {
    let ignore = false;

    const loadDashboardData = async () => {
      setIsLoading(true);
      setStatsError("");
      setTransactionsError("");
      setPendingCount(null);

      try {
        const [statsData, transactionsData] = await Promise.all([
          getDashboardStats(),
          getTransactions({
            limite: DASHBOARD_TRANSACTION_LIMIT,
            revisado: "Pendiente",
          }),
        ]);
        if (ignore) return;

        const pendingTransactions = [...transactionsData]
          .filter(isPendingTransaction)
          .sort(
            (firstTransaction, secondTransaction) =>
              getTransactionTimestamp(secondTransaction) -
              getTransactionTimestamp(firstTransaction),
          )
          .map(mapPendingTransaction);

        setDashboardStats(statsData);
        setPendingCount(pendingTransactions.length);
        setTransactions(pendingTransactions.slice(0, 100));
        setSelectedTransaction(null);
        setCurrentPage(1);
      } catch {
        if (ignore) return;

        setStatsError("No se pudieron cargar las estadísticas del dashboard");
        setTransactionsError("No se pudieron cargar las transacciones");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, [location.key]);

  // Tarjetas superiores del dashboard.
  const stats = [
    {
      icon: CircleDot,
      label: "Revisiones pendientes",
      value: pendingCount ?? "-",
      detail: "Pendientes",
    },
    {
      icon: Triangle,
      label: "Transacciones limpias",
      value: dashboardStats?.clean ?? 0,
      detail: "Limpias",
    },
    {
      icon: AlertTriangle,
      label: "Transacciones fraudulentas",
      value: dashboardStats?.fraud ?? 0,
      detail: "Fraude",
      danger: true,
    },
    {
      icon: Gauge,
      label: "Total de transacciones",
      value: dashboardStats?.total ?? 0,
      detail: "Total",
      success: true,
    },
  ];

  const transactionsPerPage = 5;

  // Paginación de la tabla de pendientes.
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;

  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  const hasNoPendingTransactions = transactions.length === 0;

  // Cierra la sesión del analista y vuelve al login.
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
          {navigationItems.map(({ label, icon: Icon, path }, index) => (
            <button
              className={index === 0 ? styles.activeNav : styles.navItem}
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
          <section className={styles.statsSection}>
            {statsError && <p className={styles.errorMessage}>{statsError}</p>}
            <motion.section
              animate="show"
              className={styles.statsGrid}
              initial="hidden"
              variants={staggerContainer}
            >
              {stats.map((stat) => (
                <motion.article
                  className={`${styles.statCard} ${stat.danger ? styles.dangerCard : ""}`}
                  key={stat.label}
                  variants={surfaceItem}
                >
                  <div className={styles.statTop}>
                    <span className={styles.statIcon}>
                      <stat.icon aria-hidden="true" size={22} />
                    </span>
                    <span
                      className={
                        stat.success
                          ? styles.green
                          : stat.danger
                            ? styles.red
                            : styles.cyan
                      }
                    >
                      {stat.detail}
                    </span>
                  </div>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </motion.article>
              ))}
            </motion.section>
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
                  <h3>Últimas 100 transacciones pendientes</h3>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha y hora</th>
                      <th>Cliente</th>
                      <th>Importe</th>
                      <th>Puntuación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="5">
                          <LoadingSpinner label="Cargando transacciones..." />
                        </td>
                      </tr>
                    )}

                    {transactionsError && (
                      <tr>
                        <td colSpan="5">{transactionsError}</td>
                      </tr>
                    )}
                    {!isLoading &&
                      !transactionsError &&
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
                            <strong>{transaction.customer}</strong>
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
                        </motion.tr>
                      ))}

                    {!isLoading && !transactionsError && hasNoPendingTransactions && (
                      <tr>
                        <td colSpan="5">
                          No hay transacciones pendientes por revisión.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  type="button"
                >
                  Anterior
                </button>

                <span>
                  Página {currentPage} de {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  type="button"
                >
                  Siguiente
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
                <span className={styles.livePill}>Vista previa</span>
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
              </div>
            </motion.aside>
          </motion.section>
        </section>
      </main>
    </AnimatedPage>
  );
}

export default Dashboard;
