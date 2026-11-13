import type { ReactNode } from "react";
import styles from "./PageContent.module.css";

export default function PageContent({
  children,
  label = "Contenido de la página",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <section className={styles.content} aria-label={label}>
      {children}
    </section>
  );
}
