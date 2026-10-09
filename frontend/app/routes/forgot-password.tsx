import type { Route } from "./+types/home";
import { Button, Card } from "flowbite-react";
import { Input } from "../components/InputsForms";
import { useForm } from "react-hook-form";
import type { ForgotPasswordInput } from "shared";
import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Forgot Password" },
    {
      name: "description",
      content: "Stack base para nuevos proyectos",
    },
  ];
}

export default function ForgotPassword() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { forgotPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (data: ForgotPasswordInput) => {
    setSuccessMessage(null);
    await forgotPassword(data);
    setSuccessMessage(
      "Si el correo ingresado coincide con una cuenta activa, recibirás un enlace para restablecer tu contraseña en unos minutos",
    );
  };
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4">
      <Card className="w-sm">
        <div className="flex flex-col items-center gap-4 mb-4 mt-6">
          <h2 className="text-3xl font-bold text-center">
            Recuperar contraseña
          </h2>
          <p className="text-base-600 dark:text-base-300">
            Ingresa tu correo electrónico para recuperar tu contraseña
          </p>
        </div>
        <form
          className="flex max-w-md flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="Tu correo electrónico"
            {...register("email", {
              required: "El correo es requerido",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Correo inválido",
              },
            })}
            error={errors.email?.message as string}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Solicitando..." : "Recuperar contraseña"}
          </Button>

          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </p>
          )}
        </form>
        <div className="mt-4 text-center border-t border-base-200 dark:border-base-700 pt-6">
          <p className="text-base-600 dark:text-base-400 text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
