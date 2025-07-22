import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { useAuthStore } from "../../../shared/store/authStore";
import type { CreateBloodMarkerForm } from "../../../shared/types";

export function useBloodMarkersData() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch blood markers using the specific endpoint that categorizes automatically
  const { data: bloodMarkersData, isLoading: isLoadingMarkers, refetch: refetchMarkers } = useQuery({
    queryKey: ["blood-markers-categorized", user?.id],
    queryFn: () => user?.id ? apiService.getBloodMarkersByUser(user.id) : Promise.reject("No user"),
    enabled: !!user?.id,
  });

  // Fetch assassins for names
  const { data: assassinsData, isLoading: isLoadingAssassins } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  // Create blood marker mutation
  const createBloodMarkerMutation = useMutation({
    mutationFn: (data: CreateBloodMarkerForm) => apiService.createBloodMarker(data),
    onSuccess: (response) => {
      toast({
        type: "success",
        title: "Solicitud enviada",
        message: response.message || "Tu solicitud de marcador de sangre ha sido enviada",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-markers-categorized"] });
      refetchMarkers();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear el marcador de sangre";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  // Respond to blood marker request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: (data: { markerId: string; accepted: boolean; rejectionReason?: string }) =>
      apiService.respondToBloodMarkerRequest(data.markerId, {
        accepted: data.accepted,
        rejectionReason: data.rejectionReason,
      }),
    onSuccess: (response) => {
      toast({
        type: "success",
        title: "Respuesta enviada",
        message: response.message || "Tu respuesta ha sido registrada",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-markers-categorized"] });
      refetchMarkers();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "No se pudo procesar la respuesta";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  // Pay blood marker mutation
  const payBloodMarkerMutation = useMutation({
    mutationFn: (markerId: string) => apiService.payBloodMarker(markerId),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Marcador pagado",
        message: "Has marcado la deuda como pagada. Esperando confirmación.",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-markers-categorized"] });
      refetchMarkers();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "No se pudo procesar el pago del marcador";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  // Confirm blood marker payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (markerId: string) => apiService.confirmBloodMarkerPayment(markerId),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Pago confirmado",
        message: "El marcador ha sido saldado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-markers-categorized"] });
      refetchMarkers();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "No se pudo confirmar el pago";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });





  return {
    // Data - now using categorized data from backend
    bloodMarkers: bloodMarkersData?.data?.all || [],
    categorizedMarkers: bloodMarkersData?.data?.categorized || {
      debtsOwed: [],
      debtsOwing: [],
      pendingRequests: [],
      sentRequests: [],
      settledDebts: [],
      rejectedRequests: [],
    },
    assassins: assassinsData?.data || [],

    // Loading states
    isLoading: isLoadingMarkers || isLoadingAssassins,
    isLoadingMarkers,
    isLoadingAssassins,

    // Mutations
    createBloodMarkerMutation,
    respondToRequestMutation,
    payBloodMarkerMutation,
    confirmPaymentMutation,

    // Utility functions
    refetchMarkers,

    // Processing states
    isCreating: createBloodMarkerMutation.isPending,
    isResponding: respondToRequestMutation.isPending,
    isPaying: payBloodMarkerMutation.isPending,
    isConfirming: confirmPaymentMutation.isPending,
    isProcessing:
      createBloodMarkerMutation.isPending ||
      respondToRequestMutation.isPending ||
      payBloodMarkerMutation.isPending ||
      confirmPaymentMutation.isPending,
  };
}
