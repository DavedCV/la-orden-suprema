import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { ArrowLeft, Target } from "lucide-react";
import type { Mission } from "../../../shared/types";
import { AvailableMissionCard } from "./AvailableMissionCard";
import { MissionFiltersSection } from "./MissionFiltersSection";
import { MissionStatsSection } from "./MissionStatsSection";
import { MissionEmptyState } from "./MissionEmptyState";
import {
  filterMissions,
  sortMissions,
  getMissionStats,
} from "../utils/missionUtils";

export function AvailableMissionsPage() {
  const { goToDashboard } = useNavigation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "reward" | "priority">(
    "deadline"
  );

  // Fetch available missions (status "No Asignada")
  const {
    data: missionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-missions"],
    queryFn: () => apiService.getAvailableMissions(),
  });

  // Mutation for taking missions
  const takeMissionMutation = useMutation({
    mutationFn: (missionId: string) => apiService.applyToMission(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-missions"] });
      queryClient.invalidateQueries({ queryKey: ["assassin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["assassin-missions"] });
      toast({
        type: "success",
        title: "Misión tomada",
        message:
          "Has tomado la misión exitosamente. Ahora puedes iniciarla desde tu panel.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo tomar la misión. Inténtalo de nuevo.",
      });
    },
  });

  const missions = missionsData?.data || [];

  // Filter and sort missions using utility functions
  const filteredMissions = useMemo(() => {
    const filtered = filterMissions(missions, searchQuery, priorityFilter);
    return sortMissions(filtered, sortBy);
  }, [missions, searchQuery, priorityFilter, sortBy]);

  // Calculate mission statistics
  const missionStats = useMemo(() => getMissionStats(missions), [missions]);

  // Check if filters are active
  const hasActiveFilters = searchQuery !== "" || priorityFilter !== "all";

  // Event handlers
  const handleTakeMission = useCallback(
    (missionId: string) => {
      takeMissionMutation.mutate(missionId);
    },
    [takeMissionMutation]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setPriorityFilter("all");
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando misiones disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Target className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-orden-100">
            Error al cargar misiones
          </h2>
          <p className="text-orden-400">
            No se pudieron cargar las misiones disponibles. Verifica tu
            conexión.
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile layout: stack vertically */}
          <div className="flex flex-col space-y-4 py-4 sm:hidden">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToDashboard}
                className="text-orden-300 hover:text-orden-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Target className="h-6 w-6 text-gold-400" />

              <div className="flex-1">
                <h1 className="text-lg font-bold text-gold-400">
                  Misiones Disponibles
                </h1>
                <p className="text-sm text-orden-400">
                  Postúlate a misiones disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Desktop layout: horizontal */}
          <div className="hidden sm:flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToDashboard}
                className="text-orden-300 hover:text-orden-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-gold-400" />
              <div>
                <h1 className="text-xl font-bold text-gold-400">
                  Misiones Disponibles
                </h1>
                <p className="text-sm text-orden-400">
                  Postúlate a misiones que se ajusten a tus habilidades
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mission Statistics */}
        <MissionStatsSection
          total={missionStats.total}
          highPriority={missionStats.highPriority}
          maxReward={missionStats.maxReward}
          urgent={missionStats.urgent}
        />

        {/* Filters */}
        <MissionFiltersSection
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
          sortBy={sortBy}
          onSearchChange={setSearchQuery}
          onPriorityChange={setPriorityFilter}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Missions Grid */}
        {filteredMissions.length === 0 ? (
          <MissionEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMissions.map((mission: Mission) => (
              <AvailableMissionCard
                key={mission.id}
                mission={mission}
                onApply={handleTakeMission}
                isApplying={takeMissionMutation.isPending}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
