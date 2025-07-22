import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../../shared/services/api";
import { useAuthStore } from "../../../shared/store/authStore";
import { toast } from "../../../shared/utils/toast";

interface ProfileUpdateData {
  alias: string;
  lastKnownLocation?: string;
  skills?: string[];
}

interface UseProfileUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useProfileUpdate(options: UseProfileUpdateOptions = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  const profileUpdateMutation = useMutation({
    mutationFn: (data: ProfileUpdateData) => apiService.updateProfile(data),
    onSuccess: (response) => {
      toast({
        type: "success",
        title: "Perfil actualizado",
        message: "Tu información ha sido actualizada exitosamente",
      });

      // Update auth store with new user data
      if (response.success && response.data) {
        updateUser(response.data);
      }

      // Invalidate profile queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Call custom onSuccess if provided
      options.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error("Profile update error:", error);

      toast({
        type: "error",
        title: "Error al actualizar perfil",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil",
      });

      // Call custom onError if provided
      options.onError?.(error);
    },
  });

  return {
    updateProfile: profileUpdateMutation.mutate,
    isUpdating: profileUpdateMutation.isPending,
    updateError: profileUpdateMutation.error,
    updateData: profileUpdateMutation.data,
    reset: profileUpdateMutation.reset,
  };
}
