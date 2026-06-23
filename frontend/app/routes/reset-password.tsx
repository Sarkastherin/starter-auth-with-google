import type { Route } from "./+types/home";
import { Button, Checkbox, Label, TextInput, Card } from "flowbite-react";
import { Input, InputShowPassword } from "../components/InputsForms";
import { useForm } from "react-hook-form";
import type { ResetPassword } from "../types/auth";
import { useSearchParams, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "~/context/AuthContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Reset Password" },
    {
      name: "description",
      content: "Stack base para nuevos proyectos",
    },
  ];
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get("token") || "";
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPassword>({
    defaultValues: {
      token: tokenFromUrl,
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const onSubmit = async (data: ResetPassword) => {
    setSubmitError(null);
    try {
      await resetPassword(data);
      navigate("/login");
    } catch (error: any) {
      setSubmitError(error.message);
    }
  };
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4">
      <Card className="w-sm">
        <div className="flex flex-col items-center gap-4 mb-4 mt-6">
          <h2 className="text-3xl font-bold text-center">
            Restablecer contraseña
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ingresa tu nueva contraseña
          </p>
        </div>
        <form
          className="flex max-w-md flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputShowPassword
            label="Contraseña"
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "La contraseña es obligatoria",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
            })}
          />
          <InputShowPassword
            label="Confirmar Contraseña"
            placeholder="Confirma tu contraseña"
            {...register("confirmNewPassword", {
              required: "La confirmación es obligatoria",
              validate: (value) =>
                value === watch("newPassword") || "Las contraseñas no coinciden",
            })}
            error={errors.confirmNewPassword?.message as string}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Restableciendo..." : "Restablecer contraseña"}
          </Button>
          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}
        </form>
      </Card>
    </section>
  );
}
