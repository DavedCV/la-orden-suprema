import { Edit3, Shield, Crown, UserIcon } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type { User, Assassin } from "../../../shared/types";

interface ProfileHeaderProps {
  profile: User | Assassin;
  isEditing: boolean;
  onEditToggle: () => void;
  onPasswordChange: () => void;
}

// Type guard to check if profile is an Assassin
function isAssassin(profile: User | Assassin): profile is Assassin {
  return "status" in profile && "goldCoins" in profile;
}

function getStatusColor(status: string) {
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
}

export function ProfileHeader({
  profile,
  isEditing,
  onEditToggle,
  onPasswordChange,
}: ProfileHeaderProps) {
  const isUserAssassin = isAssassin(profile);
  const { goToDashboard } = useNavigation();

  return (
    <div className="bg-orden-800 border-b border-orden-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToDashboard}
              className="text-orden-400 hover:text-orden-200"
            >
              ← Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-orden-100 flex items-center">
                <UserIcon className="h-6 w-6 mr-3 text-gold-400" />
                Mi Perfil
              </h1>
              <p className="text-orden-300 mt-1">
                Gestiona tu información personal y configuración
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPasswordChange}
              className="flex items-center"
            >
              <Shield className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
            <Button
              variant={isEditing ? "ghost" : "primary"}
              size="sm"
              onClick={onEditToggle}
              className="flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="mt-6 bg-orden-900/50 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gold-500/20 p-3 rounded-lg">
              <Crown className="h-8 w-8 text-gold-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-orden-100">
                {profile.alias}
              </h2>
              <p className="text-orden-400">{profile.email}</p>
              {isUserAssassin && (
                <div className="flex items-center space-x-3 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      profile.status
                    )}`}
                  >
                    {profile.status}
                  </span>
                  <span className="text-sm text-orden-300">
                    Rol:{" "}
                    {profile.role === "admin" ? "Administrador" : "Asesino"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
