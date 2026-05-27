import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListChecks, Users } from "lucide-react";

import styles from "./PageNavigation.module.css";

const navigationLinks = [
  { label: "Panel", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transacciones", path: "/transactions", icon: ListChecks },
  { label: "Clientes", path: "/clients", icon: Users },
];

function PageNavigation() {
  return (
    <header className={styles.pageNavigation}>
      <NavLink className={styles.brandLink} to="/dashboard">
        <img alt="" aria-hidden="true" src="/novapay-icon.png" />
        <span>NovaPay</span>
      </NavLink>

      <nav className={styles.navigationLinks} aria-label="Navegación principal">
        {navigationLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? styles.activeNavigationLink : styles.navigationLink
            }
            key={path}
            to={path}
          >
            <Icon aria-hidden="true" size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default PageNavigation;
