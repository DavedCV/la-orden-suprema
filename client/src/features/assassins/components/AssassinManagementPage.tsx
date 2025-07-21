import React, { useState, useMemo, useCallback } from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type { Assassin, AsassinStatus } from "../../../shared/types";
import { CreateAssassinForm } from "./CreateAssassinForm";
import { AssassinFilters } from "./AssassinFilters";
import { AssassinList } from "./AssassinList";
import { AssassinDetailsModal } from "./AssassinDetailsModal";
import { useAssassinManagement } from "../hooks/useAssassinManagement";

export const AssassinManagementPage: React.FC = React.memo(() => {
  const { goToDashboard } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AsassinStatus | "Todos">(
    "Todos"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssassin, setSelectedAssassin] = useState<Assassin | null>(
    null
  );

  const {
    filteredAssassins,
    stats,
    isLoading,
    refetch,
    handleStatusChange,
    isUpdatingStatus,
  } = useAssassinManagement(searchTerm, statusFilter);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value); // Instant local filtering - no debounce needed!
  }, []);

  const handleStatusFilterChange = useCallback(
    (status: AsassinStatus | "Todos") => {
      setStatusFilter(status);
    },
    []
  );

  const handleCreateModalOpen = useCallback(() => setShowCreateModal(true), []);
  const handleCreateModalClose = useCallback(
    () => setShowCreateModal(false),
    []
  );

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    refetch();
  }, [refetch]);

  const handleAssassinSelect = useCallback((assassin: Assassin | null) => {
    setSelectedAssassin(assassin);
  }, []);

  const handleDetailsModalClose = useCallback(
    () => setSelectedAssassin(null),
    []
  );

  // Memoized modal props to prevent unnecessary re-renders
  const createModalProps = useMemo(
    () => ({
      onClose: handleCreateModalClose,
      onSuccess: handleCreateSuccess,
    }),
    [handleCreateModalClose, handleCreateSuccess]
  );

  const detailsModalProps = useMemo(
    () => ({
      assassin: selectedAssassin!,
      onClose: handleDetailsModalClose,
      onUpdate: refetch,
    }),
    [selectedAssassin, handleDetailsModalClose, refetch]
  );

  const filtersProps = useMemo(
    () => ({
      searchTerm,
      setSearchTerm: handleSearchChange,
      statusFilter,
      setStatusFilter: handleStatusFilterChange,
      stats,
    }),
    [
      searchTerm,
      handleSearchChange,
      statusFilter,
      handleStatusFilterChange,
      stats,
    ]
  );

  const listProps = useMemo(
    () => ({
      assassins: filteredAssassins,
      onStatusChange: handleStatusChange,
      onViewDetails: handleAssassinSelect,
      searchTerm,
      statusFilter,
      isUpdating: isUpdatingStatus,
    }),
    [
      filteredAssassins,
      handleStatusChange,
      handleAssassinSelect,
      searchTerm,
      statusFilter,
      isUpdatingStatus,
    ]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando asesinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToDashboard}
                className="text-orden-400 hover:text-orden-200"
                aria-label="Volver al Dashboard"
              >
                ← Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-orden-100 flex items-center">
                  <Users
                    className="h-6 w-6 mr-3 text-gold-400"
                    aria-hidden="true"
                  />
                  Gestión de Asesinos
                </h1>
                <p className="text-orden-300 mt-1">
                  Administra los miembros de La Orden Suprema
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreateModalOpen}
              className="bg-gold-500 hover:bg-gold-600 text-orden-900"
              aria-label="Crear nuevo asesino"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Nuevo Asesino
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" role="main">
        {/* Filters and Search */}
        <AssassinFilters {...filtersProps} />

        {/* Assassins List */}
        <AssassinList {...listProps} />
      </main>

      {/* Modals */}
      {showCreateModal && <CreateAssassinForm {...createModalProps} />}
      {selectedAssassin && <AssassinDetailsModal {...detailsModalProps} />}
    </div>
  );
});

AssassinManagementPage.displayName = "AssassinManagementPage";
