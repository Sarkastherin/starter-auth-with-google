import type { Route } from "./+types/home";
import { Button, DarkThemeToggle } from "flowbite-react";
import { useAuth } from "~/context/AuthContext";
import { Alert } from "flowbite-react";
import { HiInformationCircle, HiCheckCircle } from "react-icons/hi";
import { useState } from "react";

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
  const { user, logout, sendEmailVerification } = useAuth();
  
  // Estados para el flujo de la petición
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Estados visuales para controlar qué alertas mostrar
  const [showAlert, setShowAlert] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSendEmail = async () => {
    try {
      if (!user) return;
      setIsSubmiting(true);
      setSubmitError(null);
      
      const response = await sendEmailVerification({
        id: user.id,
        email: user.email,
      });
      
      setSuccessMessage(response.message || "Enlace enviado con éxito.");
      setShowSuccessAlert(true); // Mostramos el cartel verde de éxito
      setShowAlert(false);       // Ocultamos el cartel amarillo de advertencia
    } catch (error) {
      setSubmitError("No se pudo enviar el email de verificación. Reintente luego.");
    } finally {
      setIsSubmiting(false);
    }
  };
  console.log("verificado?",user?.emailVerified)
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4 text-center relative">
      
      {/* ALERTA 1: Usuario NO verificado (Advertencia Amarilla) */}
      {!user?.emailVerified && showAlert && (
        <Alert 
          color="yellow" 
          icon={HiInformationCircle} 
          onDismiss={() => setShowAlert(false)} // Permite cerrarlo y que no moleste más en esta sesión
          rounded
          className="max-w-md w-full"
        >
          <span className="font-medium">Verifique su email:</span> Su cuenta aún no ha sido verificada.{" "}
          <button 
            className="underline font-bold text-yellow-800 hover:text-yellow-900 disabled:opacity-50" 
            onClick={handleSendEmail}
            disabled={isSubmiting}
          >
            {isSubmiting ? "Enviando..." : "Verificar aquí"}
          </button>
        </Alert>
      )}

      {/* ALERTA 2: Éxito en el envío del link (Verde) */}
      {showSuccessAlert && successMessage && (
        <Alert 
          color="success" 
          icon={HiCheckCircle}
          onDismiss={() => setShowSuccessAlert(false)} 
          rounded
          className="max-w-md w-full"
        >
          <span className="font-medium">¡Enlace enviado!</span> {successMessage}
        </Alert>
      )}

      {/* ALERTA 3: Error de red o servidor (Roja) */}
      {submitError && (
        <Alert 
          color="failure" 
          icon={HiInformationCircle}
          onDismiss={() => setSubmitError(null)} 
          rounded
          className="max-w-md w-full"
        >
          <span className="font-medium">Error:</span> {submitError}
        </Alert>
      )}

      <h1 className="text-4xl md:text-5xl font-bold">Bienvenido</h1>
      
      <code className="text-lg bg-green-200 p-2 rounded dark:bg-green-800 dark:text-green-200">
        {user?.email}
      </code>

      <div className="flex gap-4">
        <Button onClick={logout} color="red">
          Cerrar sesión
        </Button>
      </div>

      <DarkThemeToggle className="absolute top-4 right-4" />
    </section>
  );
}