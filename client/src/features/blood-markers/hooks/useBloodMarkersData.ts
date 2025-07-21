import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import type { BloodMarker } from "../../../shared/types";

type BloodMarkerFilter =
  | "all"
  | "owed_by_me"
  | "owed_to_me"
  | "pending"
  | "paid";

export function useBloodMarkersData() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Local state
  const [activeFilter, setActiveFilter] = useState<BloodMarkerFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch blood markers
  const {
    data: bloodMarkersData,
    isLoading: isLoadingMarkers,
    error: markersError,
    refetch: refetchMarkers,
  } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
    retry: 2,
  });

  // Fetch assassins for the create form and name lookups
  const {
    data: assassinsData,
    isLoading: isLoadingAssassins,
    error: assassinsError,
  } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
    retry: 2,
  });

  const bloodMarkers = bloodMarkersData?.data || [];
  const assassins = assassinsData?.data || [];
  const isLoading = isLoadingMarkers || isLoadingAssassins;
  const hasError = markersError || assassinsError;

  // Mutations
  const payMarkerMutation = useMutation({
    mutationFn: (markerId: string) => apiService.payBloodMarker(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Marcador pagado",
        message: "Has marcado la deuda como pagada. Esperando confirmación.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo procesar el pago del marcador",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (markerId: string) =>
      apiService.confirmBloodMarkerPayment(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Pago confirmado",
        message: "El marcador ha sido saldado exitosamente",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo confirmar el pago",
      });
    },
  });

  const createMarkerMutation = useMutation({
    mutationFn: (data: {
      debtorId: string;
      creditorId: string;
      description: string;
    }) => apiService.createBloodMarker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Marcador creado",
        message: "El marcador de sangre ha sido registrado exitosamente",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo crear el marcador de sangre",
      });
    },
  });

  // Helper function to get other party name
  const getOtherPartyName = useCallback(
    (marker: BloodMarker) => {
      const isCreditor = marker.creditorId === user?.id;
      const otherPartyId = isCreditor ? marker.debtorId : marker.creditorId;
      const otherParty = assassins.find((a) => a.id === otherPartyId);
      return otherParty?.alias || "Desconocido";
    },
    [assassins, user?.id]
  );

  // Memoized filtered markers for performance
  const filteredMarkers = useMemo(() => {
    return bloodMarkers.filter((marker) => {
      const matchesSearch =
        marker.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getOtherPartyName(marker)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "owed_by_me":
          return marker.debtorId === user?.id;
        case "owed_to_me":
          return marker.creditorId === user?.id;
        case "pending":
          return marker.status === "Pendiente";
        case "paid":
          return marker.status === "Saldado";
        default:
          return true;
      }
    });
  }, [bloodMarkers, searchQuery, activeFilter, user?.id, getOtherPartyName]);

  // Memoized statistics
  const stats = useMemo(() => {
    const owedByMe = bloodMarkers.filter(
      (m) => m.debtorId === user?.id && m.status === "Pendiente"
    ).length;
    const owedToMe = bloodMarkers.filter(
      (m) => m.creditorId === user?.id && m.status === "Pendiente"
    ).length;
    const pendingConfirmation = bloodMarkers.filter(
      (m) =>
        m.creditorId === user?.id &&
        m.status === "Pago Pendiente de Confirmación"
    ).length;

    return { owedByMe, owedToMe, pendingConfirmation };
  }, [bloodMarkers, user?.id]);

  // Filter out current user from assassins list for creation
  const availableAssassins = useMemo(() => {
    return assassins.filter(
      (a) => a.id !== user?.id && a.status === "Activo"
    );
  }, [assassins, user?.id]);

  // Handlers
  const handlePayMarker = useCallback(
    (markerId: string) => payMarkerMutation.mutate(markerId),
    [payMarkerMutation]
  );

  const handleConfirmPayment = useCallback(
    (markerId: string) => confirmPaymentMutation.mutate(markerId),
    [confirmPaymentMutation]
  );

  const handleCreateMarker = useCallback(
    (data: { debtorId: string; description: string }) => {
      createMarkerMutation.mutate({
        ...data,
        creditorId: user?.id || "",
      });
    },
    [createMarkerMutation, user?.id]
  );

  const handleFilterChange = useCallback((filter: BloodMarkerFilter) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const refreshData = useCallback(() => {
    refetchMarkers();
  }, [refetchMarkers]);

  return {
    // Data
    bloodMarkers,
    assassins,
    filteredMarkers,
    availableAssassins,
    stats,

    // State
    activeFilter,
    searchQuery,
    isLoading,
    hasError,

    // Loading states
    isCreating: createMarkerMutation.isPending,
    isPaying: payMarkerMutation.isPending,
    isConfirming: confirmPaymentMutation.isPending,

    // Handlers
    handlePayMarker,
    handleConfirmPayment,
    handleCreateMarker,
    handleFilterChange,
    handleSearchChange,
    getOtherPartyName,
    refreshData,
  };
}
