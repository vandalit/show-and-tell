import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const navigationItems = [
  { label: "Dashboard", to: "/", icon: "dashboard" },
  { label: "Vault", to: "/vault", icon: "vault" },
  { label: "Colecciones", to: "/collections", icon: "collections" },
] as const;

function NavigationIcon({ name }: { name: (typeof navigationItems)[number]["icon"] }) {
  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (name === "vault") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h16v12H4z" />
        <path d="M3 4.5h18v3H3zM9 11.5h6M10 15.5h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="m8 7.5 2.7 7.1m5.3-7.1-2.7 7.1M8.5 6h7" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className={styles.sideBar} aria-label="Navegación principal">
      <nav className={styles.navigation}>
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `${styles.link}${isActive ? ` ${styles.active}` : ""}`
            }
            aria-label={item.label}
            data-tooltip={item.label}
          >
            <NavigationIcon name={item.icon} />
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
