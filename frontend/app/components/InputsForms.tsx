import { Label, TextInput, HelperText } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";

import { type InputHTMLAttributes, useState, forwardRef } from "react";
import type {
  FieldErrors,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
type InputShowPasswordProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};
export const Input = ({
  error,
  requiredField = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  requiredField?: boolean;
}) => {
  return (
    <div className="w-full">
      <div className="mb-1 block">
        <Label htmlFor={props.id}>
          {props.label}{" "}
          {requiredField && <span className="text-red-500">*</span>}
        </Label>
      </div>
      <TextInput
        type={props.type || "text"}
        {...props}
        color={error ? "failure" : "gray"}
      />
      {error && (
        <HelperText className="text-red-500 dark:text-red-400">
          {error}
        </HelperText>
      )}
    </div>
  );
};
export const InputShowPassword = forwardRef<HTMLInputElement, InputShowPasswordProps>(
  ({ label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        <div className="mb-1 block">
          <Label>{label}</Label>
        </div>
        <div className="relative">
          <TextInput
            type={showPassword ? "text" : "password"}
            color={error ? "failure" : "gray"}
            ref={ref} /* 🔑 Pasamos la ref al input de Flowbite */
            {...props} /* 🔄 Propagamos onChange, onBlur, name, etc. */
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-500"
            tabIndex={-1}
          >
            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        </div>
        {error && (
          <HelperText className="text-red-500 dark:text-red-400">
            {error}
          </HelperText>
        )}
      </div>
    );
  }
);

InputShowPassword.displayName = "InputShowPassword";
