import { memo, useEffect } from "react";
import {
  User,
  Skull,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Edit,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils";
import { useAuthStore } from "../../../shared/store/authStore";
import type {
  Assassin,
  BloodMarker,
  AsassinStatus,
} from "../../../shared/types";

interface AssassinDetailsModalProps {
  assassin: Assassin;
  relationship?: {
    owedByMe: number;
    owedToMe: number;
    markers: BloodMarker[];
    total: number;
  } | null;
  onClose: () => void;
  onUpdate?: () => void; // For backward compatibility
  onEdit?: (assassin: Assassin) => void; // New prop for edit functionality
}

export const AssassinDetailsModal = memo(function AssassinDetailsModal({
  assassin,
  relationship,
  onClose,
  onEdit,
}: AssassinDetailsModalProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getStatusColor = (status: AsassinStatus) => {
    switch (status) {
      case "Activo":
        return "text-green-400";
      case "Retirado":
        return "text-yellow-400";
      case "Excommunicado":
        return "text-red-400";
      default:
        return "text-orden-400";
    }
  };

  const getMarkerStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "Pago Pendiente de Confirmación":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case "Saldado":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-orden-400" />;
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      aria-modal="true"
    >
      <div className="bg-orden-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <User className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-orden-100">
                {assassin.alias}
              </h2>
              <p
                className={`text-sm font-medium ${getStatusColor(
                  assassin.status
                )}`}
              >
                {assassin.status}
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

        {/* Content */}
        <div id="modal-description" className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orden-200">
                {assassin.completedMissions}
              </div>
              <div className="text-sm text-orden-400">Misiones Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-400">
                {assassin.goldCoins.toLocaleString()}
              </div>
              <div className="text-sm text-orden-400">Monedas de Oro</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatDate(assassin.joinDate).split(" ")[0]}
              </div>
              <div className="text-sm text-orden-400">Fecha de Ingreso</div>
            </div>
          </div>

          {/* Skills */}
          {assassin.skills && assassin.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orden-100 mb-3">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {assassin.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Blood Markers Relationship */}
          {relationship && relationship.markers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orden-100 mb-3 flex items-center">
                <Skull className="h-5 w-5 mr-2 text-red-400" />
                Marcadores de Sangre
              </h3>
              <div className="space-y-3">
                {relationship.markers.map((marker: BloodMarker) => (
                  <div
                    key={marker.id}
                    className="bg-orden-900/50 rounded-lg p-4 border border-orden-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-orden-200 flex-1">
                        {marker.description}
                      </p>
                      <div className="flex items-center space-x-1 ml-3">
                        {getMarkerStatusIcon(marker.status)}
                        <span className="text-xs text-orden-400">
                          {marker.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-orden-500">
                      <span>{formatDate(marker.createdAt)}</span>
                      <span>
                        {marker.debtorId === assassin.id
                          ? "Te debe"
                          : "Le debes"}
                      </span>
                    </div>
                  </div>
                ))}
                {relationship.total > 3 && (
                  <p className="text-sm text-orden-400 text-center">
                    +{relationship.total - 3} marcadores más
                  </p>
                )}
              </div>
            </div>
          )}

          {!relationship && (
            <div className="text-center py-8">
              <Skull className="h-12 w-12 text-orden-600 mx-auto mb-4" />
              <p className="text-orden-400">
                No tienes marcadores de sangre con este asesino
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-orden-700">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {isAdmin && (
            <Button
              onClick={() => onEdit?.(assassin)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
