import type { MissionFilter, MissionStats } from "../hooks/useMissionManagement";

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
