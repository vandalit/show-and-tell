import { useCallback } from "react";
import { getProjects } from "../api";
import ListToolbar, { type SortOption } from "../components/ListToolbar";
import CatalogItems, { type CatalogItem } from "../components/CatalogItems";
import LoadState from "../components/LoadState";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";
import PreferenceStatus from "../components/PreferenceStatus";
import useApiResource from "../hooks/useApiResource";
import useListPreferences from "../hooks/useListPreferences";
import styles from "../components/CatalogCards.module.css";
import { compareNames } from "../utils/sorting";

type ProjectSort = "name-asc" | "name-desc" | "courses-desc" | "courses-asc";

const projectSortOptions: SortOption<ProjectSort>[] = [
  { value: "name-asc", label: "Nombre (A–Z)" },
  { value: "name-desc", label: "Nombre (Z–A)" },
  { value: "courses-desc", label: "Cantidad de cursos (mayor a menor)" },
  { value: "courses-asc", label: "Cantidad de cursos (menor a mayor)" },
];
const projectSortValues = projectSortOptions.map((option) => option.value);

export default function DashboardPage() {
  const requestProjects = useCallback(
    (signal: AbortSignal) => getProjects(signal),
    [],
  );
  const { state, retry } = useApiResource("projects", requestProjects);
  const { preferences, updatePreferences, error: preferencesError } =
    useListPreferences<ProjectSort>({
      scope: "projects",
      label: "proyectos",
      defaultSort: "name-asc",
      allowedSorts: projectSortValues,
    });

  const projects = state.status === "success" ? state.data : [];
  const sortedProjects = [...projects].sort((left, right) => {
    const byName = compareNames(left.name, right.name);
    switch (preferences.sort) {
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
  const projectItems: CatalogItem[] = sortedProjects.map((project) => ({
    id: project.id,
    title: project.name,
    metadata: `${project.course_count} ${
      project.course_count === 1 ? "curso" : "cursos"
    }`,
    to: `/projects/${project.id}`,
  }));

  return (
    <>
      <PageHeader
        title="Proyectos"
        actions={
          <ListToolbar
            itemName="proyectos"
            sort={preferences.sort}
            sortOptions={projectSortOptions}
            onSortChange={(sort) => updatePreferences({ sort })}
            viewMode={preferences.viewMode}
            onViewModeChange={(viewMode) => updatePreferences({ viewMode })}
          />
        }
      />
      <PageContent label="Lista de proyectos">
        <PreferenceStatus message={preferencesError} />
        {state.status !== "success" ? (
          <LoadState
            error={state.status === "error" ? state.error : undefined}
            onRetry={retry}
            viewMode={preferences.viewMode}
          />
        ) : sortedProjects.length === 0 ? (
          <p className={styles.empty}>No hay proyectos disponibles.</p>
        ) : (
          <CatalogItems items={projectItems} viewMode={preferences.viewMode} />
        )}
      </PageContent>
    </>
  );
}
