import { Users, Target, Coins, BarChart3 } from "lucide-react";
import { StatCard } from "./StatCard";
import { formatCurrency } from "../../../shared/utils";
import type { AdminDashboard } from "../../../shared/types";

interface AdminStatsProps {
  data: AdminDashboard;
}

export function AdminStats({ data }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={<Users className="h-6 w-6" />}
        title="Asesinos Activos"
        value={data.stats.totalAssassins.toString()}
        subtitle="Registrados en la orden"
        color="blue"
      />
      <StatCard
        icon={<Target className="h-6 w-6" />}
        title="Misiones Activas"
        value={data.stats.activeMissions.toString()}
        subtitle="En curso"
        color="yellow"
      />
      <StatCard
        icon={<Coins className="h-6 w-6" />}
        title="Monedas en Circulación"
        value={formatCurrency(data.stats.totalGoldCoins)}
        subtitle="Total del sistema"
        color="gold"
      />
      <StatCard
        icon={<BarChart3 className="h-6 w-6" />}
        title="Misiones Completadas"
        value={data.stats.completedMissions.toString()}
        subtitle="Este mes"
        color="green"
      />
    </div>
  );
}
