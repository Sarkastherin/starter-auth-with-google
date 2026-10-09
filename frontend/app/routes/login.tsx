import type { Route } from "./+types/home";
import { Button, Checkbox, Label, Card } from "flowbite-react";
import { Input, InputShowPassword } from "../components/InputsForms";
import { useForm } from "react-hook-form";
import type { LoginInput } from "shared";
import { Link } from "react-router";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "~/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    {
      name: "description",
      content: "Stack base para nuevos proyectos",
    },
  ];
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const onSubmit = async (data: LoginInput) => {
    setSubmitError(null);
    try {
      await login(data);
      navigate("/dashboard"); // Redirige al dashboard después de iniciar sesión
    } catch (error: any) {
      setSubmitError(error.message || "Error al iniciar sesión");
    }
  };
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4">
      <Card className="w-sm">
        <div className="flex flex-col items-center gap-4 mb-4 mt-6">
          <h2 className="text-3xl font-bold text-center">Iniciar sesión</h2>
          <p className="text-base-600 dark:text-base-300">
            Bienvenido de nuevo
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
            error={errors.password?.message}
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
            })}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" {...register("rememberMe")} />
              <Label htmlFor="remember">Recuérdame</Label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}
        </form>
        <Button color="light" onClick={loginWithGoogle}>
          <FcGoogle className="mr-2" />
          Iniciar sesión con Google
        </Button>
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
