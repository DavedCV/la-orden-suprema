import React from "react";
import {
  Skull,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { BloodMarker } from "../../../shared/types";

interface BloodMarkerStatsProps {
  bloodMarkers: BloodMarker[];
  currentUserId: string;
}

export function BloodMarkerStats({
  bloodMarkers,
  currentUserId,
}: BloodMarkerStatsProps) {
  const stats = React.useMemo(() => {
    const myDebts = bloodMarkers.filter(
      (marker) => marker.debtorId === currentUserId
    );
    const owedToMe = bloodMarkers.filter(
      (marker) => marker.creditorId === currentUserId
    );

    return {
      total: bloodMarkers.length,
      myDebtsPending: myDebts.filter((m) => m.status === "Pendiente").length,
      myDebtsAwaitingConfirmation: myDebts.filter(
        (m) => m.status === "Pago Pendiente de Confirmación"
      ).length,
      owedToMePending: owedToMe.filter((m) => m.status === "Pendiente").length,
      owedToMeAwaitingConfirmation: owedToMe.filter(
        (m) => m.status === "Pago Pendiente de Confirmación"
      ).length,
      pendingRequests: owedToMe.filter(
        (m) => m.status === "Solicitud Pendiente"
      ).length,
      settled: bloodMarkers.filter((m) => m.status === "Saldado").length,
      rejected: bloodMarkers.filter((m) => m.status === "Rechazada").length,
    };
  }, [bloodMarkers, currentUserId]);

  const statCards = [
    {
      title: "Total",
      value: stats.total,
      icon: <Skull className="h-4 w-4" />,
      color: "text-red-400 bg-red-500/20",
    },
    {
      title: "Mis Deudas",
      value: stats.myDebtsPending,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-yellow-400 bg-yellow-500/20",
    },
    {
      title: "Me Deben",
      value: stats.owedToMePending,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-400 bg-green-500/20",
    },
    {
      title: "Solicitudes",
      value: stats.pendingRequests,
      icon: <Clock className="h-4 w-4" />,
      color: "text-blue-400 bg-blue-500/20",
    },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-orden-200 mb-4">
        Estadísticas
      </h3>
      <div className="space-y-3">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-orden-900 rounded-lg border border-orden-700"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-sm text-orden-200">{stat.title}</span>
            </div>
            <span className="text-lg font-semibold text-orden-100">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-orden-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-orden-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Esperando confirmación
            </span>
            <span className="text-orden-300">
              {stats.myDebtsAwaitingConfirmation +
                stats.owedToMeAwaitingConfirmation}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-orden-400 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saldados
            </span>
            <span className="text-green-400">{stats.settled}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-orden-400 flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              Rechazados
            </span>
            <span className="text-red-400">{stats.rejected}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
