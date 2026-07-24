import { Sidebar } from "@/components/layout/Sidebar";
import { AppRoutes } from "@/routes/AppRoutes";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function App() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          <AppRoutes />
        </main>
      </div>
    </RequireAuth>
  );
}