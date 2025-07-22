import React from "react";
import { Bell, CheckCircle } from "lucide-react";
import { formatDate } from "../../../shared/utils";
import type { AdminDashboard, AssassinDashboard } from "../../../shared/types";

interface ActivityFeedProps {
  data: AdminDashboard | AssassinDashboard;
  type: "admin" | "assassin";
}

export const ActivityFeed = React.memo(function ActivityFeed({
  data,
  type,
}: ActivityFeedProps) {
  if (type === "admin") {
    const adminData = data as AdminDashboard;
    return (
      <>
        {adminData.recentActivity.map((activity) => (
          <ActivityItem
            key={activity.id}
            title={activity.message.split(" ").slice(0, 3).join(" ")}
            subtitle={activity.message}
            time={formatDate(activity.timestamp)}
          />
        ))}
        {adminData.recentActivity.length === 0 && (
          <div className="text-center py-8 text-orden-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividad reciente</p>
          </div>
        )}
      </>
    );
  }

  const assassinData = data as AssassinDashboard;
  return (
    <>
      {assassinData.recentActivity.slice(0, 5).map((activity) => (
        <ActivityItem
          key={activity.id}
          title={activity.message}
          subtitle={getActivityTypeLabel(activity.type)}
          time={formatDate(activity.timestamp)}
        />
      ))}
      {assassinData.recentActivity.length === 0 && (
        <div className="text-center py-8 text-orden-400">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay actividad reciente</p>
        </div>
      )}
    </>
  );
});

function ActivityItem({
  title,
  subtitle,
  time,
}: {
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-orden-800/50 hover:bg-orden-800 transition-colors">
      <div className="bg-gold-500/20 p-2 rounded-full">
        <CheckCircle className="h-4 w-4 text-gold-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-orden-200">{title}</p>
        <p className="text-xs text-orden-400 mt-1">{subtitle}</p>
        <p className="text-xs text-orden-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function getActivityTypeLabel(type: string): string {
  switch (type) {
    case "mission_assigned":
      return "Misión asignada";
    case "mission_completed":
      return "Misión completada";
    case "mission_failed":
      return "Misión fallida";
    case "debt_created":
      return "Marcador creado";
    case "debt_paid":
      return "Deuda saldada";
    case "profile_updated":
      return "Perfil actualizado";
    default:
      return "Actividad del sistema";
  }
}
