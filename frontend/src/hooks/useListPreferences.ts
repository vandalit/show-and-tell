import { useState } from "react";
import type { ListViewMode } from "../types";

interface ListPreferences<Value extends string> {
  sort: Value;
  viewMode: ListViewMode;
}

interface StoredListPreferences<Value extends string>
  extends ListPreferences<Value> {
  version: 1;
}

interface UseListPreferencesOptions<Value extends string> {
  scope: string;
  label: string;
  defaultSort: Value;
  allowedSorts: readonly Value[];
}

function isAllowedSort<Value extends string>(
  value: unknown,
  allowedSorts: readonly Value[],
): value is Value {
  return allowedSorts.some((sort) => sort === value);
}

function isListViewMode(value: unknown): value is ListViewMode {
  return value === "grid" || value === "list";
}

function isStoredPreferences<Value extends string>(
  value: unknown,
  allowedSorts: readonly Value[],
): value is StoredListPreferences<Value> {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 1 &&
    "sort" in value &&
    isAllowedSort(value.sort, allowedSorts) &&
    "viewMode" in value &&
    isListViewMode(value.viewMode)
  );
}

function readPreferences<Value extends string>(
  storageKey: string,
  label: string,
  defaultSort: Value,
  allowedSorts: readonly Value[],
): { value: ListPreferences<Value>; error?: string } {
  const defaultPreferences: ListPreferences<Value> = {
    sort: defaultSort,
    viewMode: "grid",
  };

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === null) return { value: defaultPreferences };

    const parsed: unknown = JSON.parse(stored);
    if (!isStoredPreferences(parsed, allowedSorts)) {
      return {
        value: defaultPreferences,
        error: `Las preferencias de ${label} no son válidas; se usaron los valores iniciales.`,
      };
    }

    return { value: { sort: parsed.sort, viewMode: parsed.viewMode } };
  } catch {
    return {
      value: defaultPreferences,
      error: `No se pudieron leer las preferencias de ${label} en este navegador.`,
    };
  }
}

export default function useListPreferences<Value extends string>({
  scope,
  label,
  defaultSort,
  allowedSorts,
}: UseListPreferencesOptions<Value>) {
  const storageKey = `show-and-tell:${scope}-view-preferences:v1`;
  const [initialState] = useState(() =>
    readPreferences(storageKey, label, defaultSort, allowedSorts),
  );
  const [preferences, setPreferences] = useState(initialState.value);
  const [error, setError] = useState(initialState.error);

  const updatePreferences = (updates: Partial<ListPreferences<Value>>) => {
    const next = { ...preferences, ...updates };
    setPreferences(next);

    try {
      const stored: StoredListPreferences<Value> = { version: 1, ...next };
      window.localStorage.setItem(storageKey, JSON.stringify(stored));
      setError(undefined);
    } catch {
      setError(`No se pudieron guardar las preferencias de ${label} en este navegador.`);
    }
  };

  return { preferences, updatePreferences, error };
}
