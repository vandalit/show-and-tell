import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PlayerPage from "./pages/PlayerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/sessions/:sessionId" element={<PlayerPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
