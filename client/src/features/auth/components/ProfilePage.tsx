import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Shield, Settings, Crown } from "lucide-react";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import { formatDate } from "../../../shared/utils";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type { User, Assassin } from "../../../shared/types";
import { PasswordChangeModal } from "./PasswordChangeModal";
import { useSkillsManager } from "../hooks/useSkillsManager";
import { useProfileUpdate } from "../hooks/useProfileUpdate";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileCard } from "./ProfileCard";
import { ProfileInformationForm } from "./ProfileInformationForm";
import { SkillsSection } from "./SkillsSection";
import { ProfilePageSkeleton } from "./ProfilePageSkeleton";

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
  const { goToDashboard } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Track form initialization to prevent infinite loops
  const isFormInitialized = useRef(false);
  const lastProfileId = useRef<string | null>(null);

  // Fetch detailed profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => apiService.getProfile(),
    enabled: !!user,
  });

  const profile = profileData?.data as User | Assassin;
  const isUserAssassin = profile && isAssassin(profile);

  // Static default form values (will be set via useEffect)
  const formDefaultValues = useMemo(
    () => ({
      alias: "",
      lastKnownLocation: "",
    }),
    []
  );

  // Skills management hook for assassin users
  const skillsManager = useSkillsManager({
    initialSkills: isUserAssassin ? profile?.skills || [] : [],
    maxSkills: 10,
  });

  // Profile update hook
  const { updateProfile, isUpdating } = useProfileUpdate({
    onSuccess: () => setIsEditing(false),
  });

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: formDefaultValues,
  });

  // Initialize form when profile data loads
  useEffect(() => {
    if (profile && profile.id !== lastProfileId.current) {
      // Update tracking refs
      lastProfileId.current = profile.id;
      isFormInitialized.current = true;

      // Reset form with new values
      resetProfile({
        alias: profile.alias,
        lastKnownLocation: isUserAssassin
          ? (profile as Assassin)?.lastKnownLocation || ""
          : "",
      });

      // Reset skills for assassins
      if (isUserAssassin) {
        skillsManager.resetSkills(profile.skills || []);
      }
    }
  }, [
    profile?.id,
    profile?.alias,
    profile,
    isUserAssassin,
    resetProfile,
    skillsManager.resetSkills,
  ]);

  // Skills management methods from hook
  const { addSkill, removeSkill } = skillsManager;

  // Memoized form submission handler
  const onProfileSubmit = useCallback(
    (data: ProfileUpdateFormData) => {
      const submitData = isUserAssassin
        ? { ...data, skills: skillsManager.skills }
        : data;
      updateProfile(submitData);
    },
    [isUserAssassin, skillsManager.skills, updateProfile]
  );

  // Memoized cancel handler
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);

    // Reset form to original values
    if (profile) {
      resetProfile({
        alias: profile.alias,
        lastKnownLocation: isUserAssassin
          ? (profile as Assassin)?.lastKnownLocation || ""
          : "",
      });

      // Reset skills for assassins
      if (isUserAssassin) {
        skillsManager.resetSkills(profile.skills || []);
      }
    }
  }, [resetProfile, isUserAssassin, profile, skillsManager.resetSkills]);

  // Memoized handlers for header actions
  const handleEdit = useCallback(() => setIsEditing(true), []);
  const handlePasswordChange = useCallback(
    () => setShowPasswordModal(true),
    []
  );
  const handleModalClose = useCallback(() => setShowPasswordModal(false), []);

  if (isLoading) {
    return <ProfilePageSkeleton />;
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
      <ProfileHeader
        isEditing={isEditing}
        userRole={user?.role}
        onEdit={handleEdit}
        onSave={handleProfileSubmit(onProfileSubmit)}
        onCancel={handleCancelEdit}
        onPasswordChange={handlePasswordChange}
        onBackToDashboard={goToDashboard}
        isSaving={isUpdating}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard profile={profile} userRole={user?.role} />
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <ProfileInformationForm
              profile={profile}
              isEditing={isEditing}
              isUserAssassin={isUserAssassin}
              userRole={user?.role}
              register={registerProfile}
              errors={profileErrors}
            />

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
                <SkillsSection
                  profile={profile as Assassin}
                  isEditing={isEditing}
                  skillsManager={skillsManager}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                />
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
      {showPasswordModal && <PasswordChangeModal onClose={handleModalClose} />}
    </div>
  );
}
