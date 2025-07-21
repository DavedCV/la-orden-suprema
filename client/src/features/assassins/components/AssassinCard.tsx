import React, { useMemo } from "react";
import { Eye, Coins, Target } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatCurrency } from "../../../shared/utils";
import { getStatusColor, getStatusIcon, getStatusActions } from "../utils";
import type { Assassin, AsassinStatus } from "../../../shared/types";

interface AssassinCardProps {
  assassin: Assassin;
  onStatusChange: (id: string, status: AsassinStatus) => void;
  onViewDetails: (assassin: Assassin) => void;
  isUpdating?: boolean;
}

export const AssassinCard: React.FC<AssassinCardProps> = React.memo(
  ({ assassin, onStatusChange, onViewDetails, isUpdating = false }) => {
    const StatusIcon = getStatusIcon(assassin.status);
    const statusActions = getStatusActions(assassin.status);

    // Memoized values to prevent recalculation
    const statusColorClass = useMemo(
      () => getStatusColor(assassin.status),
      [assassin.status]
    );
    const formattedGoldCoins = useMemo(
      () => formatCurrency(assassin.goldCoins),
      [assassin.goldCoins]
    );
    const avatarLetter = useMemo(
      () => assassin.alias.charAt(0).toUpperCase(),
      [assassin.alias]
    );

    // Memoized skills display
    const skillsDisplay = useMemo(() => {
      if (!assassin.skills || assassin.skills.length === 0) return null;

      const visibleSkills = assassin.skills.slice(0, 5);
      const remainingCount = assassin.skills.length - 5;

      return (
        <div className="mt-4 pt-4 border-t border-orden-700">
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="px-2 py-1 bg-orden-700 text-orden-300 text-xs rounded-md border border-orden-600"
              >
                {skill}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-1 bg-orden-700/50 text-orden-400 text-xs rounded-md border border-orden-600">
                +{remainingCount} más
              </span>
            )}
          </div>
        </div>
      );
    }, [assassin.skills]);

    const handleViewDetails = () => onViewDetails(assassin);
    const handleStatusChange = (newStatus: AsassinStatus) =>
      onStatusChange(assassin.id, newStatus);

    return (
      <article
        className="bg-orden-800 rounded-lg p-6 border border-orden-700 hover:border-orden-600 transition-colors"
        aria-label={`Asesino ${assassin.alias}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div
              className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-gold-400 font-bold text-lg">
                {avatarLetter}
              </span>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                {assassin.alias}
              </h3>
              <p className="text-orden-400 text-sm">{assassin.email}</p>
              {assassin.realName && (
                <p className="text-orden-500 text-sm">({assassin.realName})</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Stats */}
            <div
              className="text-right space-y-1"
              role="group"
              aria-label="Estadísticas del asesino"
            >
              <div className="flex items-center text-sm text-orden-300">
                <Coins
                  className="h-4 w-4 mr-1 text-gold-400"
                  aria-hidden="true"
                />
                <span aria-label={`${formattedGoldCoins} monedas de oro`}>
                  {formattedGoldCoins}
                </span>
              </div>
              <div className="flex items-center text-sm text-orden-300">
                <Target className="h-4 w-4 mr-1" aria-hidden="true" />
                <span
                  aria-label={`${assassin.completedMissions} misiones completadas`}
                >
                  {assassin.completedMissions} misiones
                </span>
              </div>
            </div>

            {/* Status */}
            <div
              className={`px-3 py-1 rounded-lg border text-sm font-medium flex items-center ${statusColorClass}`}
              role="status"
              aria-label={`Estado: ${assassin.status}`}
            >
              <StatusIcon className="h-4 w-4" aria-hidden="true" />
              <span className="ml-1">{assassin.status}</span>
            </div>

            {/* Actions */}
            <div
              className="flex space-x-2"
              role="group"
              aria-label="Acciones del asesino"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={handleViewDetails}
                className="text-orden-400 hover:text-orden-200"
                disabled={isUpdating}
                aria-label={`Ver detalles de ${assassin.alias}`}
              >
                <Eye className="h-4 w-4" />
              </Button>

              {statusActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={action.status}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusChange(action.status)}
                    className={action.color}
                    title={action.title}
                    disabled={isUpdating}
                    aria-label={action.title}
                  >
                    <ActionIcon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skills */}
        {skillsDisplay}
      </article>
    );
  }
);

AssassinCard.displayName = "AssassinCard";
