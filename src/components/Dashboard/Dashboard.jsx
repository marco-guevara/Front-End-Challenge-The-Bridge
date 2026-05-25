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
import { useNavigate } from "react-router-dom";

const analyst = {
  name: "Marta Soler",
  role: "Analyst",
  queue: "High Risk First",
};

const transactions = [
  {
    id: "TX-82910",
    time: "10:42",
    customer: "Apex Holdings",
    userId: "USR-4912",
    amount: "245,000.00",
    country: "Singapore",
    score: 92,
    status: "Pending",
    signal: "Velocity spike",
  },
  {
    id: "TX-82908",
    time: "10:28",
    customer: "Unknown Node",
    userId: "USR-1180",
    amount: "89,000.00",
    country: "Estonia",
    score: 87,
    status: "On review",
    signal: "VPN and card mismatch",
  },
  {
    id: "TX-82907",
    time: "09:51",
    customer: "Blue River LLC",
    userId: "USR-7621",
    amount: "12,450.00",
    country: "Spain",
    score: 64,
    status: "On review",
    signal: "Repeated small transfers",
  },
  {
    id: "TX-82901",
    time: "09:12",
    customer: "Lumen Market",
    userId: "USR-9034",
    amount: "4,320.00",
    country: "France",
    score: 38,
    status: "Completed",
    signal: "Normal pattern",
  },
];

const stats = [
  {
    icon: CircleDot,
    label: "Visible Reviews",
    value: "46",
    detail: analyst.role,
  },
  {
    icon: Triangle,
    label: "Low / Medium Risk",
    value: "34",
    detail: "< 70%",
  },
  {
    icon: AlertTriangle,
    label: "High Risk",
    value: "12",
    detail: ">= 70%",
    danger: true,
  },
  {
    icon: Gauge,
    label: "Avg Fraud Score",
    value: "55%",
    detail: "Current queue",
    success: true,
  },
];

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", icon: ListChecks },
  { label: "Risk Review", icon: ShieldAlert },
  { label: "Users", icon: Users },
];

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const prioritizedTransactions = [...transactions].sort((a, b) => {
    if (analyst.role === "Admin") {
      return a.score - b.score;
    }

    return b.score - a.score;
  });

  const handleLogout = async () => {
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
          {navigationItems.map(({ label, icon: Icon }, index) => (
              <button
                className={index === 0 ? styles.activeNav : styles.navItem}
                key={label}
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
          <button className={styles.logout} onClick={handleLogout} type="button">
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
                    {prioritizedTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{transaction.time}</td>
                        <td>
                          <strong>{transaction.customer}</strong>
                          <span>{transaction.country}</span>
                        </td>
                        <td className={styles.amount}>€{transaction.amount}</td>
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
                            <button type="button">
                              <ShieldAlert aria-hidden="true" size={14} />
                              Review
                            </button>
                            <button type="button">
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
                <button type="button">Previous</button>
                <span>Page 1 of 8</span>
                <button type="button">Next</button>
              </div>
            </article>

            <aside className={styles.reviewPanel}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Transaction Detail</h3>
                  <p>TX-82910 selected</p>
                </div>
                <span className={styles.livePill}>Preview</span>
              </div>

              <div className={styles.scoreBlock}>
                <div>
                  <span>Fraud score</span>
                  <strong>92%</strong>
                </div>
                <div className={styles.scoreRing}>92</div>
              </div>

              <dl className={styles.detailList}>
                <div>
                  <dt>Signal</dt>
                  <dd>Velocity spike and country mismatch</dd>
                </div>
                <div>
                  <dt>Payment method</dt>
                  <dd>Corporate virtual card</dd>
                </div>
                <div>
                  <dt>Model reason</dt>
                  <dd>Amount anomaly, VPN usage, new device</dd>
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
