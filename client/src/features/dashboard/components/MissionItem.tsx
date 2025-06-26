import { ArrowRight, Clock, Coins, Target } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils";

interface MissionItemProps {
  title: string;
  target: string;
  reward: string;
  status: string;
  deadline: string;
  onNavigate: (path: string) => void;
}

export function MissionItem({
  title,
  target,
  reward,
  status,
  deadline,
  onNavigate,
}: MissionItemProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "en_progreso":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "completada":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "fallida":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-orden-400 bg-orden-400/10 border-orden-400/20";
    }
  };

  const canProgressMission = (status: string) => {
    return ["pendiente", "en_progreso"].includes(status.toLowerCase());
  };

  return (
    <div className="bg-orden-700/50 rounded-lg p-4 border border-orden-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-orden-100 truncate">{title}</h4>
          <p className="text-sm text-orden-400 flex items-center mt-1">
            <Target className="h-4 w-4 mr-1" />
            {target}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm text-orden-300">
          <Coins className="h-4 w-4 mr-1 text-gold-400" />
          <span className="text-gold-400 font-medium">{reward}</span>
        </div>
        <div className="flex items-center text-sm text-orden-400">
          <Clock className="h-4 w-4 mr-1" />
          {formatDate(deadline)}
        </div>
      </div>

      {canProgressMission(status) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate("/missions")}
          className="w-full"
        >
          Ver Detalles
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
