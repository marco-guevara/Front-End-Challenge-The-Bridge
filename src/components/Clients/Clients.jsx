import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

import { getClients } from "../../services/api";
import styles from "./Clients.module.css";

function getClientId(client) {
  return client.Clienteid || client.id_usuario || client.id || client.userId;
}

function getClientName(client) {
  return `${client.nombre || client.name || "Unknown"} ${client.apellido || ""}`.trim();
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const clientsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(clients.length / clientsPerPage));
  const startIndex = (currentPage - 1) * clientsPerPage;
  const endIndex = startIndex + clientsPerPage;
  const paginatedClients = clients.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getClients();
        setClients(Array.isArray(data) ? data : []);
        setCurrentPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Client Intelligence</span>
          <h1>Clients</h1>
          <p>Search customers, inspect account status and open risk profiles.</p>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Client Directory</h2>
            <p>{loading ? "Loading clients..." : `${clients.length} clients visible`}</p>
          </div>
          <UserRound aria-hidden="true" size={22} />
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Country</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="5">No clients found</td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const id = getClientId(client);

                  return (
                    <tr key={id}>
                      <td>
                        <strong>{getClientName(client)}</strong>
                        <span>{id}</span>
                      </td>
                      <td>{client.email || "-"}</td>
                      <td>{client.pais_emision || client.country || "-"}</td>
                      <td>
                        <span className={client.bloqueado ? styles.blocked : styles.active}>
                          {client.bloqueado ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td>
                        <Link className={styles.linkButton} to={`/clients/${id}`}>
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && clients.length > 0 && (
          <div className={styles.pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Clients;
