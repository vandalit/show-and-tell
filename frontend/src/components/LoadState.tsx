import styles from "./LoadState.module.css";

export default function LoadState({
  error,
  loadingText = "Cargando…",
  onRetry,
  variant = "catalog",
  viewMode = "grid",
}: {
  error?: string;
  loadingText?: string;
  onRetry?: () => void;
  variant?: "catalog" | "detail" | "player";
  viewMode?: "grid" | "list";
}) {
  if (error) {
    return (
      <div className={styles.errorPanel} role="alert">
        <p className={styles.errorTitle}>No se pudo cargar el contenido</p>
        <p className={styles.errorMessage}>{error}</p>
        {onRetry && (
          <button className={styles.retryButton} type="button" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={styles.loading}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.screenReaderOnly}>{loadingText}</span>
      {variant === "player" ? (
        <div className={styles.playerSkeleton} aria-hidden="true">
          <span className={`${styles.block} ${styles.playerContext}`} />
          <div className={styles.playerHero}>
            <span className={`${styles.block} ${styles.playerTitle}`} />
            <span className={`${styles.block} ${styles.playerSummary}`} />
          </div>
          <span className={`${styles.block} ${styles.playerControls}`} />
        </div>
      ) : variant === "detail" ? (
        <div className={styles.detailSkeleton} aria-hidden="true">
          <span className={`${styles.block} ${styles.detailSummary}`} />
          <span className={`${styles.block} ${styles.detailMeta}`} />
          <div className={styles.slideSkeletons}>
            {Array.from({ length: 3 }, (_, index) => (
              <div className={styles.slideSkeleton} key={index}>
                <span className={`${styles.block} ${styles.slideTitle}`} />
                <span className={`${styles.block} ${styles.slideText}`} />
                <span className={`${styles.block} ${styles.slideTextShort}`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`${styles.catalogSkeleton} ${
            viewMode === "list" ? styles.list : ""
          }`}
          aria-hidden="true"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div className={styles.catalogCard} key={index}>
              <span className={`${styles.block} ${styles.cardTitle}`} />
              <span className={`${styles.block} ${styles.cardMeta}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
