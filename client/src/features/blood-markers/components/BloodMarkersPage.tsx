import React, { useState, useCallback } from "react";
import { ArrowLeft, Plus, Skull } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import { useAuthStore } from "../../../shared/store/authStore";
import { useBloodMarkersData } from "../hooks/useBloodMarkersData";
import { BloodMarkerStats } from "./BloodMarkerStats";
import { BloodMarkerFilters } from "./BloodMarkerFilters";
import { BloodMarkerCard } from "./BloodMarkerCard";
import { CreateBloodMarkerModal } from "./CreateBloodMarkerModal";
import { BloodMarkerDetailsModal } from "./BloodMarkerDetailsModal";
import { BloodMarkerRequestModal } from "./BloodMarkerRequestModal";
import { PaymentConfirmationModal } from "./PaymentConfirmationModal";
import { canRespondToRequest, canPayMarker } from "../utils/statusUtils";
import type { BloodMarker } from "../../../shared/types";

export function BloodMarkersPage() {
  const { user } = useAuthStore();
  const { goBack } = useNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<BloodMarker | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<BloodMarker | null>(
    null
  );
  const [selectedPayment, setSelectedPayment] = useState<BloodMarker | null>(
    null
  );

  const {
    filteredMarkers,
    availableAssassins,
    stats,
    activeFilter,
    searchQuery,
    isLoading,
    hasError,
    handlePayMarker,
    handleConfirmPayment,
    handleCreateMarker,
    handleAcceptRequest,
    handleRejectRequest,
    handleFilterChange,
    handleSearchChange,
    getOtherPartyName,
    refreshData,
    isProcessingRequest,
    isPaying,
  } = useBloodMarkersData();

  // Memoized handlers to prevent unnecessary re-renders
  const handleCreateModalOpen = useCallback(() => setShowCreateModal(true), []);
  const handleCreateModalClose = useCallback(
    () => setShowCreateModal(false),
    []
  );

  const handleCreateSuccess = useCallback(
    (data: { debtorId: string; description: string }) => {
      handleCreateMarker(data);
      setShowCreateModal(false);
    },
    [handleCreateMarker]
  );

  const handleViewDetails = useCallback(
    (marker: BloodMarker) => {
      if (canRespondToRequest(marker, user?.id || "")) {
        setSelectedRequest(marker);
      } else {
        setSelectedMarker(marker);
      }
    },
    [user?.id]
  );

  const handlePayMarkerClick = useCallback(
    (markerId: string) => {
      const marker = filteredMarkers.find((m) => m.id === markerId);
      if (marker && canPayMarker(marker, user?.id || "")) {
        setSelectedPayment(marker);
      }
    },
    [filteredMarkers, user?.id]
  );

  const handleConfirmDebtPayment = useCallback(() => {
    if (selectedPayment) {
      handlePayMarker(selectedPayment.id);
      setSelectedPayment(null);
    }
  }, [selectedPayment, handlePayMarker]);

  const handleCloseDetails = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const handleCloseRequest = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const handleClosePayment = useCallback(() => {
    setSelectedPayment(null);
  }, []);

  const handlePayMarkerWithClose = useCallback(
    (markerId: string) => {
      handlePayMarker(markerId);
      setSelectedMarker(null);
    },
    [handlePayMarker]
  );

  const handleConfirmPaymentWithClose = useCallback(
    (markerId: string) => {
      handleConfirmPayment(markerId);
      setSelectedMarker(null);
    },
    [handleConfirmPayment]
  );

  const handleAcceptRequestWithClose = useCallback(
    (markerId: string) => {
      handleAcceptRequest(markerId);
      setSelectedRequest(null);
    },
    [handleAcceptRequest]
  );

  const handleRejectRequestWithClose = useCallback(
    (markerId: string, reason: string) => {
      handleRejectRequest(markerId, reason);
      setSelectedRequest(null);
    },
    [handleRejectRequest]
  );

  // Loading state
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

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skull className="h-16 w-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-orden-100">
            Error al cargar datos
          </h2>
          <p className="text-orden-300">
            No se pudieron cargar los marcadores de sangre. Intenta recargar la
            página.
          </p>
          <Button onClick={refreshData} className="bg-red-600 hover:bg-red-700">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header
        className="bg-orden-800 border-b border-orden-700 shadow-lg"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="text-orden-300 hover:text-orden-100"
                aria-label="Volver a la página anterior"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <div
                  className="bg-red-500/20 p-2 rounded-lg"
                  aria-hidden="true"
                >
                  <Skull className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orden-100">
                    Marcadores de Sangre
                  </h1>
                  <p className="text-sm text-orden-400">
                    Sistema de favores y deudas
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateModalOpen}
              className="bg-red-600 hover:bg-red-700"
              aria-label="Crear nueva solicitud de marcador de sangre"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Solicitud
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Statistics */}
        <BloodMarkerStats stats={stats} />

        {/* Filters and Search */}
        <BloodMarkerFilters
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        {/* Blood Markers List */}
        <section aria-labelledby="markers-heading">
          <h2 id="markers-heading" className="sr-only">
            Lista de marcadores de sangre
          </h2>

          {filteredMarkers.length > 0 ? (
            <div className="space-y-4" role="list">
              {filteredMarkers.map((marker) => (
                <div key={marker.id} role="listitem">
                  <BloodMarkerCard
                    marker={marker}
                    currentUserId={user?.id || ""}
                    otherPartyName={getOtherPartyName(marker)}
                    onPayMarker={handlePayMarkerClick}
                    onConfirmPayment={(markerId: string) =>
                      handleConfirmPayment(markerId)
                    }
                    onViewDetails={handleViewDetails}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              activeFilter={activeFilter}
              searchQuery={searchQuery}
              onCreateMarker={handleCreateModalOpen}
            />
          )}
        </section>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateBloodMarkerModal
          assassins={availableAssassins}
          currentUserId={user?.id || ""}
          onClose={handleCreateModalClose}
          onSuccess={handleCreateSuccess}
        />
      )}

      {selectedMarker && (
        <BloodMarkerDetailsModal
          marker={selectedMarker}
          otherPartyName={getOtherPartyName(selectedMarker)}
          currentUserId={user?.id || ""}
          onClose={handleCloseDetails}
          onPayMarker={handlePayMarkerWithClose}
          onConfirmPayment={handleConfirmPaymentWithClose}
        />
      )}

      {selectedRequest && (
        <BloodMarkerRequestModal
          marker={selectedRequest}
          otherPartyName={getOtherPartyName(selectedRequest)}
          onClose={handleCloseRequest}
          onAccept={handleAcceptRequestWithClose}
          onReject={handleRejectRequestWithClose}
          isProcessing={isProcessingRequest}
        />
      )}

      {selectedPayment && (
        <PaymentConfirmationModal
          marker={selectedPayment}
          otherPartyName={getOtherPartyName(selectedPayment)}
          onClose={handleClosePayment}
          onConfirm={handleConfirmDebtPayment}
          isProcessing={isPaying}
        />
      )}
    </div>
  );
}

// Empty State Component
const EmptyState = React.memo(function EmptyState({
  activeFilter,
  searchQuery,
  onCreateMarker,
}: {
  activeFilter: string;
  searchQuery: string;
  onCreateMarker: () => void;
}) {
  const hasFilters = activeFilter !== "all" || searchQuery.trim() !== "";

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case "requests":
        return "No tienes solicitudes de marcadores pendientes";
      case "sent_requests":
        return "No has enviado solicitudes de marcadores";
      case "owed_by_me":
        return "No tienes deudas pendientes";
      case "owed_to_me":
        return "No tienes favores pendientes de cobro";
      case "paid":
        return "No tienes marcadores saldados";
      default:
        return hasFilters
          ? "No hay marcadores que coincidan con los filtros seleccionados"
          : "No tienes marcadores de sangre registrados";
    }
  };

  return (
    <div className="card p-12 text-center">
      <Skull
        className="h-16 w-16 text-orden-600 mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 className="text-lg font-medium text-orden-200 mb-2">
        No hay marcadores de sangre
      </h3>
      <p className="text-orden-400 mb-6">{getEmptyMessage()}</p>
      <Button
        onClick={onCreateMarker}
        className="bg-red-600 hover:bg-red-700"
        aria-label="Crear primera solicitud de marcador de sangre"
      >
        <Plus className="h-4 w-4 mr-2" />
        {hasFilters ? "Nueva solicitud" : "Primera solicitud"}
      </Button>
    </div>
  );
});
