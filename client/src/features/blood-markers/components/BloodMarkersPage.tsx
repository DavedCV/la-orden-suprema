import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useAuthStore } from "../../../shared/store/authStore";
// import { useNavigation } from "../../../shared/hooks/useNavigation"; // Currently unused
import { apiService } from "../../../shared/services/api";
import { Plus, Skull, Filter, Users, Clock, CheckCircle } from "lucide-react";
import { BloodMarkerCard } from "./BloodMarkerCard";
import { BloodMarkerFilters } from "./BloodMarkerFilters";
import { BloodMarkerStats } from "./BloodMarkerStats";
import { CreateBloodMarkerModal } from "./CreateBloodMarkerModal";
import { BloodMarkerRequestModal } from "./BloodMarkerRequestModal";
import { BloodMarkerDetailsModal } from "./BloodMarkerDetailsModal";
import type { BloodMarker } from "../../../shared/types";

type FilterType =
  | "all"
  | "owed_by_me"
  | "owed_to_me"
  | "pending_requests"
  | "sent_requests"
  | "settled"
  | "rejected";
type StatusFilter =
  | "all"
  | "Solicitud Pendiente"
  | "Pendiente"
  | "Pago Pendiente de Confirmación"
  | "Saldado"
  | "Rechazada";

export function BloodMarkersPage() {
  const { user } = useAuthStore();
  // const { navigateTo } = useNavigation(); // Removed as not used in current implementation

  // State management
  const [filterType, setFilterType] = React.useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<BloodMarker | null>(null);
  const [selectedDetails, setSelectedDetails] =
    React.useState<BloodMarker | null>(null);

  // Fetch blood markers and assassins
  const {
    data: bloodMarkersData,
    isLoading: isLoadingMarkers,
    refetch: refetchMarkers,
  } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
  });

  const { data: assassinsData, isLoading: isLoadingAssassins } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  const bloodMarkers = bloodMarkersData?.data || [];
  const assassins = assassinsData?.data || [];

  // Filter blood markers based on current filters
  const filteredMarkers = React.useMemo(() => {
    let filtered = bloodMarkers;

    // Filter by type
    if (filterType !== "all" && user) {
      switch (filterType) {
        case "owed_by_me":
          filtered = filtered.filter(
            (marker) =>
              marker.debtorId === user.id &&
              ["Pendiente", "Pago Pendiente de Confirmación"].includes(
                marker.status
              )
          );
          break;
        case "owed_to_me":
          filtered = filtered.filter(
            (marker) =>
              marker.creditorId === user.id &&
              ["Pendiente", "Pago Pendiente de Confirmación"].includes(
                marker.status
              )
          );
          break;
        case "pending_requests":
          filtered = filtered.filter(
            (marker) =>
              marker.creditorId === user.id &&
              marker.status === "Solicitud Pendiente"
          );
          break;
        case "sent_requests":
          filtered = filtered.filter(
            (marker) =>
              marker.debtorId === user.id &&
              marker.status === "Solicitud Pendiente"
          );
          break;
        case "settled":
          filtered = filtered.filter((marker) => marker.status === "Saldado");
          break;
        case "rejected":
          filtered = filtered.filter((marker) => marker.status === "Rechazada");
          break;
      }
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((marker) => marker.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((marker) => {
        const debtor = assassins.find((a) => a.id === marker.debtorId);
        const creditor = assassins.find((a) => a.id === marker.creditorId);
        return (
          marker.description.toLowerCase().includes(query) ||
          debtor?.alias.toLowerCase().includes(query) ||
          creditor?.alias.toLowerCase().includes(query)
        );
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bloodMarkers, filterType, statusFilter, searchQuery, user, assassins]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refetchMarkers();
  };

  const handleRequestResponse = () => {
    setSelectedRequest(null);
    refetchMarkers();
  };

  const getFilterTypeOptions = () => [
    { value: "all", label: "Todos", icon: Skull },
    { value: "owed_by_me", label: "Mis Deudas", icon: Clock },
    { value: "owed_to_me", label: "Me Deben", icon: CheckCircle },
    { value: "pending_requests", label: "Solicitudes Pendientes", icon: Users },
    { value: "sent_requests", label: "Enviadas", icon: Filter },
    { value: "settled", label: "Saldadas", icon: CheckCircle },
    { value: "rejected", label: "Rechazadas", icon: Filter },
  ];

  if (isLoadingMarkers || isLoadingAssassins) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando marcadores de sangre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <div className="bg-orden-800 border-b border-orden-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-orden-100 flex items-center">
                <Skull className="h-6 w-6 mr-2 text-red-400" />
                Blood Markers
              </h1>
              <p className="text-orden-400 mt-1">
                Gestiona tus deudas y favores dentro de la orden
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Marcador
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Stats and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <BloodMarkerStats
              bloodMarkers={bloodMarkers}
              currentUserId={user?.id || ""}
            />

            <BloodMarkerFilters
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterTypeOptions={getFilterTypeOptions()}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredMarkers.length === 0 ? (
              <div className="text-center py-12">
                <Skull className="h-16 w-16 mx-auto mb-4 text-orden-600" />
                <h3 className="text-lg font-medium text-orden-300 mb-2">
                  No hay marcadores de sangre
                </h3>
                <p className="text-orden-500 mb-6">
                  {filterType === "all"
                    ? "Aún no tienes marcadores de sangre registrados."
                    : "No hay marcadores que coincidan con los filtros seleccionados."}
                </p>
                {filterType === "all" && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tu primer marcador
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-orden-400">
                    Mostrando {filteredMarkers.length} marcador
                    {filteredMarkers.length !== 1 ? "es" : ""}
                  </p>
                </div>

                <div className="grid gap-4">
                  {filteredMarkers.map((marker) => (
                    <BloodMarkerCard
                      key={marker.id}
                      marker={marker}
                      assassins={assassins}
                      currentUserId={user?.id || ""}
                      onRequestResponse={
                        marker.status === "Solicitud Pendiente" &&
                        marker.creditorId === user?.id
                          ? () => setSelectedRequest(marker)
                          : undefined
                      }
                      onViewDetails={() => setSelectedDetails(marker)}
                      onRefresh={refetchMarkers}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateBloodMarkerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          assassins={assassins}
        />
      )}

      {selectedRequest && (
        <BloodMarkerRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={handleRequestResponse}
          requesterName={
            assassins.find((a) => a.id === selectedRequest.debtorId)?.alias ||
            "Desconocido"
          }
        />
      )}

      {selectedDetails && (
        <BloodMarkerDetailsModal
          marker={selectedDetails}
          assassins={assassins}
          currentUserId={user?.id || ""}
          onClose={() => setSelectedDetails(null)}
          onRefresh={refetchMarkers}
        />
      )}
    </div>
  );
}
