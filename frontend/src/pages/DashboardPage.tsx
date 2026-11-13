import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api";
import ListToolbar, { type SortOption } from "../components/ListToolbar";
import LoadState from "../components/LoadState";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";
import type { ProjectSummary } from "../types";
import styles from "../components/CatalogCards.module.css";

type ProjectSort = "name-asc" | "name-desc" | "courses-desc" | "courses-asc";

const projectSortOptions: SortOption<ProjectSort>[] = [
  { value: "name-asc", label: "Nombre (A–Z)" },
  { value: "name-desc", label: "Nombre (Z–A)" },
  { value: "courses-desc", label: "Cantidad de cursos (mayor a menor)" },
  { value: "courses-asc", label: "Cantidad de cursos (menor a mayor)" },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>();
  const [error, setError] = useState<string>();
  const [sort, setSort] = useState<ProjectSort>("name-asc");

  useEffect(() => {
    getProjects().then(setProjects).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    });
  }, []);

  const sortedProjects = [...(projects ?? [])].sort((left, right) => {
    const byName = left.name.localeCompare(right.name, "es", {
      sensitivity: "base",
    });
    switch (sort) {
      case "name-desc":
        return -byName;
      case "courses-desc":
        return right.course_count - left.course_count || byName;
      case "courses-asc":
        return left.course_count - right.course_count || byName;
      default:
        return byName;
    }
  });

  return (
    <>
      <PageHeader
        title="Proyectos"
        actions={
          <ListToolbar
            itemName="proyectos"
            sort={sort}
            sortOptions={projectSortOptions}
            onSortChange={setSort}
          />
        }
      />
      <PageContent label="Lista de proyectos">
        {error || !projects ? (
          <LoadState error={error} />
        ) : sortedProjects.length === 0 ? (
          <p className={styles.empty}>No hay proyectos disponibles.</p>
        ) : (
          <ul className={styles.grid}>
            {sortedProjects.map((project) => (
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
      </PageContent>
    </>
  );
}
