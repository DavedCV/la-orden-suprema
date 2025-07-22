import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import type { Assassin, AsassinStatus } from "../../../shared/types";

export function useAssassinDirectory() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AsassinStatus | "Todos">("Todos");
  const [selectedAssassin, setSelectedAssassin] = useState<Assassin | null>(null);

  // Fetch assassins data
  const {
    data: assassinsData,
    isLoading: isLoadingAssassins,
    error: assassinsError
  } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(1, 1000), // Get up to 1000 assassins for directory
  });

  // Fetch blood markers to show relationships
  const {
    data: bloodMarkersData,
    isLoading: isLoadingMarkers,
    error: markersError
  } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
  });

  const assassins = assassinsData?.data || [];
  const bloodMarkers = bloodMarkersData?.data || [];
  const isLoading = isLoadingAssassins || isLoadingMarkers;
  const hasError = assassinsError || markersError;

  // Memoize the user's blood marker relationships for better performance
  const userBloodMarkers = useMemo(() => {
    if (!user?.id) return [];
    return bloodMarkers.filter(
      (marker) => marker.debtorId === user.id || marker.creditorId === user.id
    );
  }, [bloodMarkers, user?.id]);

  // Memoize filtered assassins to avoid recalculation on every render
  const filteredAssassins = useMemo(() => {
    return assassins
      .filter((assassin) => assassin.id !== user?.id) // Don't show current user
      .filter((assassin) => {
        const matchesSearch = assassin.alias
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "Todos" || assassin.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [assassins, user?.id, searchQuery, statusFilter]);

  // Memoize status counts to avoid recalculation
  const statusCounts = useMemo(() => {
    const counts = assassins.reduce(
      (acc, assassin) => {
        if (assassin.id === user?.id) return acc; // Don't count current user
        acc[assassin.status] = (acc[assassin.status] || 0) + 1;
        return acc;
      },
      {} as Record<AsassinStatus, number>
    );

    return {
      Activo: counts.Activo || 0,
      Retirado: counts.Retirado || 0,
      Excommunicado: counts.Excommunicado || 0,
      totalMarkers: userBloodMarkers.length,
    };
  }, [assassins, user?.id, userBloodMarkers.length]);

  // Memoize relationship calculation function
  const getRelationshipWith = useCallback((assassinId: string) => {
    const markers = userBloodMarkers.filter(
      (marker) =>
        (marker.debtorId === user?.id && marker.creditorId === assassinId) ||
        (marker.creditorId === user?.id && marker.debtorId === assassinId)
    );

    if (markers.length === 0) return null;

    const pendingMarkers = markers.filter((m) => m.status === "Pendiente");
    const owedByMe = pendingMarkers.filter((m) => m.debtorId === user?.id);
    const owedToMe = pendingMarkers.filter((m) => m.creditorId === user?.id);

    return {
      total: markers.length,
      pending: pendingMarkers.length,
      owedByMe: owedByMe.length,
      owedToMe: owedToMe.length,
      markers: markers.slice(0, 3), // Show only first 3 for preview
    };
  }, [userBloodMarkers, user?.id]);

  // Action handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleStatusFilterChange = useCallback((status: AsassinStatus | "Todos") => {
    setStatusFilter(status);
  }, []);

  const handleSelectAssassin = useCallback((assassin: Assassin) => {
    setSelectedAssassin(assassin);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAssassin(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    window.history.back();
  }, []);

  return {
    // Data
    assassins: filteredAssassins,
    statusCounts,
    selectedAssassin,
    isLoading,
    hasError,

    // Search and filters
    searchQuery,
    statusFilter,
    setSearchQuery: handleSearchChange,
    setStatusFilter: handleStatusFilterChange,

    // Actions
    getRelationshipWith,
    onSelectAssassin: handleSelectAssassin,
    onCloseModal: handleCloseModal,
    onBackToDashboard: handleBackToDashboard,
  };
}
