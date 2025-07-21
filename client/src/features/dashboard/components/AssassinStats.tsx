import React from "react";
import { StatCard } from "./StatCard";
import { Target, Coins, Skull, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../shared/utils";
import type { AssassinDashboard } from "../../../shared/types";

interface AssassinStatsProps {
  data: AssassinDashboard;
}

export const AssassinStats = React.memo(function AssassinStats({
  data,
}: AssassinStatsProps) {
  return (
    <>
      <StatCard
        icon={<Target className="h-6 w-6" />}
        title="Misiones Activas"
        value={data.activeMissions.length.toString()}
        subtitle={`${data.stats.missionsCompleted} completadas`}
        color="blue"
      />
      <StatCard
        icon={<Coins className="h-6 w-6" />}
        title="Monedas de Oro"
        value={formatCurrency(data.stats.goldCoins)}
        subtitle={`Tasa de éxito: ${data.stats.successRate}%`}
        color="gold"
      />
      <StatCard
        icon={<Skull className="h-6 w-6" />}
        title="Mis Deudas"
        value={data.stats.bloodMarkersOwed.toString()}
        subtitle="Marcadores pendientes"
        color="yellow"
      />
      <StatCard
        icon={<TrendingUp className="h-6 w-6" />}
        title="Me Deben"
        value={data.stats.bloodMarkersOwing.toString()}
        subtitle="Por confirmar"
        color="green"
      />
    </>
  );
});
