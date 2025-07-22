import { useQuery, useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import type { AdminDashboard, AssassinDashboard, BloodMarker, Assassin, User, ApiResponse } from "../../../shared/types";

interface DashboardDataReturn {
  user: User | null;
  isLoading: boolean;
  dashboardData: AdminDashboard | AssassinDashboard | undefined;
  adminData: AdminDashboard | undefined;
  assassinData: AssassinDashboard | undefined;
  bloodMarkers: BloodMarker[];
  assassins: Assassin[];
  payMarkerMutation: UseMutationResult<ApiResponse<unknown>, Error, string, unknown>;
  confirmPaymentMutation: UseMutationResult<ApiResponse<unknown>, Error, string, unknown>;
  isProcessingPayment: boolean;
}

export function useDashboardData(): DashboardDataReturn {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch dashboard data based on user role
  const { data: adminData, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiService.getAdminDashboard(),
    enabled: user?.role === "admin",
  });

  const { data: assassinData, isLoading: isLoadingAssassin } = useQuery({
    queryKey: ["assassin-dashboard"],
    queryFn: () => apiService.getAssassinDashboard(),
    enabled: user?.role === "assassin",
  });

  // Fetch blood markers for assassins using the specific categorized endpoint
  const { data: bloodMarkersData, isLoading: isLoadingBloodMarkers } = useQuery({
    queryKey: ["blood-markers-categorized", user?.id],
    queryFn: () => user?.id ? apiService.getBloodMarkersByUser(user.id) : Promise.reject("No user"),
    enabled: user?.role === "assassin" && !!user?.id,
  });

  // Fetch assassins data for blood marker names
  const { data: assassinsData } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
    enabled: user?.role === "assassin",
  });

  // Mutations for blood markers
  const payMarkerMutation = useMutation({
    mutationFn: (markerId: string) => apiService.payBloodMarker(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers-categorized"] });
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
    mutationFn: (markerId: string) => apiService.confirmBloodMarkerPayment(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers-categorized"] });
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

  // Computed values
  const isLoading = isLoadingAdmin || isLoadingAssassin || isLoadingBloodMarkers;
  const dashboardData = user?.role === "admin" ? adminData?.data : assassinData?.data;
  const bloodMarkers = bloodMarkersData?.data?.all || [];
  const assassins = assassinsData?.data || [];

  return {
    user,
    isLoading,
    dashboardData: dashboardData as AdminDashboard | AssassinDashboard | undefined,
    adminData: adminData?.data as AdminDashboard | undefined,
    assassinData: assassinData?.data as AssassinDashboard | undefined,
    bloodMarkers,
    assassins,
    payMarkerMutation,
    confirmPaymentMutation,
    isProcessingPayment: payMarkerMutation.isPending || confirmPaymentMutation.isPending,
  };
}
