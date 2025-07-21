import type { MissionStatus } from "../../../shared/types";
import {
  Clock,
  Play,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export const MISSION_STATUS_CONFIG = {
  "No Asignada": {
    color: "text-gray-400 bg-gray-500/20 border-gray-500/30",
    icon: Clock,
    label: "No Asignada"
  },
  "Asignada": {
    color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    icon: Clock,
    label: "Asignada"
  },
  "En Progreso": {
    color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    icon: Play,
    label: "En Progreso"
  },
  "Completada": {
    color: "text-green-400 bg-green-500/20 border-green-500/30",
    icon: CheckCircle,
    label: "Completada"
  },
  "Fallida": {
    color: "text-red-400 bg-red-500/20 border-red-500/30",
    icon: AlertTriangle,
    label: "Fallida"
  },
  "in_progress": {
    color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    icon: Play,
    label: "En Progreso"
  }
} as const;

export const MISSION_PRIORITY_CONFIG = {
  high: {
    color: "text-red-400 bg-red-500/20",
    label: "Alta"
  },
  medium: {
    color: "text-yellow-400 bg-yellow-500/20",
    label: "Media"
  },
  low: {
    color: "text-green-400 bg-green-500/20",
    label: "Baja"
  }
} as const;

export const MISSION_STAT_COLORS = {
  blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  green: "text-green-400 bg-green-500/20 border-green-500/30",
  red: "text-red-400 bg-red-500/20 border-red-500/30",
  gold: "text-gold-400 bg-gold-500/20 border-gold-500/30",
  gray: "text-gray-400 bg-gray-500/20 border-gray-500/30"
} as const;

export type MissionFilter = "all" | "no_asignada" | "asignada" | "en_progreso" | "completada" | "fallida";

// Import MissionStats from the hooks file
import type { MissionStats } from "../hooks/useMissionManagement";

export const MISSION_FILTER_MAP: Record<MissionFilter, MissionStatus | null> = {
  all: null,
  no_asignada: null,
  asignada: "Asignada",
  en_progreso: "En Progreso",
  completada: "Completada",
  fallida: "Fallida"
};

// Utility functions
export const getStatusConfig = (status: MissionStatus) => {
  return MISSION_STATUS_CONFIG[status] || MISSION_STATUS_CONFIG["Asignada"];
};

export const getPriorityConfig = (priority?: string) => {
  return MISSION_PRIORITY_CONFIG[priority as keyof typeof MISSION_PRIORITY_CONFIG] || MISSION_PRIORITY_CONFIG.medium;
};

export const calculateDaysRemaining = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const isOverdue = (deadline: string, status: MissionStatus) => {
  const daysRemaining = calculateDaysRemaining(deadline);
  return daysRemaining < 0 && status !== "Completada" && status !== "Fallida";
};

export const MISSION_FILTER_CONFIG: Array<{
  key: MissionFilter;
  title: string;
  color: "blue" | "gray" | "yellow" | "green" | "red";
  statKey: keyof MissionStats;
}> = [
  {
    key: "all",
    title: "Total",
    color: "blue",
    statKey: "total",
  },
  {
    key: "no_asignada",
    title: "Sin Asignar",
    color: "gray",
    statKey: "noAsignada",
  },
  {
    key: "asignada",
    title: "Asignadas",
    color: "blue",
    statKey: "asignada",
  },
  {
    key: "en_progreso",
    title: "En Progreso",
    color: "yellow",
    statKey: "enProgreso",
  },
  {
    key: "completada",
    title: "Completadas",
    color: "green",
    statKey: "completada",
  },
  {
    key: "fallida",
    title: "Fallidas",
    color: "red",
    statKey: "fallida",
  },
];

export const SEARCH_PLACEHOLDER = "Buscar por título, descripción o objetivo...";

export const EMPTY_STATE_MESSAGES = {
  NO_MISSIONS: {
    title: "No se encontraron misiones",
    withFilters: "Intenta ajustar los filtros de búsqueda",
    withoutFilters: "Comienza creando tu primera misión",
    buttonText: "Crear Primera Misión",
  },
} as const;
