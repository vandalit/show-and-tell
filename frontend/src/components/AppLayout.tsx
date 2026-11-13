import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
