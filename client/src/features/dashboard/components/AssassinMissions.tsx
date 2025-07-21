import { Button } from "../../../shared/components/Button";
import { Target, ArrowRight, Clock } from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils";
import type { AssassinDashboard } from "../../../shared/types";

interface AssassinMissionsProps {
  data: AssassinDashboard;
  onNavigate: (path: string) => void;
}

export function AssassinMissions({ data, onNavigate }: AssassinMissionsProps) {
  return (
    <>
      {data.activeMissions.slice(0, 3).map((mission) => (
        <MissionItem
          key={mission.id}
          title={mission.title}
          target={mission.description}
          reward={formatCurrency(mission.reward)}
          status={mission.status}
          deadline={formatDate(mission.deadline)}
          onNavigate={onNavigate}
        />
      ))}
      {data.activeMissions.length === 0 && (
        <div className="text-center py-8 text-orden-400">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tienes misiones activas</p>
        </div>
      )}
      {data.activeMissions.length > 3 && (
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate("/my-missions")}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center space-x-1"
          >
            <span>Ver todas las misiones ({data.activeMissions.length})</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
      {data.activeMissions.length > 0 && data.activeMissions.length <= 3 && (
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate("/my-missions")}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center space-x-1"
          >
            <span>Ver mis misiones</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
}

function MissionItem({
  title,
  target,
  reward,
  status,
  deadline,
  onNavigate,
}: {
  title: string;
  target: string;
  reward: string;
  status: string;
  deadline: string;
  onNavigate: (path: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
      case "en progreso":
        return "text-yellow-400 bg-yellow-500/20";
      case "asignada":
        return "text-blue-400 bg-blue-500/20";
      case "completada":
        return "text-green-400 bg-green-500/20";
      case "fallida":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-orden-400 bg-orden-700/50";
    }
  };

  const canProgressMission = (status: string) => {
    return status === "Asignada";
  };

  return (
    <div className="flex items-start space-x-3 p-4 rounded-lg bg-orden-800/50 hover:bg-orden-800 transition-colors border border-orden-700/50">
      <div className="bg-gold-500/20 p-2 rounded-full">
        <Target className="h-4 w-4 text-gold-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-orden-200">{title}</h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          </div>
        </div>
        <p className="text-xs text-orden-400 mb-2">{target}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gold-400 font-medium">{reward}</span>
          <div className="flex items-center text-orden-500">
            <Clock className="h-3 w-3 mr-1" />
            {deadline}
          </div>
        </div>
        {canProgressMission(status) && (
          <div className="mt-3 pt-3 border-t border-orden-700">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
              onClick={() => onNavigate("/my-missions")}
            >
              Ver y Gestionar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
