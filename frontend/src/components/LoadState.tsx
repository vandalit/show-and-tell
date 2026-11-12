import styles from "./LoadState.module.css";

export default function LoadState({
  error,
  loadingText = "Cargando…",
}: {
  error?: string;
  loadingText?: string;
}) {
  if (error) {
    return (
      <p className={`${styles.message} ${styles.error}`} role="alert">
        No se pudo cargar el contenido: {error}
      </p>
    );
  }
  return <p className={styles.message}>{loadingText}</p>;
}
