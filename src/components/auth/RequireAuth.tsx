import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import Login from "@/pages/Login";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Carregando...
      </div>
    );
  }

  if (!user) return <Login />;

  return <>{children}</>;
}