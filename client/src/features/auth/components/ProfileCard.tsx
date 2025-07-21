import React from "react";
import { Shield, Coins, Target, Calendar, UserIcon, Crown } from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils";
import type { User, Assassin } from "../../../shared/types";

interface ProfileCardProps {
  profile: User | Assassin;
  userRole?: string;
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

export const ProfileCard = React.memo(function ProfileCard({
  profile,
  userRole,
}: ProfileCardProps) {
  const isUserAssassin = isAssassin(profile);

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
      {/* Avatar */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {userRole === "admin" ? (
            <Crown className="h-12 w-12 text-gold-400" />
          ) : (
            <span className="text-gold-400 font-bold text-3xl">
              {profile.alias.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-orden-100">{profile.alias}</h2>
        <p className="text-orden-400 text-sm">{profile.email}</p>
      </div>

      {/* Status/Role */}
      <div className="mb-6">
        {userRole === "admin" ? (
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
        {userRole === "admin" ? (
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
              <span className="text-orden-200 capitalize">{profile.role}</span>
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
  );
});
