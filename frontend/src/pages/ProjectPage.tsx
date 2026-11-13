import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../api";
import Breadcrumbs from "../components/Breadcrumbs";
import styles from "../components/CatalogCards.module.css";
import LoadState from "../components/LoadState";
import type { Project } from "../types";

export default function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!projectId) {
      setError("Falta el identificador del proyecto.");
      return;
    }
    getProject(projectId).then(setProject).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    });
  }, [projectId]);

  return (
    <>
      {error || !project ? (
        <LoadState error={error} />
      ) : (
        <>
          <Breadcrumbs items={[{ label: "Proyectos", to: "/" }, { label: project.name }]} />
          <h1 className={styles.heading}>{project.name}</h1>
          <h2 className={styles.sectionHeading}>Cursos</h2>
          {project.courses.length === 0 ? (
            <p className={styles.empty}>Este proyecto todavía no tiene cursos.</p>
          ) : (
            <ul className={styles.grid}>
              {project.courses.map((course) => (
                <li key={course.id}>
                  <Link className={styles.card} to={`/courses/${course.id}`}>
                    <span className={styles.cardTitle}>{course.title}</span>
                    <span className={styles.meta}>
                      {course.session_count}{" "}
                      {course.session_count === 1 ? "sesión" : "sesiones"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
