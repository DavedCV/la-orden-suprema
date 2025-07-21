import React from "react";
import { Target, Calendar, Coins, Zap, Play, X } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { getStatusConfig, calculateDaysRemaining } from "../constants";
import type { Mission } from "../../../shared/types";

interface MissionDetailsModalProps {
  mission: Mission;
  onClose: () => void;
  onStartMission: (missionId: string) => void;
  isStarting: boolean;
}

export const MissionDetailsModal: React.FC<MissionDetailsModalProps> =
  React.memo(({ mission, onClose, onStartMission, isStarting }) => {
    const statusConfig = getStatusConfig(mission.status);
    const StatusIcon = statusConfig.icon;
    const canStart = mission.status === "Asignada";
    const daysRemaining = calculateDaysRemaining(mission.deadline);
    const isOverdue = daysRemaining < 0;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const handleStartClick = () => {
      onStartMission(mission.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        aria-modal="true"
      >
        <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-orden-700">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-orden-100 mb-1"
                >
                  {mission.title}
                </h2>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                  >
                    <div className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </div>
                  </div>
                  {isOverdue && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      Vencida
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Mission Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orden-400 mb-1">
                    Objetivo
                  </label>
                  <div className="flex items-center text-orden-100">
                    <Target className="h-4 w-4 text-orden-400 mr-2" />
                    {mission.targetName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-orden-400 mb-1">
                    Recompensa
                  </label>
                  <div className="flex items-center text-gold-400 font-medium">
                    <Coins className="h-4 w-4 mr-2" />
                    {formatCurrency(mission.reward)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orden-400 mb-1">
                    Fecha Límite
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-orden-400 mr-2" />
                    <span
                      className={isOverdue ? "text-red-400" : "text-orden-100"}
                    >
                      {formatDate(mission.deadline)}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      daysRemaining < 0
                        ? "text-red-400"
                        : daysRemaining <= 3
                        ? "text-yellow-400"
                        : "text-orden-500"
                    }`}
                  >
                    {daysRemaining < 0
                      ? `Vencida hace ${Math.abs(daysRemaining)} días`
                      : daysRemaining === 0
                      ? "Vence hoy"
                      : `${daysRemaining} días restantes`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-orden-400 mb-1">
                    Prioridad
                  </label>
                  <div className="flex items-center text-orden-100">
                    <Zap className="h-4 w-4 text-orden-400 mr-2" />
                    {mission.priority === "high"
                      ? "Alta"
                      : mission.priority === "medium"
                      ? "Media"
                      : "Baja"}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-orden-400 mb-2">
                Descripción de la Misión
              </label>
              <div className="bg-orden-900/50 rounded-lg p-4 border border-orden-700">
                <p
                  id="modal-description"
                  className="text-orden-200 leading-relaxed"
                >
                  {mission.description}
                </p>
              </div>
            </div>

            {/* Mission Stats */}
            <div className="bg-orden-900/30 rounded-lg p-4 border border-orden-700">
              <h4 className="text-sm font-medium text-orden-200 mb-3">
                Información Adicional
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-orden-400">ID de Misión:</span>
                  <span className="text-orden-300 font-mono text-xs">
                    {mission.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orden-400">Creada:</span>
                  <span className="text-orden-300">
                    {formatDate(mission.createdAt)}
                  </span>
                </div>
                {mission.assignedAt && (
                  <div className="flex justify-between">
                    <span className="text-orden-400">Asignada:</span>
                    <span className="text-orden-300">
                      {formatDate(mission.assignedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-orden-700">
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cerrar
              </Button>
              {canStart && (
                <Button
                  onClick={handleStartClick}
                  disabled={isStarting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isStarting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Misión
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

MissionDetailsModal.displayName = "MissionDetailsModal";
