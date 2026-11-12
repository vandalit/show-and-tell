import { useEffect, useState } from "react";
import { getDashboard } from "../api";
import CourseTree from "../components/CourseTree";
import LoadState from "../components/LoadState";
import type { CourseGroup } from "../types";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const [groups, setGroups] = useState<CourseGroup[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getDashboard().then(setGroups).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    });
  }, []);

  return (
    <div className={styles.layout}>
      <header className={styles.topBar} aria-label="Barra superior" />
      <aside className={styles.sideBar} aria-label="Navegación lateral" />
      <main className={styles.main}>
        <h1 className={styles.heading}>Sesiones</h1>
        {error || !groups ? (
          <LoadState error={error} />
        ) : groups.length === 0 ? (
          <p className={styles.empty}>No hay cursos disponibles.</p>
        ) : (
          <CourseTree groups={groups} />
        )}
      </main>
    </div>
  );
}
