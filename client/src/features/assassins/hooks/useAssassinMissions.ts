import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import type { Mission } from "../../../shared/types";
import {
  MISSION_FILTER_MAP,
  calculateDaysRemaining,
  isOverdue,
  type MissionFilter
} from "../../missions/constants";
// Extended stats interface for assassin missions
export interface AssassinMissionStats {
  total: number;
  noAsignada: number;
  asignada: number;
  enProgreso: number;
  completada: number;
  fallida: number;
  overdue: number;
  totalRewards: number;
}

export interface MissionWithActions extends Mission {
  canStart?: boolean;
  daysRemaining?: number;
  isOverdue?: boolean;
}

export function useAssassinMissions() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissionFilter>("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showMissionDetails, setShowMissionDetails] = useState(false);

  const queryClient = useQueryClient();

  // Fetch missions
  const { data: missionsData, isLoading, error } = useQuery({
    queryKey: ["missions"],
    queryFn: () => apiService.getMissions(),
  });

  // Start mission mutation
  const startMissionMutation = useMutation({
    mutationFn: (missionId: string) =>
      apiService.updateMissionStatus(missionId, "En Progreso"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["assassin-dashboard"] });
      toast({
        type: "success",
        title: "Misión iniciada",
        message: "Has iniciado la misión exitosamente. ¡Buena suerte!",
      });
      // Close modal if it's open
      if (showMissionDetails) {
        setShowMissionDetails(false);
        setSelectedMission(null);
      }
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo iniciar la misión. Inténtalo de nuevo.",
      });
    },
  });

  const missions = missionsData?.data || [];

  // Process missions for current assassin with enhanced data
  const assassinMissions: MissionWithActions[] = useMemo(() => {
    return missions
      .filter((mission) => mission.assignedTo === user?.id)
      .map((mission) => {
        const daysRemaining = calculateDaysRemaining(mission.deadline);
        const missionIsOverdue = isOverdue(mission.deadline, mission.status);

        return {
          ...mission,
          canStart: mission.status === "Asignada",
          daysRemaining,
          isOverdue: missionIsOverdue,
        };
      });
  }, [missions, user?.id]);

  // Apply search and filter logic
  const filteredMissions = useMemo(() => {
    return assassinMissions.filter((mission) => {
      // Search filter
      const matchesSearch = !searchQuery || [
        mission.title,
        mission.description,
        mission.targetName || ""
      ].some(field =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Status filter
      const targetStatus = MISSION_FILTER_MAP[statusFilter];
      const matchesStatus = !targetStatus || mission.status === targetStatus;

      return matchesSearch && matchesStatus;
    });
  }, [assassinMissions, searchQuery, statusFilter]);

  // Calculate mission statistics
  const missionStats: AssassinMissionStats = useMemo(() => {
    const completed = assassinMissions.filter((m) => m.status === "Completada");

    return {
      total: assassinMissions.length,
      noAsignada: assassinMissions.filter((m) => m.status === "No Asignada").length,
      asignada: assassinMissions.filter((m) => m.status === "Asignada").length,
      enProgreso: assassinMissions.filter((m) => m.status === "En Progreso").length,
      completada: completed.length,
      fallida: assassinMissions.filter((m) => m.status === "Fallida").length,
      overdue: assassinMissions.filter((m) => m.isOverdue).length,
      totalRewards: completed.reduce((sum, m) => sum + m.reward, 0),
    };
  }, [assassinMissions]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleStatusFilterChange = useCallback((filter: MissionFilter) => {
    setStatusFilter(filter);
  }, []);

  const handleStartMission = useCallback((missionId: string) => {
    startMissionMutation.mutate(missionId);
  }, [startMissionMutation]);

  const handleViewDetails = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    setShowMissionDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowMissionDetails(false);
    setSelectedMission(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    window.history.back();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  return {
    // Data
    missions: filteredMissions,
    missionStats,
    selectedMission,

    // Loading states
    isLoading,
    isStarting: startMissionMutation.isPending,
    hasError: !!error,

    // UI state
    searchQuery,
    statusFilter,
    showMissionDetails,

    // Handlers
    handleSearchChange,
    handleStatusFilterChange,
    handleStartMission,
    handleViewDetails,
    handleCloseDetails,
    handleBackToDashboard,
    clearFilters,
  };
}
