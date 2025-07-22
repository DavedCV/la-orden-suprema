import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { loginSchema, type LoginFormData } from "../../../shared/types/auth";
import { useAuth } from "../../../shared/hooks/useAuth";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const result = await login(data);

      if (result.success) {
        onSuccess?.();
      } else {
        setError("password", {
          type: "manual",
          message: result.error || "Error desconocido",
        });
      }
    } catch (error) {
      console.error("Login form error:", error);
      setError("password", {
        type: "manual",
        message: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">La Orden Suprema</h1>
        <p className="text-gray-400">Ingresa tus credenciales</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="john@continental.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            {...register("password")}
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            error={errors.password?.message}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          <LogIn className="h-4 w-4 mr-2" />
          {isLoading ? "Verificando..." : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Solo miembros autorizados de La Orden</p>
      </div>
    </div>
  );
}
