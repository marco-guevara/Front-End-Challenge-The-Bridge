  // Filtramos transacciones por rol de analista
  // const visibleTransactions = transactions.filter((transaction) => {
  //   if (analyst.role === "Admin") {
  //     return transaction.score < 70;
  //   }

  //   if (analyst.role === "Analyst") {
  //     return transaction.score >= 70;
  //   }

  //   return false;
  // });

    // Ordenamos transacciones por score (riesgo) de mayor a menor
  // const prioritizedTransactions = [...visibleTransactions].sort((a, b) => {
  //   return b.score - a.score;
  // });

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  User,
  UserCircle,
  Users,
} from "lucide-react";

import styles from "../Dashboard/Dashboard.module.css";
import useAuth from "../../context/useAuth";
import { api } from "../../services/api";

const analyst = {
  name: "Marta Soler",
  role: "Admin",
};

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Transactions", icon: ListChecks, path: "/transactions" },
  { label: "Risk Review", icon: ShieldAlert, path: "/dashboard" },
  { label: "Users", icon: Users, path: "/clients" },
];

function mapTransaction(transaction) {
  return {
    id: transaction.id_transaccion,
    date: transaction.fecha,
    time: `${transaction.hora}:00`,
    userId: transaction.id_usuario,
    amount: Number(transaction.importe).toFixed(2),
    country: transaction.pais_pago,
    score: Math.round(Number(transaction.f_score) * 100),
    status: transaction.revisado,
    isFraud: transaction.es_fraude,
    category: transaction.categoria,
  };
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [fraudFilter, setFraudFilter] = useState("");
  const [reviewedFilter, setReviewedFilter] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const getTransactions = async () => {
    try {
      setIsLoading(true);
      setError("");

      let response;

      if (transactionId.trim()) {
        response = await api.get(`/trans/${transactionId.trim()}`);

        const transaction = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        setTransactions(transaction ? [mapTransaction(transaction)] : []);
        setCurrentPage(1);
        return;
      }

      const params = {};

      if (fraudFilter !== "") {
        params.es_fraude = fraudFilter;
      }

      if (reviewedFilter !== "") {
        params.revisado = reviewedFilter;
      }

      response = await api.get("/trans", { params });

      const mappedTransactions = response.data.map(mapTransaction);

      setTransactions(mappedTransactions);
      setCurrentPage(1);
    } catch (err) {
      console.log("ERROR:", err.message);
      setError("No se pudieron cargar las transacciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    api
      .get("/trans")
      .then((response) => {
        if (ignore) return;

        setTransactions(response.data.map(mapTransaction));
        setCurrentPage(1);
      })
      .catch((err) => {
        if (ignore) return;

        console.log("ERROR:", err.message);
        setError("No se pudieron cargar las transacciones");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const transactionsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;

  const paginatedTransactions = transactions.slice(startIndex, endIndex);

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
            Logout
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
                <option value="">All</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </label>

            <label>
              <span>Revisado</span>
              <select
                value={reviewedFilter}
                onChange={(e) => setReviewedFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="No requerido">No requerido</option>
                <option value="Revisado">Revisado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </label>

            <label className={styles.searchField}>
              <span>Transaction ID</span>
              <div className={styles.searchInput}>
                <Search aria-hidden="true" size={16} />
                <input
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Search by transaction ID"
                  type="text"
                  value={transactionId}
                />
              </div>
            </label>

            <button
              className={styles.primaryButton}
              onClick={getTransactions}
              type="button"
            >
              <SlidersHorizontal aria-hidden="true" size={16} />
              Apply Filters
            </button>
          </section>

          <section className={styles.workspaceGrid}>
            <article className={styles.ledger}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Transactions</h3>
                  <p>All database transactions</p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Time</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Score</th>
                      <th>Fraud</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="8">Cargando transacciones...</td>
                      </tr>
                    )}

                    {error && (
                      <tr>
                        <td colSpan="8">{error}</td>
                      </tr>
                    )}

                    {!isLoading &&
                      !error &&
                      paginatedTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.id}</td>
                          <td>{transaction.time}</td>
                          <td>
                            <strong>{transaction.userId}</strong>
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
                          <td>{transaction.isFraud ? "Sí" : "No"}</td>
                          <td>{transaction.status}</td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                onClick={() =>
                                  navigate(`/transactions/${transaction.id}`)
                                }
                                type="button"
                              >
                                <ShieldAlert aria-hidden="true" size={14} />
                                Detail
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/clients/${transaction.userId}`)
                                }
                                type="button"
                              >
                                <User aria-hidden="true" size={14} />
                                User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {!isLoading && !error && transactions.length === 0 && (
                      <tr>
                        <td colSpan="8">No hay transacciones</td>
                      </tr>
                    )}
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
          </section>
        </section>
      </main>
    </div>
  );
}

export default Transactions;
