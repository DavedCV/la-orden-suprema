import React from "react";
import { StatCard } from "./StatCard";
import { Users, Target, Coins, BarChart3 } from "lucide-react";
import { formatCurrency } from "../../../shared/utils";
import type { AdminDashboard } from "../../../shared/types";

interface AdminStatsProps {
  data: AdminDashboard;
}

export const AdminStats = React.memo(function AdminStats({
  data,
}: AdminStatsProps) {
  return (
    <>
      <StatCard
        icon={<Users className="h-6 w-6" />}
        title="Asesinos Activos"
        value={data.stats.activeAssassins.toString()}
        subtitle={`${data.stats.totalAssassins} total`}
        color="blue"
      />
      <StatCard
        icon={<Target className="h-6 w-6" />}
        title="Misiones Activas"
        value={data.stats.activeMissions.toString()}
        subtitle={`${data.stats.completedMissions} completadas`}
        color="yellow"
      />
      <StatCard
        icon={<Coins className="h-6 w-6" />}
        title="Fondos Disponibles"
        value={formatCurrency(data.stats.totalGoldCoins)}
        subtitle="Monedas de Oro"
        color="gold"
      />
      <StatCard
        icon={<BarChart3 className="h-6 w-6" />}
        title="Blood Markers"
        value={data.stats.outstandingBloodMarkers.toString()}
        subtitle="Pendientes"
        color="green"
      />
    </>
  );
});
