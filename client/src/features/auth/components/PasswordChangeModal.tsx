import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";

interface PasswordChangeModalProps {
  onClose: () => void;
}

// Password change schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial"
      ),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordChangeFormData) =>
      apiService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Contraseña actualizada",
        message: "Tu contraseña ha sido cambiada exitosamente",
      });
      onClose();
    },
    onError: (error: unknown) => {
      toast({
        type: "error",
        title: "Error al cambiar contraseña",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo cambiar la contraseña",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data: PasswordChangeFormData) => {
    passwordMutation.mutate(data);
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password)
      return { score: 0, label: "Sin contraseña", color: "text-orden-500" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { score: 0, label: "Muy débil", color: "text-red-400" },
      { score: 1, label: "Débil", color: "text-red-400" },
      { score: 2, label: "Regular", color: "text-yellow-400" },
      { score: 3, label: "Buena", color: "text-yellow-400" },
      { score: 4, label: "Fuerte", color: "text-green-400" },
      { score: 5, label: "Muy fuerte", color: "text-green-400" },
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength(newPassword || "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <h2 className="text-xl font-bold text-orden-100 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-gold-400" />
            Cambiar Contraseña
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-orden-400 hover:text-orden-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Contraseña Actual *
            </label>
            <div className="relative">
              <Input
                {...register("currentPassword")}
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña actual"
                error={errors.currentPassword?.message}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orden-400 hover:text-orden-200"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <Input
                {...register("newPassword")}
                type={showNewPassword ? "text" : "password"}
                placeholder="Crea una contraseña segura"
                error={errors.newPassword?.message}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orden-400 hover:text-orden-200"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orden-400">Seguridad:</span>
                  <span className={passwordStrength.color}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-orden-700 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2
                        ? "bg-red-400"
                        : passwordStrength.score <= 4
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                error={errors.confirmPassword?.message}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orden-400 hover:text-orden-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={passwordMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                passwordMutation.isPending || passwordStrength.score < 3
              }
              className="bg-gold-500 hover:bg-gold-600 text-orden-900"
            >
              {passwordMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Cambiando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
