import { Coins, Target, CheckCircle, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { formatCurrency } from "../../../shared/utils";
import type { AssassinDashboard } from "../../../shared/types";

interface AssassinStatsProps {
  data: AssassinDashboard;
}

export function AssassinStats({ data }: AssassinStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={<Coins className="h-6 w-6" />}
        title="Monedas de Oro"
        value={formatCurrency(data.stats.goldCoins)}
        subtitle="Balance actual"
        color="gold"
      />
      <StatCard
        icon={<Target className="h-6 w-6" />}
        title="Misiones Activas"
        value="0"
        subtitle="En progreso"
        color="yellow"
      />
      <StatCard
        icon={<CheckCircle className="h-6 w-6" />}
        title="Misiones Completadas"
        value={data.stats.missionsCompleted.toString()}
        subtitle="Total"
        color="green"
      />
      <StatCard
        icon={<TrendingUp className="h-6 w-6" />}
        title="Tasa de Éxito"
        value={`${data.stats.successRate}%`}
        subtitle="Rendimiento"
        color="blue"
      />
    </div>
  );
}
