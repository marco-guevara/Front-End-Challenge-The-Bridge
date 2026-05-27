import { useEffect, useState } from "react";
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
import { api } from "../../services/api";
import { confirmAction, showError } from "../../utils/alerts";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Transactions", icon: ListChecks, path: "/transactions" },
  { label: "Users", icon: Users, path: "/clients" },
];

// Normaliza la respuesta de la API al formato que usa la tabla del dashboard.
function mapPendingTransaction(transaction) {
  return {
    id: transaction.id_transaccion,
    time: `${transaction.hora}:00`,
    customer: transaction.id_usuario,
    userId: transaction.id_usuario,
    amount: Number(transaction.importe).toFixed(2),
    country: transaction.pais_pago,
    score: Math.round(Number(transaction.f_score) * 100),
    fraudReason: transaction.shap_reasons?.razones_fraude,
    legitReason: transaction.shap_reasons?.razones_legitima,
  };
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
    name: user?.name || user?.email || "Analyst",
    role: user?.role || "Analyst",
  };

  // Recarga stats y transacciones pendientes cada vez que se entra al dashboard.
  // Pending Reviews se calcula desde la lista filtrada porque el endpoint de stats
  // puede no reflejar inmediatamente las transacciones recién revisadas.
  useEffect(() => {
    let ignore = false;

    const loadDashboardData = async () => {
      setIsLoading(true);
      setStatsError("");
      setTransactionsError("");
      setPendingCount(null);

      try {
        const [statsResponse, transactionsResponse] = await Promise.all([
          api.get("/trans/stats/dashboard"),
          api.get("/trans", {
            params: {
              limite: 50000,
              revisado: "Pendiente",
            },
          }),
        ]);
        if (ignore) return;

        const pendingTransactions =
          transactionsResponse.data.map(mapPendingTransaction);

        setDashboardStats(statsResponse.data);
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
      label: "Pending Reviews",
      value: pendingCount ?? "-",
      detail: "Pending",
    },
    {
      icon: Triangle,
      label: "Clean Transactions",
      value: dashboardStats?.clean ?? 0,
      detail: "Clean",
    },
    {
      icon: AlertTriangle,
      label: "Fraud Transactions",
      value: dashboardStats?.fraud ?? 0,
      detail: "Fraud",
      danger: true,
    },
    {
      icon: Gauge,
      label: "Total Transactions",
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

  // Cierra la sesión del analista y vuelve al login.
  const handleLogout = async () => {
    const isConfirmed = await confirmAction({
      title: "Cerrar sesión",
      text: "¿Está segur@ de que quiere cerrar la sesión?",
      confirmButtonText: "Cerrar sesión",
      icon: "question",
      confirmButtonColor: "#0dd1e7",
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
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>N</span>
          <div>
            <h1>NovaPay</h1>
            <span>Transaction Manager</span>
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
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <section className={styles.content}>
          <section className={styles.statsSection}>
            {statsError && <p className={styles.errorMessage}>{statsError}</p>}
            <section className={styles.statsGrid}>
              {stats.map((stat) => (
                <article
                  className={`${styles.statCard} ${stat.danger ? styles.dangerCard : ""}`}
                  key={stat.label}
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
                </article>
              ))}
            </section>
          </section>
          <section className={styles.workspaceGrid}>
            <article className={styles.ledger}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Last 100 Pending Transactions</h3>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Time</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="5">Cargando transacciones...</td>
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
                        <tr
                          className={
                            selectedTransaction?.id === transaction.id
                              ? styles.selectedRow
                              : ""
                          }
                          key={transaction.id}
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <td>{transaction.id}</td>
                          <td>{transaction.time}</td>
                          <td>
                            <strong>{transaction.customer}</strong>
                            <span>{transaction.country}</span>
                          </td>
                          <td className={styles.amount}>
                            €{transaction.amount}
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
                        </tr>
                      ))}
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
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  type="button"
                >
                  Next
                </button>
              </div>
            </article>

            <aside className={styles.reviewPanel}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Transaction Detail</h3>
                  <p>
                    {selectedTransaction
                      ? `${selectedTransaction.id} selected`
                      : "Select a transaction"}
                  </p>
                </div>
                <span className={styles.livePill}>Preview</span>
              </div>

              <div className={styles.scoreBlock}>
                <div>
                  <span>Fraud score</span>
                  <strong>
                    {selectedTransaction
                      ? `${selectedTransaction.score}%`
                      : "-"}
                  </strong>
                </div>
                <div className={styles.scoreRing}>
                  {selectedTransaction ? selectedTransaction.score : "-"}
                </div>
              </div>

              <dl className={styles.detailList}>
                <div>
                  <dt>Fraud Reason</dt>
                  <dd>
                    {selectedTransaction?.fraudReason?.length > 0
                      ? selectedTransaction.fraudReason.join(", ")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt>Legitimate Reason</dt>
                  <dd>
                    {selectedTransaction?.legitReason?.length > 0
                      ? selectedTransaction.legitReason.join(", ")
                      : "-"}
                  </dd>
                </div>
              </dl>

              <div className={styles.detailActions}>
                <button
                  type="button"
                  disabled={!selectedTransaction}
                  onClick={() => {
                    if (!selectedTransaction) return;

                    navigate(`/transactions/${selectedTransaction.id}`);
                  }}
                >
                  <ListChecks aria-hidden="true" size={14} />
                  Detail
                </button>
                <button
                  type="button"
                  disabled={!selectedTransaction}
                  onClick={() => {
                    if (!selectedTransaction) return;

                    navigate(`/clients/${selectedTransaction.userId}`);
                  }}
                >
                  <User aria-hidden="true" size={14} />
                  User
                </button>
              </div>
            </aside>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
