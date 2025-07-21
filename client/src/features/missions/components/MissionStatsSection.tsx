import { Target, AlertTriangle, Coins, Calendar } from "lucide-react";
import { formatCurrency } from "../utils/missionUtils";

interface MissionStatsProps {
  total: number;
  highPriority: number;
  maxReward: number;
  urgent: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({
  icon,
  value,
  label,
  iconColor,
  valueColor = "text-orden-100",
}: StatCardProps) {
  return (
    <div
      className="card p-4 text-center"
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <div className={`flex items-center justify-center mb-2 ${iconColor}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-orden-400">{label}</p>
    </div>
  );
}

export function MissionStatsSection({
  total,
  highPriority,
  maxReward,
  urgent,
}: MissionStatsProps) {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      aria-label="Estadísticas de misiones"
    >
      <StatCard
        icon={<Target className="h-5 w-5" aria-hidden="true" />}
        value={total}
        label="Misiones Disponibles"
        iconColor="text-blue-400"
      />

      <StatCard
        icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        value={highPriority}
        label="Alta Prioridad"
        iconColor="text-red-400"
      />

      <StatCard
        icon={<Coins className="h-5 w-5" aria-hidden="true" />}
        value={total > 0 ? formatCurrency(maxReward) : formatCurrency(0)}
        label="Máxima Recompensa"
        iconColor="text-gold-400"
        valueColor="text-gold-400"
      />

      <StatCard
        icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
        value={urgent}
        label="Urgentes (7 días)"
        iconColor="text-yellow-400"
      />
    </section>
  );
}
