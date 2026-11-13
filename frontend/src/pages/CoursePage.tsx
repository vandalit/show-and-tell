import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getCourse } from "../api";
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

type SessionSort =
  | "position-asc"
  | "name-asc"
  | "name-desc"
  | "slides-desc"
  | "slides-asc";

const sessionSortOptions: SortOption<SessionSort>[] = [
  { value: "position-asc", label: "Orden del curso" },
  { value: "name-asc", label: "Nombre (A–Z)" },
  { value: "name-desc", label: "Nombre (Z–A)" },
  { value: "slides-desc", label: "Cantidad de slides (mayor a menor)" },
  { value: "slides-asc", label: "Cantidad de slides (menor a mayor)" },
];
const sessionSortValues = sessionSortOptions.map((option) => option.value);

export default function CoursePage() {
  const { courseId } = useParams();
  const requestCourse = useCallback(
    (signal: AbortSignal) => {
      if (!courseId) {
        throw new Error("Falta el identificador del curso.");
      }
      return getCourse(courseId, signal);
    },
    [courseId],
  );
  const { state, retry } = useApiResource(
    courseId,
    requestCourse,
    "Falta el identificador del curso.",
  );
  const { preferences, updatePreferences, error: preferencesError } =
    useListPreferences<SessionSort>({
      scope: "sessions",
      label: "sesiones",
      defaultSort: "position-asc",
      allowedSorts: sessionSortValues,
    });

  if (state.status !== "success") {
    return (
      <PageContent label="Estado del curso">
        <LoadState
          error={state.status === "error" ? state.error : undefined}
          onRetry={retry}
          variant="detail"
        />
      </PageContent>
    );
  }

  const course = state.data;
  const sortedSessions = [...course.sessions].sort((left, right) => {
    const byName = compareNames(left.title, right.title);
    switch (preferences.sort) {
      case "position-asc":
        return left.position - right.position || byName;
      case "name-asc":
        return byName;
      case "name-desc":
        return -byName;
      case "slides-desc":
        return right.slide_count - left.slide_count || byName;
      case "slides-asc":
        return left.slide_count - right.slide_count || byName;
    }
  });
  const sessionItems: CatalogItem[] = sortedSessions.map((session) => ({
    id: session.id,
    title: session.title,
    metadata: `${session.slide_count} ${
      session.slide_count === 1 ? "slide" : "slides"
    }`,
    to: `/sessions/${session.id}`,
  }));

  return (
    <>
      <PageHeader
        title={course.title}
        breadcrumbs={[
          { label: "Proyectos", to: "/" },
          { label: course.project.name, to: `/projects/${course.project.id}` },
          { label: course.title },
        ]}
        actions={
          <ListToolbar
            itemName="sesiones"
            sort={preferences.sort}
            sortOptions={sessionSortOptions}
            onSortChange={(sort) => updatePreferences({ sort })}
            viewMode={preferences.viewMode}
            onViewModeChange={(viewMode) => updatePreferences({ viewMode })}
          />
        }
      />
      <PageContent label={`Sesiones de ${course.title}`}>
        <PreferenceStatus message={preferencesError} />
        <h2 className={styles.sectionHeading}>Sesiones</h2>
        {sortedSessions.length === 0 ? (
          <p className={styles.empty}>Este curso todavía no tiene sesiones.</p>
        ) : (
          <CatalogItems items={sessionItems} viewMode={preferences.viewMode} />
        )}
      </PageContent>
    </>
  );
}
