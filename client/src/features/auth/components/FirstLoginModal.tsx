import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { useAuthStore } from "../../../shared/store/authStore";

// Validation schema for password change
const changePasswordSchema = z
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

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface FirstLoginModalProps {
  onPasswordChanged: () => void;
}

export function FirstLoginModal({ onPasswordChanged }: FirstLoginModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, updateUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsSubmitting(true);

      await apiService.changePassword(data.currentPassword, data.newPassword);

      // Update user state to reflect password change
      if (user) {
        updateUser({
          ...user,
          isFirstLogin: false,
          temporaryPassword: false,
        });
      }

      toast({
        type: "success",
        title: "Contraseña actualizada",
        message:
          "Tu contraseña ha sido cambiada exitosamente. Ahora puedes acceder al sistema.",
      });

      onPasswordChanged();
    } catch (error: unknown) {
      toast({
        type: "error",
        title: "Error al cambiar contraseña",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo cambiar la contraseña. Verifica que la contraseña actual sea correcta.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gold-500/20 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orden-100">
                Cambio de Contraseña Obligatorio
              </h2>
              <p className="text-sm text-orden-400">Primer inicio de sesión</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Welcome Message */}
          <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-gold-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gold-400 mb-1">
                  ¡Bienvenido a La Orden Suprema, {user?.alias}!
                </h4>
                <p className="text-sm text-orden-300">
                  Por seguridad, debes cambiar tu contraseña temporal antes de
                  continuar.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                Contraseña Temporal Actual *
              </label>
              <div className="relative">
                <Input
                  {...register("currentPassword")}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña temporal"
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
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
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

            {/* Password Requirements */}
            <div className="bg-orden-900/50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-orden-200 mb-2">
                Requisitos de contraseña:
              </h4>
              <ul className="text-xs text-orden-400 space-y-1">
                <li
                  className={newPassword?.length >= 8 ? "text-green-400" : ""}
                >
                  • Mínimo 8 caracteres
                </li>
                <li
                  className={
                    /[a-z]/.test(newPassword || "") ? "text-green-400" : ""
                  }
                >
                  • Al menos una letra minúscula
                </li>
                <li
                  className={
                    /[A-Z]/.test(newPassword || "") ? "text-green-400" : ""
                  }
                >
                  • Al menos una letra mayúscula
                </li>
                <li
                  className={
                    /\d/.test(newPassword || "") ? "text-green-400" : ""
                  }
                >
                  • Al menos un número
                </li>
                <li
                  className={
                    /[@$!%*?&]/.test(newPassword || "") ? "text-green-400" : ""
                  }
                >
                  • Al menos un carácter especial (@$!%*?&)
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || passwordStrength.score < 3}
              fullWidth
              className="bg-gold-500 hover:bg-gold-600 text-orden-900 mt-6"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Cambiando contraseña...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-orden-900/50 rounded-lg">
            <p className="text-xs text-orden-500 text-center">
              Tu contraseña temporal expirará en 7 días. Asegúrate de usar una
              contraseña segura y única.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
