import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { loginSchema, type LoginFormData } from "../../../shared/types/auth";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

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

      const response = await apiService.login(data);

      if (response.success && response.data) {
        login(response.data.user, response.data.token);

        toast({
          type: "success",
          title: "¡Bienvenido de vuelta!",
          message: `Hola, ${response.data.user.alias}`,
        });

        onSuccess?.();
      } else {
        // Manejo de errores de la API
        toast({
          type: "error",
          title: "Error de autenticación",
          message: response.message || "Credenciales inválidas",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      // Manejo de diferentes tipos de errores
      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.includes("email")) {
          setError("email", {
            type: "manual",
            message: "Email no encontrado",
          });
        } else if (errorMessage.includes("password")) {
          setError("password", {
            type: "manual",
            message: "Contraseña incorrecta",
          });
        } else {
          toast({
            type: "error",
            title: "Error de conexión",
            message: "No se pudo conectar con el servidor. Intenta de nuevo.",
          });
        }
      } else {
        toast({
          type: "error",
          title: "Error inesperado",
          message: "Algo salió mal. Intenta de nuevo más tarde.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register("email")}
          type="email"
          label="Email"
          placeholder="tu@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
        />

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
        size="lg"
        loading={isLoading}
        className="mt-6"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Iniciar Sesión
      </Button>

      {/* Botón de demostración (solo para desarrollo) */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-3 bg-orden-800 border border-orden-700 rounded-lg">
          <p className="text-xs text-orden-400 mb-2">
            🚧 Desarrollo - Credenciales de prueba:
          </p>
          <div className="text-xs text-orden-300 space-y-1">
            <p>
              <strong>Admin:</strong> admin@orden.com / admin123
            </p>
            <p>
              <strong>Asesino:</strong> john@orden.com / wick123
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
