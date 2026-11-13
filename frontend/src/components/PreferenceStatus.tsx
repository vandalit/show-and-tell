import styles from "./CatalogCards.module.css";

export default function PreferenceStatus({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className={styles.preferenceError} role="status">
      {message}
    </p>
  );
}
