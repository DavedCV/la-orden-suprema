import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { formatCurrency, formatDate } from "../../../shared/utils";
import {
  Target,
  ArrowRight,
  Calendar,
  Coins,
  ExternalLink,
} from "lucide-react";
import type { Mission } from "../../../shared/types";

interface AvailableMissionsSectionProps {
  onNavigate: (path: string) => void;
}

export function AvailableMissionsSection({
  onNavigate,
}: AvailableMissionsSectionProps) {
  const { data: missionsData, isLoading } = useQuery({
    queryKey: ["available-missions-preview"],
    queryFn: () => apiService.getAvailableMissions(),
  });

  const missions = missionsData?.data || [];
  const topMissions = missions.slice(0, 3); // Show only top 3 missions

  const handleViewAllMissions = () => {
    onNavigate("/available-missions");
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-orden-100">
            Misiones Disponibles
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-orden-100">
          Misiones Disponibles
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAllMissions}
          className="text-gold-400 hover:text-gold-300"
        >
          Ver todas <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {topMissions.map((mission) => (
          <AvailableMissionItem
            key={mission.id}
            mission={mission}
            onNavigate={onNavigate}
          />
        ))}

        {missions.length === 0 && (
          <div className="text-center py-8 text-orden-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay misiones disponibles</p>
            <p className="text-sm mt-1">
              Vuelve pronto para nuevas oportunidades
            </p>
          </div>
        )}

        {missions.length > 3 && (
          <div className="text-center pt-4 border-t border-orden-700">
            <button
              onClick={handleViewAllMissions}
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Ver todas las misiones ({missions.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AvailableMissionItem({
  mission,
  onNavigate,
}: {
  mission: Mission;
  onNavigate: (path: string) => void;
}) {
  const deadline = new Date(mission.deadline);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysRemaining <= 7;
  const isOverdue = daysRemaining < 0;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-orden-400 bg-orden-700/50";
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Media";
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg bg-orden-800/50 hover:bg-orden-800 transition-colors border border-orden-700/50 cursor-pointer ${
        isUrgent ? "border-yellow-500/30" : ""
      } ${isOverdue ? "border-red-500/30" : ""}`}
      onClick={() => onNavigate("/available-missions")}
    >
      <div className="bg-gold-500/20 p-2 rounded-full">
        <Target className="h-4 w-4 text-gold-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-orden-200">
            {mission.title}
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                mission.priority
              )}`}
            >
              {getPriorityLabel(mission.priority)}
            </span>
            {isUrgent && !isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                Urgente
              </span>
            )}
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                Vencida
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-orden-400 mb-2 line-clamp-2">
          {mission.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gold-400 font-medium flex items-center">
              <Coins className="h-3 w-3 mr-1" />
              {formatCurrency(mission.reward)}
            </span>
            {mission.targetName && (
              <span className="text-orden-500 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                {mission.targetName}
              </span>
            )}
          </div>
          <div className="flex items-center text-orden-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span className={isOverdue ? "text-red-400" : ""}>
              {formatDate(mission.deadline)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-orden-700">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("/available-missions");
            }}
          >
            Ver y Tomar
          </Button>
        </div>
      </div>
    </div>
  );
}
