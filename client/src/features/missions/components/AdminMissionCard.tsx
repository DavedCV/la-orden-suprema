import React from "react";
import {
  Target,
  Calendar,
  Coins,
  Eye,
  Edit3,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { getStatusConfig } from "../constants";
import type { Mission, Assassin } from "../../../shared/types";

interface AdminMissionCardProps {
  mission: Mission;
  assassins: Assassin[];
  onEdit: (mission: Mission) => void;
  onAssign: (mission: Mission) => void;
  onViewDetails: (mission: Mission) => void;
}

export const AdminMissionCard: React.FC<AdminMissionCardProps> = React.memo(
  ({ mission, assassins, onEdit, onAssign, onViewDetails }) => {
    const statusConfig = getStatusConfig(mission.status);
    const StatusIcon = statusConfig.icon;

    const assignedAssassin = mission.assignedTo
      ? assassins.find((a) => a.id === mission.assignedTo)
      : null;

    const canAssign = mission.status === "No Asignada";

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(mission);
    };

    const handleAssignClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAssign(mission);
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
      <article
        className="card p-6 hover:border-gold-500/30 transition-colors focus-within:border-gold-500/50 cursor-pointer"
        onClick={() => onViewDetails(mission)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="article"
        aria-labelledby={`mission-${mission.id}-title`}
      >
        {/* Header */}
        <header className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3
              id={`mission-${mission.id}-title`}
              className="text-lg font-semibold text-orden-100 mb-1 truncate"
              title={mission.title}
            >
              {mission.title}
            </h3>
            <p
              className="text-sm text-orden-400 line-clamp-2"
              title={mission.description}
            >
              {mission.description}
            </p>
          </div>
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ml-2 ${statusConfig.color}`}
            role="status"
            aria-label={`Mission status: ${mission.status}`}
          >
            <StatusIcon className="h-4 w-4" aria-hidden="true" />
            <span>{statusConfig.label}</span>
          </div>
        </header>

        {/* Details */}
        <div className="space-y-3 mb-4">
          {mission.targetName && (
            <div className="flex items-center text-sm" title="Target">
              <Target
                className="h-4 w-4 text-orden-400 mr-2 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-orden-300 truncate">
                {mission.targetName}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm" title="Reward">
            <Coins
              className="h-4 w-4 text-gold-400 mr-2 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-gold-400 font-medium">
              {formatCurrency(mission.reward)}
            </span>
          </div>

          <div className="flex items-center text-sm" title="Deadline">
            <Calendar
              className="h-4 w-4 text-orden-400 mr-2 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-orden-300">
              {formatDate(mission.deadline)}
            </span>
          </div>

          {assignedAssassin && (
            <div
              className="flex items-center text-sm"
              title="Assigned Assassin"
            >
              <Users
                className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-blue-400 truncate">
                {assignedAssassin.alias}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <footer className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDetailsClick}
            className="flex-1"
            aria-label={`View details for ${mission.title}`}
          >
            <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
            Ver
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleEditClick}
            aria-label={`Edit ${mission.title}`}
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </Button>

          {canAssign && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleAssignClick}
              aria-label={`Assign ${mission.title} to an assassin`}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </footer>
      </article>
    );
  }
);

AdminMissionCard.displayName = "AdminMissionCard";
