import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import type { Mission } from "../../../shared/types";
import {
  getMissionTimeInfo,
  getPriorityInfo,
  formatCurrency,
  formatDate,
  getMissionCardStyling,
} from "../utils/missionUtils";
import { Target, Calendar, Coins, AlertTriangle, Send } from "lucide-react";

interface AvailableMissionCardProps {
  mission: Mission;
  onApply: (missionId: string) => void;
  isApplying: boolean;
}

export function AvailableMissionCard({
  mission,
  onApply,
  isApplying,
}: AvailableMissionCardProps) {
  const timeInfo = getMissionTimeInfo(mission.deadline);
  const priorityInfo = getPriorityInfo(mission.priority);

  const handleApply = () => {
    onApply(mission.id);
  };

  const renderPriorityBadge = () => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityInfo.color}`}
      aria-label={`Prioridad ${priorityInfo.label}`}
    >
      {priorityInfo.label}
    </span>
  );

  const renderStatusBadges = () => (
    <>
      {timeInfo.isUrgent && !timeInfo.isOverdue && (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
          aria-label="Misión urgente"
        >
          Urgente
        </span>
      )}
      {timeInfo.isOverdue && (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-400"
          aria-label="Misión vencida"
        >
          Vencida
        </span>
      )}
    </>
  );

  const renderMissionDetails = () => (
    <div className="space-y-3 mb-4">
      {mission.targetName && (
        <div className="flex items-center text-sm">
          <Target className="h-4 w-4 text-orden-400 mr-2" aria-hidden="true" />
          <span
            className="text-orden-300"
            aria-label={`Objetivo: ${mission.targetName}`}
          >
            {mission.targetName}
          </span>
        </div>
      )}

      <div className="flex items-center text-sm">
        <Coins className="h-4 w-4 text-gold-400 mr-2" aria-hidden="true" />
        <span
          className="text-gold-400 font-medium"
          aria-label={`Recompensa: ${formatCurrency(mission.reward)}`}
        >
          {formatCurrency(mission.reward)}
        </span>
      </div>

      <div className="flex items-center text-sm">
        <Calendar className="h-4 w-4 text-orden-400 mr-2" aria-hidden="true" />
        <span
          className={timeInfo.isOverdue ? "text-red-400" : "text-orden-300"}
          aria-label={`Fecha límite: ${formatDate(mission.deadline)}`}
        >
          {formatDate(mission.deadline)}
        </span>
        <span
          className={`ml-2 text-xs ${
            timeInfo.isOverdue
              ? "text-red-400"
              : timeInfo.isUrgent
              ? "text-yellow-400"
              : "text-orden-500"
          }`}
          aria-label={timeInfo.timeLabel}
        >
          ({timeInfo.timeLabel})
        </span>
      </div>
    </div>
  );

  const renderActionButton = () => (
    <Button
      onClick={handleApply}
      disabled={isApplying || timeInfo.isOverdue}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
      aria-label={
        timeInfo.isOverdue
          ? "No se puede postular a misión vencida"
          : isApplying
          ? "Enviando postulación"
          : "Postularme a esta misión"
      }
    >
      {isApplying ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Enviando...
        </>
      ) : timeInfo.isOverdue ? (
        <>
          <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" />
          Misión Vencida
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" aria-hidden="true" />
          Postularme
        </>
      )}
    </Button>
  );

  return (
    <article
      className={getMissionCardStyling(timeInfo)}
      role="article"
      aria-labelledby={`mission-title-${mission.id}`}
      aria-describedby={`mission-description-${mission.id}`}
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            id={`mission-title-${mission.id}`}
            className="text-lg font-semibold text-orden-100 mb-1"
          >
            {mission.title}
          </h3>
          <div
            className="flex items-center space-x-2"
            role="group"
            aria-label="Estado de la misión"
          >
            {renderPriorityBadge()}
            {renderStatusBadges()}
          </div>
        </div>
      </header>

      {/* Content */}
      {renderMissionDetails()}

      {/* Description */}
      <div className="mb-4">
        <p
          id={`mission-description-${mission.id}`}
          className="text-sm text-orden-400 line-clamp-3"
          title={mission.description}
        >
          {mission.description}
        </p>
      </div>

      {/* Actions */}
      <footer className="pt-3 border-t border-orden-700/50">
        {renderActionButton()}
      </footer>
    </article>
  );
}
