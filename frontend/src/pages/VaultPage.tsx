import { useCallback } from "react";
import { getItems } from "../api";
import CatalogItems, { type CatalogItem } from "../components/CatalogItems";
import ListToolbar, { type SortOption } from "../components/ListToolbar";
import LoadState from "../components/LoadState";
import PageContent from "../components/PageContent";
import PageHeader from "../components/PageHeader";
import PreferenceStatus from "../components/PreferenceStatus";
import useApiResource from "../hooks/useApiResource";
import useListPreferences from "../hooks/useListPreferences";
import { compareNames } from "../utils/sorting";
import styles from "./VaultPage.module.css";
import cardStyles from "../components/CatalogCards.module.css";

type ItemSort = "name-asc" | "name-desc" | "slides-desc" | "slides-asc";

const itemSortOptions: SortOption<ItemSort>[] = [
  { value: "name-asc", label: "Nombre (A–Z)" },
  { value: "name-desc", label: "Nombre (Z–A)" },
  { value: "slides-desc", label: "Cantidad de slides (mayor a menor)" },
  { value: "slides-asc", label: "Cantidad de slides (menor a mayor)" },
];
const itemSortValues = itemSortOptions.map((option) => option.value);

export default function VaultPage() {
  const requestItems = useCallback((signal: AbortSignal) => getItems(signal), []);
  const { state, retry } = useApiResource("items", requestItems);
  const { preferences, updatePreferences, error: preferencesError } =
    useListPreferences<ItemSort>({
      scope: "vault-items",
      label: "items del Vault",
      defaultSort: "name-asc",
      allowedSorts: itemSortValues,
    });

  const items = state.status === "success" ? state.data : [];
  const sortedItems = [...items].sort((left, right) => {
    const byName = compareNames(left.title, right.title);
    switch (preferences.sort) {
      case "name-desc":
        return -byName;
      case "slides-desc":
        return right.slide_count - left.slide_count || byName;
      case "slides-asc":
        return left.slide_count - right.slide_count || byName;
      default:
        return byName;
    }
  });
  const catalogItems: CatalogItem[] = sortedItems.map((item) => ({
    id: item.id,
    title: item.title,
    metadata: `${item.slide_count} ${
      item.slide_count === 1 ? "slide" : "slides"
    }`,
    to: `/vault/items/${item.id}`,
  }));

  return (
    <>
      <PageHeader
        title="Vault"
        actions={
          <div className={styles.actions}>
            <button
              className={styles.addButton}
              type="button"
              disabled
              title="La creación de items se añadirá más adelante."
            >
              Agregar item
            </button>
            <ListToolbar
              itemName="items"
              sort={preferences.sort}
              sortOptions={itemSortOptions}
              onSortChange={(sort) => updatePreferences({ sort })}
              viewMode={preferences.viewMode}
              onViewModeChange={(viewMode) => updatePreferences({ viewMode })}
            />
          </div>
        }
      />
      <PageContent label="Inventario del Vault">
        <PreferenceStatus message={preferencesError} />
        {state.status !== "success" ? (
          <LoadState
            error={state.status === "error" ? state.error : undefined}
            onRetry={retry}
            viewMode={preferences.viewMode}
          />
        ) : sortedItems.length === 0 ? (
          <p className={cardStyles.empty}>El Vault todavía no tiene items.</p>
        ) : (
          <CatalogItems items={catalogItems} viewMode={preferences.viewMode} />
        )}
      </PageContent>
    </>
  );
}
