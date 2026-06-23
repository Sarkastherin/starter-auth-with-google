import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/context/AuthContext";

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />; // 👈 Aquí se renderizarán las rutas públicas hijas
}