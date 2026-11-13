import type { ReactNode } from "react";
import styles from "./CatalogLayout.module.css";

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.topBar} aria-label="Barra superior" />
      <aside className={styles.sideBar} aria-label="Navegación lateral" />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
