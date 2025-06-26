import { Coins, Target, Calendar, Award } from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils";
import type { Assassin } from "../../../shared/types";

interface ProfileStatsProps {
  profile: Assassin;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Gold Coins */}
      <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
        <div className="flex items-center">
          <div className="bg-gold-500/20 p-3 rounded-lg">
            <Coins className="h-6 w-6 text-gold-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-orden-400">Monedas de Oro</p>
            <p className="text-2xl font-bold text-gold-400">
              {formatCurrency(profile.goldCoins)}
            </p>
          </div>
        </div>
      </div>

      {/* Completed Missions */}
      <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
        <div className="flex items-center">
          <div className="bg-green-500/20 p-3 rounded-lg">
            <Target className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-orden-400">
              Misiones Completadas
            </p>
            <p className="text-2xl font-bold text-green-400">
              {profile.completedMissions}
            </p>
          </div>
        </div>
      </div>

      {/* Join Date */}
      <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
        <div className="flex items-center">
          <div className="bg-blue-500/20 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-orden-400">Miembro Desde</p>
            <p className="text-lg font-bold text-blue-400">
              {formatDate(profile.joinDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
        <div className="flex items-center">
          <div className="bg-purple-500/20 p-3 rounded-lg">
            <Award className="h-6 w-6 text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-orden-400">Tasa de Éxito</p>
            <p className="text-2xl font-bold text-purple-400">
              {profile.completedMissions > 0 ? "100%" : "0%"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
