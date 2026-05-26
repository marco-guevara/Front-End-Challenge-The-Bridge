import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Triangle,
  User,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";

import styles from "./Dashboard.module.css";
import useAuth from "../../context/useAuth";
import { api } from "../../services/api";

const analyst = {
  name: "Marta Soler",
  role: "Admin",
  queue: "High Risk First",
};

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Transactions", icon: ListChecks, path: "/transactions" },
  { label: "Users", icon: Users, path: "/clients" },
];

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await api.get("/trans?limite=100");

        const mappedTransactions = response.data.map((transaction) => ({
          id: transaction.id_transaccion,
          time: `${transaction.hora}:00`, // 9 => "09:00"
          customer: transaction.id_usuario,
          userId: transaction.id_usuario,
          amount: Number(transaction.importe).toFixed(2), // "17.49" => 17.49 || "17" => 17.00
          country: transaction.pais_pago,
          score: Math.round(Number(transaction.f_score) * 100), // "0.87" => 87
          status: transaction.revisado,
          signal: transaction.categoria,
        }));

        setTransactions(mappedTransactions);
      } catch (err) {
        setError("No se pudieron cargar las transacciones");
        console.log("ERROR:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getTransactions();
  }, []);
  // console.log(transactions);

  // Filtramos transacciones por rol de analista
  const visibleTransactions = transactions.filter((transaction) => {
    if (analyst.role === "Admin") {
      return transaction.score < 70;
    }

    if (analyst.role === "Analyst") {
      return transaction.score >= 70;
    }

    return false;
  });

  // ESTADÍSTICAS
  const lowMediumRisk = visibleTransactions.filter(
    (transaction) => transaction.score < 70,
  ).length;

  const highRisk = visibleTransactions.filter(
    (transaction) => transaction.score >= 70,
  ).length;

  const averageFraudScore =
    visibleTransactions.length > 0
      ? Math.round(
          visibleTransactions.reduce(
            (total, transaction) => total + transaction.score,
            0,
          ) / visibleTransactions.length,
        )
      : 0;

  const stats = [
    {
      icon: CircleDot,
      label: "Visible Reviews",
      value: visibleTransactions.length,
      detail: analyst.role,
    },
    {
      icon: Triangle,
      label: "Low / Medium Risk",
      value: lowMediumRisk,
      detail: "< 70%",
    },
    {
      icon: AlertTriangle,
      label: "High Risk",
      value: highRisk,
      detail: ">= 70%",
      danger: true,
    },
    {
      icon: Gauge,
      label: "Avg Fraud Score",
      value: `${averageFraudScore}%`,
      detail: "Current queue",
      success: true,
    },
  ];

  // TABLA DE TRANSACCIONES
  // Ordenamos transacciones por score (riesgo) de mayor a menor
  const prioritizedTransactions = [...visibleTransactions].sort((a, b) => {
    return b.score - a.score;
  });

  // Transacciones por página
  const transactionsPerPage = 5;

  // PAGINADO DE TRANSACCIONES
  // Calculamos el total de páginas
  // Como necesitamos páginas completas, Math.ceil() redondea hacia arriba.
  const totalPages = Math.ceil(
    prioritizedTransactions.length / transactionsPerPage,
  );

  // Calculamos desde qué posición del array empieza la página actual
  const startIndex = (currentPage - 1) * transactionsPerPage;

  // Calculamos hasta qué posición del array llega la página
  const endIndex = startIndex + transactionsPerPage;

  // Hacemos el corte real del array
  const paginatedTransactions = prioritizedTransactions.slice(
    startIndex,
    endIndex,
  );

  // Si estás en una página que ya no existe, volver a página 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // LOGOUT
  const handleLogout = async () => {
    const isConfirmed = confirm("¿Está segur@ de que quiere cerrar la sesión?");
    if (!isConfirmed) return;

    await logout();
    navigate("/login");
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

          <section className={styles.filterBar}>
            {["Risk", "Status"].map((label) => (
              <label key={label}>
                <span>{label}</span>
                <select defaultValue="">
                  <option value="">All</option>
                  <option>High priority</option>
                  <option>Pending</option>
                </select>
              </label>
            ))}
            <label className={styles.searchField}>
              <span>Search</span>
              <div className={styles.searchInput}>
                <Search aria-hidden="true" size={16} />
                <input placeholder="Transaction, user or customer" />
              </div>
            </label>
            <button className={styles.primaryButton} type="button">
              <SlidersHorizontal aria-hidden="true" size={16} />
              Apply Filters
            </button>
          </section>

          <section className={styles.workspaceGrid}>
            <article className={styles.ledger}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Transaction Review Queue</h3>
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
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="7">Cargando transacciones...</td>
                      </tr>
                    )}

                    {error && (
                      <tr>
                        <td colSpan="7">{error}</td>
                      </tr>
                    )}
                    {!isLoading &&
                      !error &&
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
                          <td>{transaction.status}</td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/clients/${transaction.userId}`);
                                }}
                                type="button"
                              >
                                <User aria-hidden="true" size={14} />
                                User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  type="button"
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
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
                  <dt>Category</dt>
                  <dd>{selectedTransaction?.signal || "-"}</dd>
                </div>

                <div>
                  <dt>Amount</dt>
                  <dd>
                    {selectedTransaction
                      ? `€${selectedTransaction.amount}`
                      : "-"}
                  </dd>
                </div>

                <div>
                  <dt>User</dt>
                  <dd>{selectedTransaction?.userId || "-"}</dd>
                </div>

                <div>
                  <dt>Country</dt>
                  <dd>{selectedTransaction?.country || "-"}</dd>
                </div>

                <div>
                  <dt>Status</dt>
                  <dd>{selectedTransaction?.status || "-"}</dd>
                </div>
              </dl>

              <div className={styles.decisionButtons}>
                <button className={styles.approveButton} type="button">
                  <CheckCircle2 aria-hidden="true" size={16} />
                  Approve
                </button>
                <button className={styles.rejectButton} type="button">
                  <XCircle aria-hidden="true" size={16} />
                  Mark Fraud
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
