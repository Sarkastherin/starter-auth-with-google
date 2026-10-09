import type { Route } from "./+types/home";
import { Button, DarkThemeToggle } from "flowbite-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    {
      name: "description",
      content: "Stack base para nuevos proyectos",
    },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard"); // Redirige al dashboard si ya está autenticado
    }
  }, [isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando sesión...</p> {/* O un spinner de Flowbite 🔄 */}
      </div>
    );
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold">Mi repo base con Auth</h1>
      <p className="text-base md:text-lg text-base-600 dark:text-base-400">
        Inicia cualquier proyecto con una base sólida y funcional.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate("/login")}>Iniciar sesión</Button>
        <Button color="light" onClick={() => navigate("/register")}>
          Registrarse
        </Button>
      </div>
      <DarkThemeToggle className="absolute top-4 right-4" />
    </section>
  );
}
