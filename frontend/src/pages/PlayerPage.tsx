import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession } from "../api";
import Breadcrumbs from "../components/Breadcrumbs";
import LoadState from "../components/LoadState";
import type { LearningSession, Slide } from "../types";
import styles from "./PlayerPage.module.css";

interface PlayerItem {
  slide: Slide;
  itemTitle: string;
  categories: string[];
}

export default function PlayerPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<LearningSession>();
  const [error, setError] = useState<string>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError("Falta el identificador de sesión.");
      return;
    }
    getSession(sessionId).then(setSession).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    });
  }, [sessionId]);

  const items = useMemo<PlayerItem[]>(
    () =>
      session?.items.flatMap(({ item }) =>
        item.slides.map((slide) => ({
          slide,
          itemTitle: item.title,
          categories: item.categories.map((category) => category.name),
        })),
      ) ?? [],
    [session],
  );
  const currentItem = items[currentIndex];
  const breadcrumbs = session
    ? [
        { label: "Proyectos", to: "/" },
        {
          label: session.course.project.name,
          to: `/projects/${session.course.project.id}`,
        },
        { label: session.course.title, to: `/courses/${session.course.id}` },
        { label: session.title },
      ]
    : [];

  if (error || !session) {
    return (
      <main className={styles.page}>
        <div className={styles.navigation}>
          <Link to="/">← Proyectos</Link>
        </div>
        <LoadState error={error} />
      </main>
    );
  }

  if (!currentItem) {
    return (
      <main className={styles.page}>
        <div className={styles.navigation}>
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <p className={styles.error}>Esta sesión todavía no tiene slides.</p>
      </main>
    );
  }

  const slideNumber = currentIndex + 1;

  function goTo(index: number) {
    setCurrentIndex(index);
  }

  return (
    <main className={styles.page}>
      <div className={styles.navigation}>
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <header className={styles.topBar}>
        <div className={styles.context}>
          <strong>{currentItem.itemTitle}</strong>
          <span>{currentItem.categories.join(" · ")}</span>
        </div>
        <div className={styles.timelinePlaceholder} aria-label="Espacio para contexto temporal" />
      </header>
      <section className={styles.hero} aria-live="polite">
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{currentItem.slide.title}</h1>
          <p className={styles.summary}>{currentItem.slide.summary}</p>
        </div>
      </section>
      <footer className={styles.controls} aria-label="Controles de reproducción">
        <button
          className={styles.button}
          type="button"
          onClick={() => goTo(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          aria-label="Slide anterior"
        >
          Atrás
        </button>
        <span className={styles.position}>
          {slideNumber} / {items.length}
        </span>
        <button
          className={styles.button}
          type="button"
          onClick={() => goTo(Math.min(currentIndex + 1, items.length - 1))}
          disabled={currentIndex === items.length - 1}
          aria-label="Slide siguiente"
        >
          Adelante
        </button>
        <button
          className={styles.button}
          type="button"
          disabled
          aria-label="Reproducción automática pendiente"
          title="La reproducción automática se definirá en una etapa posterior."
        >
          Play
        </button>
        <details className={styles.details}>
          <summary>Detalles</summary>
          <div className={styles.detailsPanel}>{currentItem.slide.body}</div>
        </details>
      </footer>
    </main>
  );
}
