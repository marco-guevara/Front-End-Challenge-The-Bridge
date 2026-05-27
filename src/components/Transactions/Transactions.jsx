import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import { api, updateTransaction } from "../../services/api";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Transactions", icon: ListChecks, path: "/transactions" },
  { label: "Users", icon: Users, path: "/clients" },
];

function mapTransaction(transaction) {
  return {
    id: transaction.id_transaccion,
    time: `${transaction.hora}:00`,
    userId: transaction.id_usuario,
    amount: Number(transaction.importe).toFixed(2),
    country: transaction.pais_pago,
    score: Math.round(Number(transaction.f_score) * 100),
    isFraud: transaction.es_fraude,
    fraudReason: transaction.shap_reasons?.razones_fraude,
    legitReason: transaction.shap_reasons?.razones_legitima,
  };
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
    name: user?.name || user?.email || "Analyst",
    role: user?.role || "Analyst",
  };

  const getTransactions = async () => {
    try {
      setIsLoading(true);
      setError("");

      let response;

      if (transactionId.trim()) {
        response = await api.get(`/trans/${transactionId.trim()}`);

        // Si es array coge primer elemento, si no usa el objeto directamente
        const transaction = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        setTransactions(transaction ? [mapTransaction(transaction)] : []);
        setCurrentPage(1);
        setSelectedTransaction(null);
        return;
      }

      const params = {
        revisado: "Pendiente",
      };

      if (fraudFilter !== "") {
        params.es_fraude = fraudFilter;
      }

      response = await api.get("/trans", { params });

      const mappedTransactions = response.data.map(mapTransaction);

      setTransactions(mappedTransactions);
      setCurrentPage(1);
      setSelectedTransaction(null);
    } catch (err) {
      console.log("ERROR:", err.message);
      setError("No se pudieron cargar las transacciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const visibleTransactions = transactions.filter((transaction) => {
    if (analyst.role === "Analyst") {
      return transaction.score >= 70;
    }

    if (analyst.role === "Admin") {
      return transaction.score < 70;
    }

    return false;
  });

  const prioritizedTransactions = [...visibleTransactions].sort((a, b) => {
    return b.score - a.score;
  });

  // Transacciones por página
  const transactionsPerPage = 10;

  // PAGINADO DE TRANSACCIONES
  // Calculamos el total de páginas
  // Como necesitamos páginas completas, Math.ceil() redondea hacia arriba.
  const totalPages = Math.ceil(
    prioritizedTransactions.length / transactionsPerPage,
  );

  useEffect(() => {
    setSelectedTransaction(null);
  }, [currentPage]);

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

  const handleReviewTransaction = async (reviewStatus) => {
    if (!selectedTransaction) return;

    try {
      setIsReviewing(true);
      const isConfirmed = confirm(
        "¿Está segur@ de que quiere enviar el resultado de la transacción?",
      );
      if (!isConfirmed) return;
      await updateTransaction(selectedTransaction.id, {
        revisado: "Revisado",
        es_fraude: reviewStatus === "Fraude",
        auditor_fraude: reviewStatus === "Fraude",
      });

      setError("");
      setTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction.id !== selectedTransaction.id,
        ),
      );

      setSelectedTransaction(null);
    } catch (err) {
      console.log("ERROR REVIEW:", err.message);
      setError("No se pudo actualizar la transacción");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleResetFilters = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/trans", {
        params: {
          revisado: "Pendiente",
        },
      });

      setTransactions(response.data.map(mapTransaction));
      setFraudFilter("");
      setTransactionId("");
      setCurrentPage(1);
      setSelectedTransaction(null);
    } catch (err) {
      console.log("ERROR RESET:", err.message);
      setError("No se pudieron resetear los filtros");
    } finally {
      setIsLoading(false);
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
            <button
              className={styles.secondaryButton}
              onClick={handleResetFilters}
              type="button"
            >
              Reset Filters
            </button>
          </section>

          <section className={styles.workspaceGrid}>
            <article className={styles.ledger}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Pending Transactions</h3>
                  <p>
                    {analyst.role === "Analyst"
                      ? "Showing pending transactions with score >= 70"
                      : "Showing pending transactions with score < 70"}
                  </p>
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
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan="6">Cargando transacciones...</td>
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
                        </tr>
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
                <span className={styles.livePill}>Review</span>
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
                    navigate(`/clients/${selectedTransaction.userId}`);
                  }}
                >
                  <User aria-hidden="true" size={14} />
                  User
                </button>

                <button
                  className={styles.approveButton}
                  type="button"
                  disabled={!selectedTransaction || isReviewing}
                  onClick={() => handleReviewTransaction("Aprobada")}
                >
                  Approve
                </button>

                <button
                  className={styles.rejectButton}
                  type="button"
                  disabled={!selectedTransaction || isReviewing}
                  onClick={() => handleReviewTransaction("Fraude")}
                >
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

export default Transactions;
