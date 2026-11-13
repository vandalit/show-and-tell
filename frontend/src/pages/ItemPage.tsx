import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getItem } from "../api";
import LoadState from "../components/LoadState";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";
import useApiResource from "../hooks/useApiResource";
import styles from "./ItemPage.module.css";
import cards from "../components/CatalogCards.module.css";

export default function ItemPage() {
  const { itemId } = useParams();
  const requestItem = useCallback(
    (signal: AbortSignal) => {
      if (!itemId) {
        throw new Error("Falta el identificador del item.");
      }
      return getItem(itemId, signal);
    },
    [itemId],
  );
  const { state, retry } = useApiResource(
    itemId,
    requestItem,
    "Falta el identificador del item.",
  );

  if (state.status !== "success") {
    return (
      <PageContent label="Estado del item">
        <LoadState
          error={state.status === "error" ? state.error : undefined}
          onRetry={retry}
          variant="detail"
        />
      </PageContent>
    );
  }

  const item = state.data;
  return (
    <>
      <PageHeader
        title={item.title}
        breadcrumbs={[{ label: "Vault", to: "/vault" }, { label: item.title }]}
      />
      <PageContent label={`Detalle del item ${item.title}`}>
        <p className={styles.summary}>{item.summary}</p>
        <p className={styles.identifier}>
          <span>ID</span>
          <code>{item.id}</code>
        </p>
        {item.categories.length > 0 && (
          <p className={styles.categories}>
            Categorías: {item.categories.map((category) => category.name).join(" · ")}
          </p>
        )}
        <h2 className={cards.sectionHeading}>Slides</h2>
        {item.slides.length === 0 ? (
          <p className={cards.empty}>Este item todavía no tiene slides.</p>
        ) : (
          <ol className={styles.slideList}>
            {item.slides.map((slide, index) => (
              <li className={styles.slideCard} key={slide.id}>
                <h3 className={styles.slideTitle}>
                  {index + 1}. {slide.title}
                </h3>
                <p className={styles.slideSummary}>{slide.summary}</p>
                <details className={styles.slideDetails}>
                  <summary>Ver contenido</summary>
                  <p>{slide.body}</p>
                </details>
              </li>
            ))}
          </ol>
        )}
      </PageContent>
    </>
  );
}
