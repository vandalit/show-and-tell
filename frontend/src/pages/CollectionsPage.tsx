import styles from "../components/CatalogCards.module.css";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";

export default function CollectionsPage() {
  return (
    <>
      <PageHeader title="Colecciones" />
      <PageContent label="Contenido de Colecciones">
        <p className={styles.empty}>
          El espacio para explorar nodos y conexiones se definirá más adelante.
        </p>
      </PageContent>
    </>
  );
}
