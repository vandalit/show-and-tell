import { Link } from "react-router-dom";
import type { ListViewMode } from "../types";
import cardStyles from "./CatalogCards.module.css";
import styles from "./CatalogItems.module.css";

export interface CatalogItem {
  id: string;
  title: string;
  metadata: string;
  to: string;
}

export default function CatalogItems({
  items,
  viewMode,
}: {
  items: CatalogItem[];
  viewMode: ListViewMode;
}) {
  return (
    <ul className={`${styles.items} ${styles[viewMode]}`}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            className={`${cardStyles.card} ${
              viewMode === "list" ? cardStyles.cardList : ""
            }`}
            to={item.to}
          >
            <span className={cardStyles.cardTitle}>{item.title}</span>
            <span className={cardStyles.meta}>{item.metadata}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
