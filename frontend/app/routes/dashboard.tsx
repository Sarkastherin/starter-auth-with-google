import type { Route } from "./+types/home";
import { Button, DarkThemeToggle } from "flowbite-react";
import { useAuth } from "~/context/AuthContext";
import { useNavigate } from "react-router";
import { Alert } from "flowbite-react";
import { HiEye, HiInformationCircle } from "react-icons/hi";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    {
      name: "description",
      content: "Stack base para nuevos proyectos",
    },
  ];
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold">Bienvenido</h1>
      <code className="text-lg bg-green-200 p-2 rounded dark:bg-green-800 dark:text-green-200">
        {user?.email}
      </code>
      <div className="flex gap-4">
        <Button onClick={logout} color="red">
          Cerrar sesión
        </Button>
      </div>
      {!user?.emailVerified ? (
        <Alert color="yellow" icon={HiInformationCircle} rounded>
          <span className="font-medium">Verifique su email:</span> Su emial no
          ha sido verificado
        </Alert>
      ) : (
        <Alert color="success" onDismiss={() => alert("Alert dismissed!")}>
          <span className="font-medium">¡Email Verificado!</span> Continue usando todas las fucniones de la App
        </Alert>
      )}
      <DarkThemeToggle className="absolute top-4 right-4" />
    </section>
  );
}
