import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import SubjectDetail from "@/pages/SubjectDetail";
import Settings from "@/pages/Settings";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/materias" element={<Subjects />} />
      <Route path="/materias/:id" element={<SubjectDetail />} />
      <Route path="/configuracoes" element={<Settings />} />
    </Routes>
  );
}