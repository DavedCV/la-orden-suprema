import {
  Shield,
  ShieldOff,
  UserX,
  Eye,
  Coins,
  Target,
  Calendar,
  MapPin,
  Mail,
  User,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatCurrency, formatDate } from "../../../shared/utils";
import type { Assassin, AsassinStatus } from "../../../shared/types";

interface AssassinCardProps {
  assassin: Assassin;
  onStatusChange: (id: string, status: AsassinStatus) => void;
  onViewDetails: (assassin: Assassin) => void;
}

function getStatusColor(status: AsassinStatus) {
  switch (status) {
    case "Activo":
      return "text-green-400 bg-green-400/10 border-green-400/20";
    case "Retirado":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "Excommunicado":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-orden-400 bg-orden-400/10 border-orden-400/20";
  }
}

function getStatusIcon(status: AsassinStatus) {
  switch (status) {
    case "Activo":
      return <Shield className="h-4 w-4" />;
    case "Retirado":
      return <ShieldOff className="h-4 w-4" />;
    case "Excommunicado":
      return <UserX className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

export function AssassinCard({
  assassin,
  onStatusChange,
  onViewDetails,
}: AssassinCardProps) {
  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700 hover:border-orden-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gold-500/20 p-2 rounded-lg">
            <User className="h-5 w-5 text-gold-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orden-100">
              {assassin.alias}
            </h3>
            <p className="text-sm text-orden-400">
              {assassin.realName || "Nombre no especificado"}
            </p>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
            assassin.status
          )}`}
        >
          {getStatusIcon(assassin.status)}
          <span>{assassin.status}</span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-orden-300">
          <Mail className="h-4 w-4 mr-2 text-orden-400" />
          {assassin.email}
        </div>
        {assassin.lastKnownLocation && (
          <div className="flex items-center text-sm text-orden-300">
            <MapPin className="h-4 w-4 mr-2 text-orden-400" />
            {assassin.lastKnownLocation}
          </div>
        )}
        <div className="flex items-center text-sm text-orden-300">
          <Calendar className="h-4 w-4 mr-2 text-orden-400" />
          Miembro desde {formatDate(assassin.joinDate)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-orden-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="h-4 w-4 text-gold-400 mr-2" />
              <span className="text-xs text-orden-400">Monedas</span>
            </div>
            <span className="text-sm font-medium text-gold-400">
              {formatCurrency(assassin.goldCoins)}
            </span>
          </div>
        </div>
        <div className="bg-orden-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-xs text-orden-400">Misiones</span>
            </div>
            <span className="text-sm font-medium text-green-400">
              {assassin.completedMissions}
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {assassin.skills && assassin.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-orden-400 mb-2">Habilidades:</p>
          <div className="flex flex-wrap gap-1">
            {assassin.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orden-700 text-orden-300 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {assassin.skills.length > 3 && (
              <span className="px-2 py-1 bg-orden-700 text-orden-400 text-xs rounded">
                +{assassin.skills.length - 3} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {assassin.status === "Activo" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(assassin.id, "Retirado")}
              className="text-yellow-400 hover:text-yellow-300"
            >
              <ShieldOff className="h-3 w-3 mr-1" />
              Retirar
            </Button>
          )}
          {assassin.status === "Retirado" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(assassin.id, "Activo")}
              className="text-green-400 hover:text-green-300"
            >
              <Shield className="h-3 w-3 mr-1" />
              Activar
            </Button>
          )}
          {assassin.status !== "Excommunicado" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(assassin.id, "Excommunicado")}
              className="text-red-400 hover:text-red-300"
            >
              <UserX className="h-3 w-3 mr-1" />
              Excomulgar
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(assassin)}
          className="text-orden-300 hover:text-orden-100"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Detalles
        </Button>
      </div>
    </div>
  );
}
