import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./ListToolbar.module.css";

export interface SortOption<Value extends string> {
  value: Value;
  label: string;
}

interface ListToolbarProps<Value extends string> {
  itemName: string;
  sort: Value;
  sortOptions: SortOption<Value>[];
  onSortChange: (sort: Value) => void;
}

function ToolbarIcon({ name }: { name: "filter" | "search" | "sort" }) {
  if (name === "filter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16M7 12h10m-7 6h4" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4.2 4.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14m0 0-3-3m3 3 3-3M16 19V5m0 0-3 3m3-3 3 3" />
    </svg>
  );
}

export default function ListToolbar<Value extends string,>({
  itemName,
  sort,
  sortOptions,
  onSortChange,
}: ListToolbarProps<Value>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sortLabel = `Ordenar ${itemName}`;

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuContainerRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus();

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]',
      ) ?? [],
    );
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    const offset = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      currentIndex === -1
        ? event.key === "ArrowDown"
          ? 0
          : items.length - 1
        : (currentIndex + offset + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <div className={styles.toolbar} aria-label="Herramientas de lista">
      <button
        className={styles.iconButton}
        type="button"
        aria-label="Filtros (próximamente)"
        title="Filtros (próximamente)"
        disabled
      >
        <ToolbarIcon name="filter" />
      </button>
      <button
        className={styles.iconButton}
        type="button"
        aria-label="Buscar (próximamente)"
        title="Buscar (próximamente)"
        disabled
      >
        <ToolbarIcon name="search" />
      </button>
      <div className={styles.sortContainer} ref={menuContainerRef}>
        <button
          ref={triggerRef}
          className={styles.iconButton}
          type="button"
          aria-label={sortLabel}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title={sortLabel}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <ToolbarIcon name="sort" />
        </button>
        {menuOpen && (
          <div
            ref={menuRef}
            className={styles.menu}
            role="menu"
            aria-label={sortLabel}
            onKeyDown={handleMenuKeyDown}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={styles.menuItem}
                type="button"
                role="menuitemradio"
                aria-checked={sort === option.value}
                tabIndex={sort === option.value ? 0 : -1}
                onClick={() => {
                  onSortChange(option.value);
                  setMenuOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span>{option.label}</span>
                <span className={styles.check} aria-hidden="true">
                  {sort === option.value ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
