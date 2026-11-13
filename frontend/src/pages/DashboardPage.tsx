import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api";
import LoadState from "../components/LoadState";
import CatalogLayout from "../components/CatalogLayout";
import type { ProjectSummary } from "../types";
import styles from "../components/CatalogCards.module.css";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getProjects().then(setProjects).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    });
  }, []);

  return (
    <CatalogLayout>
      <h1 className={styles.heading}>Proyectos</h1>
      {error || !projects ? (
        <LoadState error={error} />
      ) : projects.length === 0 ? (
        <p className={styles.empty}>No hay proyectos disponibles.</p>
      ) : (
        <ul className={styles.grid}>
          {projects.map((project) => (
            <li key={project.id}>
              <Link className={styles.card} to={`/projects/${project.id}`}>
                <span className={styles.cardTitle}>{project.name}</span>
                <span className={styles.meta}>
                  {project.course_count} {project.course_count === 1 ? "curso" : "cursos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CatalogLayout>
  );
}
