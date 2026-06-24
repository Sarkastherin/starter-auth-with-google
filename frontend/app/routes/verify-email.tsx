import type { Route } from "./+types/home";
import {
  Button,
  Checkbox,
  Label,
  TextInput,
  Card,
  Alert,
} from "flowbite-react";
import { Input, InputShowPassword } from "../components/InputsForms";
import { useForm } from "react-hook-form";
import type { VerifyEmail } from "../types/auth";
import { useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
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

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { verifyEmail, refreshUser, user } = useAuth();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get("token") || "";

  const onSubmit = async (data: VerifyEmail) => {
    setSubmitError(null);
    try {
      if (!user) return;
      await verifyEmail(data);
      await refreshUser(user?.id);
      navigate("/dashboard");
    } catch (error: any) {
      console.log(error);
      setSubmitError(error.message);
    }
  };
  useEffect(() => {
    if (!tokenFromUrl) return;
    console.log("verifyEmail");
    onSubmit({ token: tokenFromUrl });
  }, [tokenFromUrl]);
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Verificando email...</p>
      {submitError && (
        <Alert color="failure" rounded>
          <span className="font-medium">Email no verificado</span>{" "}
          {submitError || "hubo un problema con la verificación"}
        </Alert>
      )}
    </div>
  );
}
