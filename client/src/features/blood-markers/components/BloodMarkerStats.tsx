import React from "react";
import { Clock, DollarSign, Skull } from "lucide-react";
import type { BloodMarkerStatsProps } from "../types";

const StatCard = React.memo(function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  description,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  description?: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-orden-300 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${iconColor}`} aria-live="polite">
            {value}
          </p>
          {description && (
            <p className="text-xs text-orden-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-lg`} aria-hidden="true">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
});

export const BloodMarkerStats = React.memo(function BloodMarkerStats({
  stats,
}: BloodMarkerStatsProps) {
  return (
    <section aria-labelledby="stats-heading" className="mb-8">
      <h2 id="stats-heading" className="sr-only">
        Estadísticas de marcadores de sangre
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Deudas que debo"
          value={stats.owedByMe}
          icon={Skull}
          iconColor="text-red-400"
          bgColor="bg-red-500/20"
          description="Favores pendientes de pagar"
        />

        <StatCard
          title="Deudas que me deben"
          value={stats.owedToMe}
          icon={DollarSign}
          iconColor="text-gold-400"
          bgColor="bg-gold-500/20"
          description="Favores pendientes de cobrar"
        />

        <StatCard
          title="Pendientes de confirmar"
          value={stats.pendingConfirmation}
          icon={Clock}
          iconColor="text-yellow-400"
          bgColor="bg-yellow-500/20"
          description="Pagos esperando confirmación"
        />
      </div>
    </section>
  );
});
