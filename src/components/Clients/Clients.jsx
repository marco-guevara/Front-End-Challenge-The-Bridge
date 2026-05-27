import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserRound } from "lucide-react";

import { getClients } from "../../services/api";
import styles from "./Clients.module.css";

function getClientId(client) {
  return client.Clienteid || client.id_usuario || client.id || client.userId;
}

function getClientName(client) {
  return `${client.nombre || client.name || "Sin nombre"} ${client.apellido || ""}`.trim();
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

  const handleFilterSubmit = (event) => {
    event.preventDefault();
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
          <span className={styles.eyebrow}>Inteligencia de clientes</span>
          <h1>Clientes</h1>
          <p>Busca clientes, revisa su estado y abre perfiles de riesgo.</p>
        </div>
      </header>

      <form className={styles.filters} onSubmit={handleFilterSubmit}>
        <label>
          <span>Búsqueda</span>
          <div className={styles.searchInput}>
            <Search aria-hidden="true" size={16} />
            <input
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Buscar por id, email o país..."
              type="search"
              value={filters.q}
            />
          </div>
        </label>
        <label>
          <span>Estado</span>
          <select
            onChange={(event) => updateFilter("bloqueado", event.target.value)}
            value={filters.bloqueado}
          >
            <option value="">Todos</option>
            <option value="false">Activo</option>
            <option value="true">Bloqueado</option>
          </select>
        </label>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Directorio de clientes</h2>
            <p>{loading ? "Cargando clientes..." : `${filteredClients.length} clientes visibles`}</p>
          </div>
          <UserRound aria-hidden="true" size={22} />
        </div>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>País</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Cargando...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5">No se encontraron clientes</td>
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
                          {client.bloqueado ? "Bloqueado" : "Activo"}
                        </span>
                      </td>
                      <td>
                        <Link className={styles.linkButton} to={`/clients/${id}`}>
                          Detalle
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
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Clients;
