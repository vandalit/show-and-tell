import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getProject } from "../api";
import CatalogItems, { type CatalogItem } from "../components/CatalogItems";
import ListToolbar, { type SortOption } from "../components/ListToolbar";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";
import PreferenceStatus from "../components/PreferenceStatus";
import useApiResource from "../hooks/useApiResource";
import styles from "../components/CatalogCards.module.css";
import LoadState from "../components/LoadState";
import useListPreferences from "../hooks/useListPreferences";
import { compareNames } from "../utils/sorting";

type CourseSort = "name-asc" | "name-desc" | "sessions-desc" | "sessions-asc";

const courseSortOptions: SortOption<CourseSort>[] = [
  { value: "name-asc", label: "Nombre (A–Z)" },
  { value: "name-desc", label: "Nombre (Z–A)" },
  { value: "sessions-desc", label: "Cantidad de sesiones (mayor a menor)" },
  { value: "sessions-asc", label: "Cantidad de sesiones (menor a mayor)" },
];
const courseSortValues = courseSortOptions.map((option) => option.value);

export default function ProjectPage() {
  const { projectId } = useParams();
  const requestProject = useCallback(
    (signal: AbortSignal) => {
      if (!projectId) {
        throw new Error("Falta el identificador del proyecto.");
      }
      return getProject(projectId, signal);
    },
    [projectId],
  );
  const { state, retry } = useApiResource(
    projectId,
    requestProject,
    "Falta el identificador del proyecto.",
  );
  const { preferences, updatePreferences, error: preferencesError } =
    useListPreferences<CourseSort>({
      scope: "courses",
      label: "cursos",
      defaultSort: "name-asc",
      allowedSorts: courseSortValues,
    });

  if (state.status !== "success") {
    return (
      <PageContent label="Estado del proyecto">
        <LoadState
          error={state.status === "error" ? state.error : undefined}
          onRetry={retry}
          variant="detail"
        />
      </PageContent>
    );
  }

  const project = state.data;
  const sortedCourses = [...project.courses].sort((left, right) => {
    const byName = compareNames(left.title, right.title);
    switch (preferences.sort) {
      case "name-desc":
        return -byName;
      case "sessions-desc":
        return right.session_count - left.session_count || byName;
      case "sessions-asc":
        return left.session_count - right.session_count || byName;
      default:
        return byName;
    }
  });
  const courseItems: CatalogItem[] = sortedCourses.map((course) => ({
    id: course.id,
    title: course.title,
    metadata: `${course.session_count} ${
      course.session_count === 1 ? "sesión" : "sesiones"
    }`,
    to: `/courses/${course.id}`,
  }));

  return (
    <>
      <PageHeader
        title={project.name}
        breadcrumbs={[{ label: "Proyectos", to: "/" }, { label: project.name }]}
        actions={
          <ListToolbar
            itemName="cursos"
            sort={preferences.sort}
            sortOptions={courseSortOptions}
            onSortChange={(sort) => updatePreferences({ sort })}
            viewMode={preferences.viewMode}
            onViewModeChange={(viewMode) => updatePreferences({ viewMode })}
          />
        }
      />
      <PageContent label={`Cursos de ${project.name}`}>
        <PreferenceStatus message={preferencesError} />
        <h2 className={styles.sectionHeading}>Cursos</h2>
        {sortedCourses.length === 0 ? (
          <p className={styles.empty}>Este proyecto todavía no tiene cursos.</p>
        ) : (
          <CatalogItems items={courseItems} viewMode={preferences.viewMode} />
        )}
      </PageContent>
    </>
  );
}
