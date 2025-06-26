import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User as UserIcon,
  Edit3,
  Save,
  X,
  Shield,
  Coins,
  Target,
  Calendar,
  MapPin,
  Award,
  Eye,
  EyeOff,
  Lock,
  Settings,
  Crown,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { formatDate, formatCurrency } from "../../../shared/utils";
import type { User, Assassin } from "../../../shared/types";

// Validation schema for profile update
const profileUpdateSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias debe tener al menos 2 caracteres")
    .max(50, "El alias no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "El alias solo puede contener letras, números, espacios, guiones y guiones bajos"
    ),
  lastKnownLocation: z
    .string()
    .max(100, "La ubicación no puede exceder 100 caracteres")
    .optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Type guard to check if profile is an Assassin
function isAssassin(profile: User | Assassin): profile is Assassin {
  return "status" in profile && "goldCoins" in profile;
}

export function ProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Fetch detailed profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => apiService.getProfile(),
    enabled: !!user,
  });

  const profile = profileData?.data as User | Assassin;
  const isUserAssassin = profile && isAssassin(profile);

  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: (data: ProfileUpdateFormData & { skills?: string[] }) =>
      apiService.updateProfile(data),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Perfil actualizado",
        message: "Tu información ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      toast({
        type: "error",
        title: "Error al actualizar perfil",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil",
      });
    },
  });

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      alias: profile?.alias || "",
      lastKnownLocation: isUserAssassin ? profile.lastKnownLocation || "" : "",
    },
  });

  // Initialize form when profile data loads
  useState(() => {
    if (profile) {
      resetProfile({
        alias: profile.alias,
        lastKnownLocation: isUserAssassin
          ? profile.lastKnownLocation || ""
          : "",
      });
      if (isUserAssassin) {
        setSkills(profile.skills || []);
      }
    }
  });

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !skills.includes(newSkill.trim()) &&
      skills.length < 10
    ) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const onProfileSubmit = (data: ProfileUpdateFormData) => {
    const submitData = isUserAssassin ? { ...data, skills } : data;
    profileUpdateMutation.mutate(submitData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile();
    if (isUserAssassin) {
      setSkills(profile.skills || []);
    }
    setNewSkill("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Retirado":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Excommunicado":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-orden-400 bg-orden-400/10 border-orden-400/20";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <UserIcon className="h-16 w-16 text-orden-600 mx-auto" />
          <h3 className="text-lg font-medium text-orden-300">
            Perfil no encontrado
          </h3>
          <p className="text-orden-500">
            No se pudo cargar la información del perfil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <div className="bg-orden-800 border-b border-orden-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.history.pushState(null, "", "/");
                  window.location.reload();
                }}
                className="text-orden-400 hover:text-orden-200"
              >
                ← Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-orden-100 flex items-center">
                  {user?.role === "admin" ? (
                    <Crown className="h-6 w-6 mr-3 text-gold-400" />
                  ) : (
                    <UserIcon className="h-6 w-6 mr-3 text-gold-400" />
                  )}
                  Mi Perfil
                  {user?.role === "admin" && (
                    <span className="ml-2 text-sm font-normal text-gold-400">
                      - Administrador
                    </span>
                  )}
                </h1>
                <p className="text-orden-300 mt-1">
                  {user?.role === "admin"
                    ? "Gestiona tu información de administrador"
                    : "Gestiona tu información personal"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>

              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-orden-900"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleProfileSubmit(onProfileSubmit)}
                    disabled={profileUpdateMutation.isPending}
                    className="bg-gold-500 hover:bg-gold-600 text-orden-900"
                  >
                    {profileUpdateMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user?.role === "admin" ? (
                    <Crown className="h-12 w-12 text-gold-400" />
                  ) : (
                    <span className="text-gold-400 font-bold text-3xl">
                      {profile.alias.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-orden-100">
                  {profile.alias}
                </h2>
                <p className="text-orden-400 text-sm">{profile.email}</p>
              </div>

              {/* Status/Role */}
              <div className="mb-6">
                {user?.role === "admin" ? (
                  <div className="px-4 py-2 rounded-lg border text-center bg-gold-500/10 border-gold-400/20 text-gold-400">
                    <div className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="font-medium">Administrador</span>
                    </div>
                  </div>
                ) : (
                  isUserAssassin && (
                    <div
                      className={`px-4 py-2 rounded-lg border text-center ${getStatusColor(
                        profile.status
                      )}`}
                    >
                      <div className="flex items-center justify-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="font-medium">{profile.status}</span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                {user?.role === "admin" ? (
                  // Admin stats
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-orden-400 flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        ID de Usuario
                      </span>
                      <span className="text-orden-200 font-mono text-sm">
                        {profile.id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-orden-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Rol del Sistema
                      </span>
                      <span className="text-orden-200 capitalize">
                        {profile.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-orden-400 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Estado
                      </span>
                      <span className="text-green-400">Activo</span>
                    </div>
                  </>
                ) : (
                  isUserAssassin && (
                    // Assassin stats
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-orden-400 flex items-center">
                          <Coins className="h-4 w-4 mr-2 text-gold-400" />
                          Monedas de Oro
                        </span>
                        <span className="font-bold text-gold-400">
                          {formatCurrency(profile.goldCoins)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-orden-400 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Misiones Completadas
                        </span>
                        <span className="font-bold text-orden-200">
                          {profile.completedMissions}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-orden-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Miembro desde
                        </span>
                        <span className="text-orden-200">
                          {formatDate(profile.joinDate)}
                        </span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gold-400" />
                Información Personal
              </h3>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      {user?.role === "admin"
                        ? "Alias de Administrador"
                        : "Alias"}
                    </label>
                    <p className="text-orden-100">{profile.alias}</p>
                  </div>

                  {isUserAssassin && (
                    <div>
                      <label className="block text-sm font-medium text-orden-400 mb-1">
                        Nombre Real
                      </label>
                      <p className="text-orden-100">
                        {profile.realName || "No especificado"}
                      </p>
                      <p className="text-xs text-orden-500 mt-1">
                        Solo visible para administradores
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Email {user?.role === "admin" ? "Corporativo" : ""}
                    </label>
                    <p className="text-orden-100">{profile.email}</p>
                    {user?.role === "admin" && (
                      <p className="text-xs text-orden-500 mt-1">
                        Email principal para comunicaciones administrativas
                      </p>
                    )}
                  </div>

                  {isUserAssassin && (
                    <div>
                      <label className="block text-sm font-medium text-orden-400 mb-1">
                        Última Ubicación Conocida
                      </label>
                      <p className="text-orden-100 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-orden-400" />
                        {profile.lastKnownLocation || "No especificada"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-orden-200 mb-2">
                      {user?.role === "admin"
                        ? "Alias de Administrador"
                        : "Alias"}{" "}
                      *
                    </label>
                    <Input
                      {...registerProfile("alias")}
                      error={profileErrors.alias?.message}
                      placeholder={
                        user?.role === "admin"
                          ? "Ingresa tu alias de administrador"
                          : "Ingresa tu alias"
                      }
                    />
                    {user?.role === "admin" && (
                      <p className="text-xs text-orden-500 mt-1">
                        Este nombre aparecerá en todos los registros
                        administrativos
                      </p>
                    )}
                  </div>

                  {isUserAssassin && (
                    <div>
                      <label className="block text-sm font-medium text-orden-400 mb-1">
                        Nombre Real
                      </label>
                      <Input
                        value={profile.realName || ""}
                        disabled
                        className="bg-orden-700 opacity-50"
                      />
                      <p className="text-xs text-orden-500 mt-1">
                        No editable - Solo administradores pueden modificar
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Email {user?.role === "admin" ? "Corporativo" : ""}
                    </label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-orden-700 opacity-50"
                    />
                    <p className="text-xs text-orden-500 mt-1">
                      No editable - Contacta a un administrador para cambios
                    </p>
                  </div>

                  {isUserAssassin && (
                    <div>
                      <label className="block text-sm font-medium text-orden-200 mb-2">
                        Última Ubicación Conocida
                      </label>
                      <Input
                        {...registerProfile("lastKnownLocation")}
                        placeholder="ej. Nueva York, Continental Hotel"
                        error={profileErrors.lastKnownLocation?.message}
                      />
                      <p className="text-xs text-orden-500 mt-1">
                        Información opcional para registro interno
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Role-specific sections */}
            {user?.role === "admin" ? (
              // Administrator Privileges Section
              <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
                <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-gold-400" />
                  Privilegios de Administrador
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-orden-900/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-orden-200 font-medium">
                        Gestión de Usuarios
                      </span>
                    </div>
                    <p className="text-xs text-orden-500">
                      Crear, editar y gestionar asesinos
                    </p>
                  </div>

                  <div className="p-3 bg-orden-900/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-orden-200 font-medium">
                        Gestión de Misiones
                      </span>
                    </div>
                    <p className="text-xs text-orden-500">
                      Crear y asignar contratos
                    </p>
                  </div>

                  <div className="p-3 bg-orden-900/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-orden-200 font-medium">
                        Supervisión
                      </span>
                    </div>
                    <p className="text-xs text-orden-500">
                      Monitoreo de actividades
                    </p>
                  </div>

                  <div className="p-3 bg-orden-900/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-orden-200 font-medium">
                        Reportes
                      </span>
                    </div>
                    <p className="text-xs text-orden-500">
                      Acceso a métricas y reportes
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              isUserAssassin && (
                // Skills Section for Assassins
                <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
                  <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gold-400" />
                    Habilidades Especializadas
                  </h3>

                  {!isEditing ? (
                    <div>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-orden-700 text-orden-200 text-sm rounded-md border border-orden-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-orden-500 italic">
                          No se han especificado habilidades
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Add Skill */}
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Agregar nueva habilidad"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSkill())
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          disabled={!newSkill.trim() || skills.length >= 10}
                          size="sm"
                          variant="secondary"
                        >
                          Agregar
                        </Button>
                      </div>

                      {/* Skills List */}
                      {skills.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-orden-300">
                            Habilidades ({skills.length}/10):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-orden-700 text-orden-200 px-3 py-1 rounded-md text-sm border border-orden-600"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 text-orden-400 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}

            {/* System Information */}
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gold-400" />
                Información del Sistema
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-orden-400 mb-1">
                    ID de Usuario
                  </label>
                  <p className="text-orden-200 font-mono">{profile.id}</p>
                </div>

                <div>
                  <label className="block text-orden-400 mb-1">Rol</label>
                  <p className="text-orden-200 capitalize">{profile.role}</p>
                </div>

                <div>
                  <label className="block text-orden-400 mb-1">
                    {user?.role === "admin" ? "Estado de Cuenta" : "Estado"}
                  </label>
                  <p
                    className={
                      user?.role === "admin"
                        ? "text-green-400"
                        : "text-orden-200"
                    }
                  >
                    {user?.role === "admin"
                      ? "Activa"
                      : isUserAssassin
                      ? profile.status
                      : "Activo"}
                  </p>
                </div>

                <div>
                  <label className="block text-orden-400 mb-1">
                    {isUserAssassin ? "Fecha de Registro" : "Último Acceso"}
                  </label>
                  <p className="text-orden-200">
                    {isUserAssassin ? formatDate(profile.joinDate) : "Ahora"}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-orden-900/50 rounded-lg">
                <p className="text-xs text-orden-500">
                  {user?.role === "admin"
                    ? "Como administrador, tienes acceso completo al sistema. Usa estos privilegios responsablemente."
                    : "La información del sistema no puede ser modificada por el usuario. Contacta a un administrador para cambios en estado o rol."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

// Password Change Modal Component (reusable)
function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
