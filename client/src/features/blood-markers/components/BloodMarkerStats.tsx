import React from "react";
import { ArrowDown, ArrowUp, Clock, Mail } from "lucide-react";
import type { BloodMarkerStats } from "../types";

interface BloodMarkerStatsComponentProps {
  stats: BloodMarkerStats;
}

export const BloodMarkerStatsComponent = React.memo(
  function BloodMarkerStatsComponent({
    stats,
  }: BloodMarkerStatsComponentProps) {
    const statsCards = [
      {
        title: "Solicitudes recibidas",
        value: stats.incomingRequests,
        icon: Mail,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        description: "Requieren tu respuesta",
      },
      {
        title: "Que me deben",
        value: stats.owedToMe,
        icon: ArrowUp,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        description: "Deudas a tu favor",
      },
      {
        title: "Que debo",
        value: stats.owedByMe,
        icon: ArrowDown,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        description: "Tus obligaciones pendientes",
      },
      {
        title: "Confirmaciones pendientes",
        value: stats.pendingConfirmation,
        icon: Clock,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        description: "Pagos esperando tu confirmación",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.title}
              className="card p-4 hover:border-red-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-orden-300 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-orden-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-orden-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

// Export with original name for backward compatibility
export { BloodMarkerStatsComponent as BloodMarkerStats };
