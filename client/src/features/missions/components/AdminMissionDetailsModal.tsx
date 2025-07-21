import React, { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import {
  X,
  Target,
  Calendar,
  Coins,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  UserPlus,
  Play,
  RotateCcw,
} from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { getStatusConfig } from "../constants";
import type { Mission, Assassin, MissionStatus } from "../../../shared/types";

interface AdminMissionDetailsModalProps {
  mission: Mission;
  assassins: Assassin[];
  onClose: () => void;
  onEdit: (mission: Mission) => void;
  onAssign: (mission: Mission) => void;
  onSuccess: () => void;
}

export const AdminMissionDetailsModal: React.FC<AdminMissionDetailsModalProps> =
  React.memo(({ mission, assassins, onClose, onEdit, onAssign, onSuccess }) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<MissionStatus>(
      mission.status
    );

    const assignedAssassin = mission.assignedTo
      ? assassins.find((a) => a.id === mission.assignedTo)
      : null;

    const statusConfig = getStatusConfig(selectedStatus);

    const handleStatusUpdate = async (newStatus: MissionStatus) => {
      if (newStatus === mission.status) return;

      try {
        setIsUpdatingStatus(true);
        setSelectedStatus(newStatus);

        await apiService.updateMissionStatus(mission.id, newStatus);

        toast({
          type: "success",
          title: "Estado actualizado",
          message: `El estado de la misión ha sido cambiado a "${newStatus}"`,
        });

        onSuccess();
      } catch {
        toast({
          type: "error",
          title: "Error",
          message: "Error al actualizar el estado de la misión",
        });
        setSelectedStatus(mission.status);
      } finally {
        setIsUpdatingStatus(false);
      }
    };

    const getAvailableStatusTransitions = (
      currentStatus: MissionStatus
    ): MissionStatus[] => {
      switch (currentStatus) {
        case "No Asignada":
          return ["Asignada"];
        case "Asignada":
          return ["En Progreso", "No Asignada"];
        case "En Progreso":
          return ["Completada", "Fallida", "Asignada"];
        case "Completada":
          return []; // Completed missions can't change status
        case "Fallida":
          return ["No Asignada"]; // Failed missions can be reassigned
        default:
          return [];
      }
    };

    const getStatusIcon = (status: MissionStatus) => {
      const config = getStatusConfig(status);
      const IconComponent = config.icon;
      return <IconComponent className="h-4 w-4" />;
    };

    const getPriorityColor = (priority?: string) => {
      switch (priority) {
        case "high":
          return "text-red-400 bg-red-500/20 border-red-500/30";
        case "medium":
          return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
        case "low":
          return "text-green-400 bg-green-500/20 border-green-500/30";
        default:
          return "text-orden-400 bg-orden-700/50 border-orden-600";
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

    const availableTransitions = getAvailableStatusTransitions(mission.status);

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
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
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gold-500/20 p-2 rounded-lg">
                <Target className="h-5 w-5 text-gold-400" />
              </div>
              <div>
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-orden-100"
                >
                  Detalles de la Misión
                </h3>
                <p className="text-sm text-orden-400">
                  Información completa y gestión de estado
                </p>
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

          <div className="flex h-[600px]">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Mission Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-orden-100 mb-2">
                  {mission.title}
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedStatus)}
                      {statusConfig.label}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      mission.priority
                    )}`}
                  >
                    Prioridad {getPriorityLabel(mission.priority)}
                  </div>
                </div>
              </div>

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

                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Fecha Límite
                    </label>
                    <div className="flex items-center text-orden-100">
                      <Calendar className="h-4 w-4 text-orden-400 mr-2" />
                      {formatDate(mission.deadline)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Asignado a
                    </label>
                    {assignedAssassin ? (
                      <div className="flex items-center text-orden-100">
                        <User className="h-4 w-4 text-orden-400 mr-2" />
                        <div>
                          <p className="font-medium">
                            {assignedAssassin.alias}
                          </p>
                          <p className="text-xs text-orden-400">
                            {assignedAssassin.realName}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-orden-400">
                        <User className="h-4 w-4 mr-2" />
                        Sin asignar
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Creada
                    </label>
                    <div className="flex items-center text-orden-100">
                      <Clock className="h-4 w-4 text-orden-400 mr-2" />
                      {formatDate(mission.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Última actualización
                    </label>
                    <div className="flex items-center text-orden-100">
                      <Clock className="h-4 w-4 text-orden-400 mr-2" />
                      {formatDate(mission.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-orden-400 mb-2">
                  Descripción
                </label>
                <div className="bg-orden-900/50 rounded-lg p-4 border border-orden-700">
                  <p className="text-orden-200 leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              </div>

              {/* Status Transitions */}
              {availableTransitions.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-orden-400 mb-3">
                    Cambiar Estado
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTransitions.map((status) => {
                      const config = getStatusConfig(status);
                      return (
                        <Button
                          key={status}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(status)}
                          disabled={isUpdatingStatus}
                          className={`${config.color} border`}
                        >
                          {isUpdatingStatus && selectedStatus === status ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <div className="mr-2">{getStatusIcon(status)}</div>
                          )}
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="w-80 border-l border-orden-700 bg-orden-900/50 p-6">
              <h4 className="text-sm font-medium text-orden-200 mb-4">
                Acciones
              </h4>

              <div className="space-y-3">
                <Button
                  onClick={() => onEdit(mission)}
                  className="w-full justify-start"
                  variant="ghost"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Misión
                </Button>

                {mission.status === "No Asignada" && (
                  <Button
                    onClick={() => onAssign(mission)}
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Asignar Asesino
                  </Button>
                )}

                {mission.status === "Asignada" && (
                  <Button
                    onClick={() => handleStatusUpdate("En Progreso")}
                    className="w-full justify-start bg-yellow-600 hover:bg-yellow-700"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Iniciar Misión
                  </Button>
                )}

                {mission.status === "En Progreso" && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate("Completada")}
                      className="w-full justify-start bg-green-600 hover:bg-green-700"
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus && selectedStatus === "Completada" ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Marcar Completada
                    </Button>

                    <Button
                      onClick={() => handleStatusUpdate("Fallida")}
                      className="w-full justify-start bg-red-600 hover:bg-red-700"
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus && selectedStatus === "Fallida" ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      Marcar Fallida
                    </Button>
                  </>
                )}

                {mission.status === "Fallida" && (
                  <Button
                    onClick={() => handleStatusUpdate("No Asignada")}
                    className="w-full justify-start bg-gray-600 hover:bg-gray-700"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Reiniciar Misión
                  </Button>
                )}
              </div>

              {/* Mission Stats */}
              <div className="mt-8 pt-6 border-t border-orden-700">
                <h4 className="text-sm font-medium text-orden-200 mb-4">
                  Estadísticas
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orden-400">ID:</span>
                    <span className="text-orden-300 font-mono text-xs">
                      {mission.id}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-orden-400">Días restantes:</span>
                    <span className="text-orden-300">
                      {Math.max(
                        0,
                        Math.ceil(
                          (new Date(mission.deadline).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )}
                    </span>
                  </div>

                  {assignedAssassin && (
                    <div className="flex justify-between">
                      <span className="text-orden-400">Asesino ID:</span>
                      <span className="text-orden-300 font-mono text-xs">
                        {assignedAssassin.id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-orden-700">
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  });

AdminMissionDetailsModal.displayName = "AdminMissionDetailsModal";
