import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, X, Shield } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";

// Password validation schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
      ),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeModalProps {
  onClose: () => void;
}

export function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const newPassword = watch("newPassword");

  const passwordChangeMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
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

  const onSubmit = (data: PasswordChangeFormData) => {
    passwordChangeMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    const checks = [
      /.{8,}/, // At least 8 characters
      /[a-z]/, // Lowercase
      /[A-Z]/, // Uppercase
      /\d/, // Number
      /[@$!%*?&]/, // Special character
    ];

    checks.forEach((check) => {
      if (check.test(password)) strength++;
    });

    const labels = ["Muy débil", "Débil", "Regular", "Buena", "Excelente"];
    const colors = [
      "text-red-400",
      "text-orange-400",
      "text-yellow-400",
      "text-blue-400",
      "text-green-400",
    ];

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "text-red-400",
    };
  };

  const passwordStrength = getPasswordStrength(newPassword || "");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                Cambiar Contraseña
              </h3>
              <p className="text-sm text-orden-400">
                Actualiza tu contraseña de acceso
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Current Password */}
          <div>
            <Input
              {...register("currentPassword")}
              type={showCurrentPassword ? "text" : "password"}
              label="Contraseña Actual"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-orden-400 hover:text-orden-200"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.currentPassword?.message}
              disabled={passwordChangeMutation.isPending}
            />
          </div>

          {/* New Password */}
          <div>
            <Input
              {...register("newPassword")}
              type={showNewPassword ? "text" : "password"}
              label="Nueva Contraseña"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-orden-400 hover:text-orden-200"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.newPassword?.message}
              disabled={passwordChangeMutation.isPending}
            />

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-orden-400">Fortaleza:</span>
                  <span className={passwordStrength.color}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-orden-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.strength >= 4
                        ? "bg-green-500"
                        : passwordStrength.strength >= 3
                        ? "bg-blue-500"
                        : passwordStrength.strength >= 2
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              label="Confirmar Nueva Contraseña"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-orden-400 hover:text-orden-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.confirmPassword?.message}
              disabled={passwordChangeMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-orden-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={passwordChangeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={passwordChangeMutation.isPending}
              disabled={!newPassword || passwordStrength.strength < 3}
            >
              Cambiar Contraseña
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
