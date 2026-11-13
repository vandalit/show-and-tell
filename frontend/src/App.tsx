import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import CoursePage from "./pages/CoursePage";
import PlayerPage from "./pages/PlayerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
      <Route path="/courses/:courseId" element={<CoursePage />} />
      <Route path="/sessions/:sessionId" element={<PlayerPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
