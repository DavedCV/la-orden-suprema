
import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import type { AsassinStatus, Assassin } from "../../../shared/types";
import { filterAssassins, getAssassinStats } from "../utils";

export const useAssassinManagement = (
  searchTerm: string,
  statusFilter: AsassinStatus | "Todos"
) => {
  const queryClient = useQueryClient();

  // Fetch assassins data with optimized query
  const {
    data: assassinsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["assassins", { search: searchTerm, status: statusFilter }],
    queryFn: () => apiService.getAssassins(1, 50),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const assassins = assassinsData?.data || [];

  // Memoized expensive calculations
  const filteredAssassins = useMemo(
    () => filterAssassins(assassins, searchTerm, statusFilter),
    [assassins, searchTerm, statusFilter]
  );

  const stats = useMemo(
    () => getAssassinStats(assassins),
    [assassins]
  );

  // Status update mutation with optimistic updates
  const statusUpdateMutation = useMutation({
    mutationFn: ({ assassinId, newStatus }: { assassinId: string; newStatus: AsassinStatus }) =>
      apiService.updateAssassinStatus(assassinId, newStatus),
    onMutate: async ({ assassinId, newStatus }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["assassins"] });

      // Snapshot the previous value
      const previousAssassins = queryClient.getQueryData(["assassins", { search: searchTerm, status: statusFilter }]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["assassins", { search: searchTerm, status: statusFilter }],
        (old) => {
          if (!old || typeof old !== 'object' || !('data' in old)) return old;
          const typedOld = old as { data: Assassin[] };

          return {
            ...typedOld,
            data: typedOld.data.map((assassin: Assassin) =>
              assassin.id === assassinId
                ? { ...assassin, status: newStatus }
                : assassin
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousAssassins };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAssassins) {
        queryClient.setQueryData(
          ["assassins", { search: searchTerm, status: statusFilter }],
          context.previousAssassins
        );
      }

      toast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el estado del asesino",
      });
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Estado actualizado",
        message: "El estado del asesino ha sido actualizado correctamente",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have correct data
      queryClient.invalidateQueries({ queryKey: ["assassins"] });
    },
  });

  const handleStatusChange = useCallback(
    (assassinId: string, newStatus: AsassinStatus) => {
      statusUpdateMutation.mutate({ assassinId, newStatus });
    },
    [statusUpdateMutation]
  );

  return {
    assassins,
    filteredAssassins,
    stats,
    isLoading,
    refetch,
    handleStatusChange,
    isUpdatingStatus: statusUpdateMutation.isPending,
  };
};
