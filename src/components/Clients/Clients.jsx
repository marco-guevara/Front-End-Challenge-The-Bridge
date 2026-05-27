import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserRound } from "lucide-react";

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
  const [filters, setFilters] = useState({ q: "", bloqueado: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const clientsPerPage = 10;
  const search = filters.q.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      !search ||
      Object.values(client).some((value) =>
        String(value ?? "").toLowerCase().includes(search),
      );
    const matchesStatus =
      filters.bloqueado === "" ||
      client.bloqueado === (filters.bloqueado === "true");

    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / clientsPerPage));
  const startIndex = (currentPage - 1) * clientsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + clientsPerPage);

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    let ignore = false;

    getClients()
      .then((data) => {
        if (ignore) return;
        setClients(Array.isArray(data) ? data : []);
        setCurrentPage(1);
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

      <form className={styles.filters}>
        <label>
          <span>Search</span>
          <div className={styles.searchInput}>
            <Search aria-hidden="true" size={16} />
            <input
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Client id..."
              value={filters.q}
            />
          </div>
        </label>
        <label>
          <span>Status</span>
          <select
            onChange={(event) => updateFilter("bloqueado", event.target.value)}
            value={filters.bloqueado}
          >
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>
        </label>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Client Directory</h2>
            <p>{loading ? "Loading clients..." : `${filteredClients.length} clients visible`}</p>
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
              ) : filteredClients.length === 0 ? (
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

        {!loading && filteredClients.length > 0 && (
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
