import type { Route } from "./+types/home";
import { Button, Card } from "flowbite-react";
import { Input, InputShowPassword } from "../components/InputsForms";
import { useForm } from "react-hook-form";
import type { RegisterInput } from "shared";
import { Link } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "~/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register" },
    {
      name: "description",
      content: "Stack base para nuevos proyectos",
    },
  ];
}

export default function Register() {
  const { loginWithGoogle, registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: RegisterInput) => {
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const response = await registerUser(data);
      setSuccessMessage(response.message || "¡Cuenta creada con éxito!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message || "Error al registrar usuario");
    }
  };
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4">
      <Card className="w-sm">
        <div className="flex flex-col items-center gap-4 mb-4 mt-6">
          <h2 className="text-3xl font-bold text-center">Registrarse</h2>
          <p className="text-base-600 dark:text-base-300">
            Crea una cuenta nueva
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

          <InputShowPassword
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
            })}
            error={errors.password?.message as string}
          />
          <InputShowPassword
            label="Confirmar Contraseña"
            placeholder="Confirma tu contraseña"
            {...register("confirmPassword", {
              required: "La confirmación es obligatoria",
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            })}
            error={errors.confirmPassword?.message as string}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </Button>
          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </p>
          )}
        </form>
        <Button color="light" onClick={loginWithGoogle}>
          <FcGoogle className="mr-2" />
          Registrarse con Google
        </Button>
        <div className="mt-4 text-center border-t border-base-200 dark:border-base-700 pt-6">
          <p className="text-base-600 dark:text-base-400 text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
