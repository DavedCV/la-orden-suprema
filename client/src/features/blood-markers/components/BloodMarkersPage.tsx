import React from "react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useAuthStore } from "../../../shared/store/authStore";
import { Plus, Skull, Filter, Users, Clock, CheckCircle } from "lucide-react";
import { BloodMarkerCard } from "./BloodMarkerCard";
import { BloodMarkerFilters } from "./BloodMarkerFilters";
import { BloodMarkerStats } from "./BloodMarkerStats";
import { CreateBloodMarkerModal } from "./CreateBloodMarkerModal";
import { BloodMarkerRequestModal } from "./BloodMarkerRequestModal";
import { BloodMarkerDetailsModal } from "./BloodMarkerDetailsModal";
import { useBloodMarkersData } from "../hooks/useBloodMarkersData";
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

  // State management
  const [filterType, setFilterType] = React.useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<BloodMarker | null>(null);
  const [selectedDetails, setSelectedDetails] =
    React.useState<BloodMarker | null>(null);

  // Use the updated hook that gets categorized data
  const {
    bloodMarkers,
    categorizedMarkers,
    assassins,
    isLoading,
    refetchMarkers,
  } = useBloodMarkersData();

  // Get filtered markers based on current filter type using backend categorization
  const getFilteredMarkers = React.useMemo(() => {
    let filtered: BloodMarker[] = [];

    // Use backend categorization instead of manual filtering
    switch (filterType) {
      case "all":
        filtered = bloodMarkers;
        break;
      case "owed_by_me":
        filtered = categorizedMarkers.debtsOwed;
        break;
      case "owed_to_me":
        filtered = categorizedMarkers.debtsOwing;
        break;
      case "pending_requests":
        filtered = categorizedMarkers.pendingRequests;
        break;
      case "sent_requests":
        filtered = categorizedMarkers.sentRequests;
        break;
      case "settled":
        filtered = categorizedMarkers.settledDebts;
        break;
      case "rejected":
        filtered = categorizedMarkers.rejectedRequests;
        break;
      default:
        filtered = bloodMarkers;
    }

    // Apply additional status filter if not "all"
    if (statusFilter !== "all") {
      filtered = filtered.filter((marker) => marker.status === statusFilter);
    }

    // Apply search filter
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
  }, [
    categorizedMarkers,
    filterType,
    statusFilter,
    searchQuery,
    bloodMarkers,
    assassins,
  ]);

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

  if (isLoading) {
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
      <header className="bg-orden-800 border-b border-orden-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skull className="h-8 w-8 text-orden-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Marcadores de Sangre
                </h1>
                <p className="text-orden-300">
                  Gestiona tus deudas y favores con otros asesinos
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Marcador
            </Button>
          </div>
        </div>
      </header>

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
            {getFilteredMarkers.length === 0 ? (
              <div className="text-center py-12">
                <Skull className="h-12 w-12 text-orden-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-orden-300 mb-2">
                  {filterType === "all"
                    ? "No hay marcadores de sangre"
                    : "No hay marcadores para este filtro"}
                </h3>
                <p className="text-orden-400 mb-6">
                  {filterType === "pending_requests"
                    ? "No tienes solicitudes pendientes de responder"
                    : filterType === "sent_requests"
                    ? "No has enviado solicitudes pendientes"
                    : filterType === "owed_by_me"
                    ? "No tienes deudas pendientes"
                    : filterType === "owed_to_me"
                    ? "No tienes deudas por cobrar"
                    : "Crea tu primer marcador de sangre para establecer una deuda"}
                </p>
                {filterType === "all" && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Marcador
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-orden-400">
                    Mostrando {getFilteredMarkers.length} marcador
                    {getFilteredMarkers.length !== 1 ? "es" : ""}
                  </p>
                </div>

                <div className="grid gap-4">
                  {getFilteredMarkers.map((marker) => (
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
