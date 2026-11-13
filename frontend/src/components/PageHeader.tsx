import type { ReactNode } from "react";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <h1 className={styles.title}>{title}</h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
