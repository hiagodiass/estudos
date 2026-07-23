import { Sidebar } from "@/components/layout/Sidebar";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <AppRoutes />
      </main>
    </div>
  );
}