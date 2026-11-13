import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "../api";
import Breadcrumbs from "../components/Breadcrumbs";
import styles from "../components/CatalogCards.module.css";
import LoadState from "../components/LoadState";
import type { Course } from "../types";

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!courseId) {
      setError("Falta el identificador del curso.");
      return;
    }
    getCourse(courseId).then(setCourse).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    });
  }, [courseId]);

  return (
    <>
      {error || !course ? (
        <LoadState error={error} />
      ) : (
        <>
          <Breadcrumbs
            items={[
              { label: "Proyectos", to: "/" },
              { label: course.project.name, to: `/projects/${course.project.id}` },
              { label: course.title },
            ]}
          />
          <h1 className={styles.heading}>{course.title}</h1>
          <h2 className={styles.sectionHeading}>Sesiones</h2>
          {course.sessions.length === 0 ? (
            <p className={styles.empty}>Este curso todavía no tiene sesiones.</p>
          ) : (
            <ul className={styles.grid}>
              {course.sessions.map((session) => (
                <li key={session.id}>
                  <Link className={styles.card} to={`/sessions/${session.id}`}>
                    <span className={styles.cardTitle}>{session.title}</span>
                    <span className={styles.meta}>
                      {session.slide_count}{" "}
                      {session.slide_count === 1 ? "slide" : "slides"}
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
