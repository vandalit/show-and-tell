import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import CoursePage from "./pages/CoursePage";
import PlayerPage from "./pages/PlayerPage";
import VaultPage from "./pages/VaultPage";
import CollectionsPage from "./pages/CollectionsPage";
import ItemPage from "./pages/ItemPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/vault/items/:itemId" element={<ItemPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
      <Route path="/sessions/:sessionId" element={<PlayerPage />} />
    </Routes>
  );
}
