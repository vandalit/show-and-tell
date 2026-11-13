import styles from "../components/CatalogCards.module.css";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";

export default function VaultPage() {
  return (
    <>
      <PageHeader title="Vault" />
      <PageContent label="Contenido del Vault">
        <p className={styles.empty}>El espacio para los items se definirá más adelante.</p>
      </PageContent>
    </>
  );
}
