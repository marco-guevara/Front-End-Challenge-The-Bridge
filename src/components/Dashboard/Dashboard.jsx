import styles from "./Dashboard.module.css";

import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

const currentUser = {
  name: "Analyst User",
  role: "junior",
};

const transactions = [
  {
    id: "#TX-82910",
    date: "2026.05.24",
    customer: "Apex Holdings",
    description: "International settlement",
    amount: "$245,000.00",
    fraudScore: 68,
    status: "Pending Review",
  },
  {
    id: "#TX-82908",
    date: "2026.05.24",
    customer: "Unknown Node",
    description: "Unusual transfer pattern",
    amount: "$89,000.00",
    fraudScore: 91,
    status: "Pending Review",
  },
  {
    id: "#TX-82907",
    date: "2026.05.23",
    customer: "Blue River LLC",
    description: "Repeated small transfers",
    amount: "$12,450.00",
    fraudScore: 42,
    status: "Pending Review",
  },
];

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const isConfirmed = confirm("¿Está segur@ de que quiere cerrar la sesión?")
    if (!isConfirmed) return;

    await logout();
    navigate("/login");
  };

  const visibleTransactions = transactions.filter((transaction) => {
    if (currentUser.role === "junior") {
      return transaction.fraudScore < 70;
    }

    if (currentUser.role === "senior") {
      return transaction.fraudScore >= 70;
    }

    return false;
  });

  const pendingTransactions = visibleTransactions.filter(
    (transaction) => transaction.status === "Pending Review",
  );

  const lowMediumRisk = pendingTransactions.filter(
    (transaction) => transaction.fraudScore < 70,
  ).length;

  const highRisk = pendingTransactions.filter(
    (transaction) => transaction.fraudScore >= 70,
  ).length;

  const averageFraudScore =
    pendingTransactions.length > 0
      ? Math.round(
          pendingTransactions.reduce(
            (total, transaction) => total + transaction.fraudScore,
            0,
          ) / pendingTransactions.length,
        )
      : 0;

  const stats = [
    {
      icon: "◉",
      label: "VISIBLE REVIEWS",
      value: pendingTransactions.length,
      detail: currentUser.role.toUpperCase(),
    },
    {
      icon: "△",
      label: "LOW / MEDIUM RISK",
      value: lowMediumRisk,
      detail: "< 70%",
    },
    {
      icon: "⚠",
      label: "HIGH RISK",
      value: highRisk,
      detail: "≥ 70%",
      danger: true,
    },
    {
      icon: "◎",
      label: "AVG FRAUD SCORE",
      value: `${averageFraudScore}%`,
      detail: "Current queue",
      success: averageFraudScore < 70,
      danger: averageFraudScore >= 70,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h1>NovaPay</h1>
          <span>INSTITUTIONAL GRADE</span>
        </div>

        <nav className={styles.nav}>
          {[
            "Dashboard",
            "Transactions",
            "Accounts",
            "Security",
            "Settings",
          ].map((item, index) => (
            <button
              className={index === 0 ? styles.activeNav : styles.navItem}
              key={item}
            >
              <span>{["▦", "▤", "▣", "⬟", "⚙"][index]}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.heading}>
            <h2>Fraud Review Dashboard</h2>
            <p>
              Monitor suspicious transactions and review potential fraud
              activity in real time.
            </p>
          </div>

          <section className={styles.statsGrid}>
            {stats.map((stat) => (
              <article
                className={`${styles.statCard} ${stat.danger ? styles.dangerCard : ""}`}
                key={stat.label}
              >
                <div className={styles.statTop}>
                  <span className={styles.statIcon}>{stat.icon}</span>
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
                <p>{stat.label}</p>
                <h3
                  className={
                    stat.success
                      ? styles.successValue
                      : stat.danger
                        ? styles.dangerValue
                        : ""
                  }
                >
                  {stat.value}
                </h3>
              </article>
            ))}
          </section>

          {/* <section className={styles.middleGrid}>
            <article className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Volume Analytics</h3>
                  <p>System-wide institutional flow across 30 days</p>
                </div>
                <div className={styles.tabs}>
                  <span>30 Days</span>
                  <b>90 Days</b>
                </div>
              </div>
              <div className={styles.fakeChart}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </article>

            <article className={styles.integrityCard}>
              <h3>Core Integrity</h3>
              <div className={styles.circle}>
                <strong>92</strong>
                <span>SECURITY</span>
              </div>
              <p>
                No active vulnerabilities detected. System protocols are at
                optimal status.
              </p>
              <button>INITIATE SECURITY AUDIT</button>
            </article>
          </section> */}

          <section className={styles.ledger}>
            <div className={styles.ledgerHeader}>
              <h3>Transaction Review Queue</h3>
              <button>≡ Export Data</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DATE</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>FRAUD SCORE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.customer}</td>
                    <td className={styles.amount}>{transaction.amount}</td>
                    <td>
                      <span className={styles.badge}>
                        {transaction.fraudScore}%
                      </span>
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        defaultValue={transaction.status}
                      >
                        <option>Pending Review</option>
                        <option>Approved</option>
                        <option>Fraud Confirmed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
