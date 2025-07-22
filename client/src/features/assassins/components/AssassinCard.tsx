import { memo } from "react";
import {
  Shield,
  ShieldOff,
  UserX,
  Skull,
  TrendingUp,
  Eye,
  Clock,
  User,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import type {
  Assassin,
  BloodMarker,
  AsassinStatus,
} from "../../../shared/types";

interface AssassinCardProps {
  assassin: Assassin;
  relationship?: {
    owedByMe: number;
    owedToMe: number;
    markers: BloodMarker[];
    total: number;
  } | null;
  onViewDetails: (() => void) | ((assassin: Assassin) => void);
  // Backward compatibility props
  onStatusChange?: (id: string, status: AsassinStatus) => void;
  isUpdating?: boolean;
}

export const AssassinCard = memo(function AssassinCard({
  assassin,
  relationship,
  onViewDetails,
  isUpdating = false,
}: AssassinCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails.length === 0) {
      // No parameters expected
      (onViewDetails as () => void)();
    } else {
      // Assassin parameter expected
      (onViewDetails as (assassin: Assassin) => void)(assassin);
    }
  };
  const getStatusIcon = (status: AsassinStatus) => {
    switch (status) {
      case "Activo":
        return <Shield className="h-4 w-4 text-green-400" />;
      case "Retirado":
        return <ShieldOff className="h-4 w-4 text-yellow-400" />;
      case "Excommunicado":
        return <UserX className="h-4 w-4 text-red-400" />;
      default:
        return <User className="h-4 w-4 text-orden-400" />;
    }
  };

  const getStatusColor = (status: AsassinStatus) => {
    switch (status) {
      case "Activo":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "Retirado":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "Excommunicado":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-orden-400 bg-orden-700/50 border-orden-600/30";
    }
  };

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700 hover:border-purple-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-2 rounded-full">
            <User className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orden-100">
              {assassin.alias}
            </h3>
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                assassin.status
              )}`}
            >
              {getStatusIcon(assassin.status)}
              <span>{assassin.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-orden-200">
            {assassin.completedMissions}
          </div>
          <div className="text-xs text-orden-400">Misiones</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gold-400">
            {Math.floor((assassin.goldCoins || 0) / 1000)}K
          </div>
          <div className="text-xs text-orden-400">Monedas</div>
        </div>
      </div>

      {/* Relationship Status */}
      {relationship && (
        <div className="bg-orden-900/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-orden-300">
              Marcadores de Sangre
            </span>
            <Skull className="h-4 w-4 text-red-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {relationship.owedByMe > 0 && (
              <div className="flex items-center space-x-1 text-red-400">
                <Clock className="h-3 w-3" />
                <span>Debo: {relationship.owedByMe}</span>
              </div>
            )}
            {relationship.owedToMe > 0 && (
              <div className="flex items-center space-x-1 text-gold-400">
                <TrendingUp className="h-3 w-3" />
                <span>Me debe: {relationship.owedToMe}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleViewDetails}
          className="flex-1"
          aria-label={`Ver detalles de ${assassin.alias}`}
          disabled={isUpdating}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
      </div>
    </div>
  );
});
