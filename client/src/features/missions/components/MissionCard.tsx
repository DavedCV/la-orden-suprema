import React from "react";
import { Target, Calendar, Coins, Eye, Play } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { getStatusConfig, getPriorityConfig } from "../constants";
import type { Mission } from "../../../shared/types";
import type { MissionWithActions } from "../../assassins/hooks/useAssassinMissions";

interface MissionCardProps {
  mission: MissionWithActions;
  onStartMission: (missionId: string) => void;
  onViewDetails: (mission: Mission) => void;
  isStarting: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = React.memo(
  ({ mission, onStartMission, onViewDetails, isStarting }) => {
    const statusConfig = getStatusConfig(mission.status);
    const priorityConfig = getPriorityConfig(mission.priority);
    const StatusIcon = statusConfig.icon;

    const handleStartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartMission(mission.id);
    };

    const handleDetailsClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewDetails(mission);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onViewDetails(mission);
      }
    };

    return (
      <div
        className={`card p-6 hover:border-gold-500/30 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
          mission.isOverdue ? "border-red-500/30 bg-red-500/5" : ""
        }`}
        onClick={() => onViewDetails(mission)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="article"
        aria-label={`Misión: ${mission.title}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-orden-100">
                {mission.title}
              </h3>
              {mission.isOverdue && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  Vencida
                </span>
              )}
            </div>
            <p className="text-sm text-orden-400 line-clamp-2 leading-relaxed">
              {mission.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}
            >
              {priorityConfig.label}
            </div>
          </div>
        </div>

        {/* Mission Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm">
            <Target className="h-4 w-4 text-orden-400 mr-2" />
            <span className="text-orden-300">{mission.targetName}</span>
          </div>

          <div className="flex items-center text-sm">
            <Coins className="h-4 w-4 text-gold-400 mr-2" />
            <span className="text-gold-400 font-medium">
              {formatCurrency(mission.reward)}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-orden-400 mr-2" />
            <span
              className={`${
                mission.isOverdue ? "text-red-400" : "text-orden-300"
              }`}
            >
              {formatDate(mission.deadline)}
            </span>
            {mission.daysRemaining !== undefined && (
              <span
                className={`ml-2 text-xs ${
                  mission.daysRemaining < 0
                    ? "text-red-400"
                    : mission.daysRemaining <= 3
                    ? "text-yellow-400"
                    : "text-orden-500"
                }`}
              >
                (
                {mission.daysRemaining < 0
                  ? `${Math.abs(mission.daysRemaining)} días vencida`
                  : mission.daysRemaining === 0
                  ? "Vence hoy"
                  : `${mission.daysRemaining} días restantes`}
                )
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-orden-700/50">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDetailsClick}
            className="flex-1 text-orden-300 hover:text-orden-100"
            aria-label={`Ver detalles de ${mission.title}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            Detalles
          </Button>

          {mission.canStart && (
            <Button
              size="sm"
              onClick={handleStartClick}
              disabled={isStarting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              aria-label={`Iniciar misión ${mission.title}`}
            >
              {isStarting ? (
                <LoadingSpinner size="sm" className="mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Iniciar
            </Button>
          )}
        </div>
      </div>
    );
  }
);

MissionCard.displayName = "MissionCard";
