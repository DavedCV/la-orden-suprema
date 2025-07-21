import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../../shared/services/api";
import type { Mission, Assassin } from "../../../shared/types";

export type MissionFilter =
  | "all"
  | "no_asignada"
  | "asignada"
  | "en_progreso"
  | "completada"
  | "fallida";

export interface MissionStats {
  total: number;
  noAsignada: number;
  asignada: number;
  enProgreso: number;
  completada: number;
  fallida: number;
}

export function useMissionManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissionFilter>("all");

  // Fetch missions
  const {
    data: missionsData,
    isLoading: isLoadingMissions,
    error: missionsError,
  } = useQuery({
    queryKey: ["missions"],
    queryFn: () => apiService.getMissions(),
  });

  // Fetch assassins for assignment
  const {
    data: assassinsData,
    isLoading: isLoadingAssassins,
    error: assassinsError,
  } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  const missions = missionsData?.data || [];
  const assassins = assassinsData?.data || [];

  // Filter missions
  const filteredMissions = useMemo(() => {
    return missions.filter((mission: Mission) => {
      const matchesSearch =
        mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.targetName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        mission.status.toLowerCase().replace(" ", "_") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [missions, searchQuery, statusFilter]);

  // Get mission stats
  const missionStats: MissionStats = useMemo(() => {
    return {
      total: missions.length,
      noAsignada: missions.filter((m: Mission) => m.status === "No Asignada").length,
      asignada: missions.filter((m: Mission) => m.status === "Asignada").length,
      enProgreso: missions.filter((m: Mission) => m.status === "En Progreso").length,
      completada: missions.filter((m: Mission) => m.status === "Completada").length,
      fallida: missions.filter((m: Mission) => m.status === "Fallida").length,
    };
  }, [missions]);

  // Filter active assassins for assignments
  const activeAssassins = useMemo(() => {
    return assassins.filter((a: Assassin) => a.status === "Activo");
  }, [assassins]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const isLoading = isLoadingMissions || isLoadingAssassins;
  const hasError = missionsError || assassinsError;

  return {
    // Data
    missions,
    assassins,
    filteredMissions,
    activeAssassins,
    missionStats,

    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters,

    // State
    isLoading,
    hasError,

    // Derived state
    hasNoResults: filteredMissions.length === 0,
    hasFiltersApplied: Boolean(searchQuery || statusFilter !== "all"),
  };
}
