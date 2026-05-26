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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getClients();
        setClients(Array.isArray(data) ? data : []);
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
                clients.map((client) => {
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
      </section>
    </main>
  );
}

export default Clients;
