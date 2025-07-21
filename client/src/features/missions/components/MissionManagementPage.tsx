import { useState, memo } from "react";
import { Target, Plus, Search, Filter, ArrowLeft } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import { useMissionManagement } from "../hooks/useMissionManagement";
import { StatCard } from "./StatCard";
import { MissionCard } from "./MissionCard";
import { MissionErrorBoundary } from "./MissionErrorBoundary";
import { CreateMissionForm } from "./CreateMissionForm";
import { AssignMissionForm } from "./AssignMissionForm";
import { MissionDetailsModal } from "./MissionDetailsModal";
import {
  MISSION_FILTER_CONFIG,
  SEARCH_PLACEHOLDER,
  EMPTY_STATE_MESSAGES,
} from "../constants";
import type { Mission } from "../../../shared/types";

// Loading component
const LoadingState = memo(function LoadingState() {
  return (
    <div className="min-h-screen bg-orden-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-orden-300">Cargando gestión de misiones...</p>
      </div>
    </div>
  );
});

// Error component
const ErrorState = memo(function ErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-orden-900 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <Target className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-orden-100">
          Error al cargar las misiones
        </h2>
        <p className="text-orden-400">
          No se pudieron cargar las misiones. Por favor, verifica tu conexión e
          intenta nuevamente.
        </p>
        <Button onClick={onRetry} variant="primary">
          Reintentar
        </Button>
      </div>
    </div>
  );
});

// Empty state component
const EmptyState = memo(function EmptyState({
  hasFiltersApplied,
  onCreateMission,
}: {
  hasFiltersApplied: boolean;
  onCreateMission: () => void;
}) {
  const messages = EMPTY_STATE_MESSAGES.NO_MISSIONS;

  return (
    <div className="text-center py-12">
      <Target className="h-16 w-16 text-orden-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-orden-300 mb-2">
        {messages.title}
      </h3>
      <p className="text-orden-400 mb-6">
        {hasFiltersApplied ? messages.withFilters : messages.withoutFilters}
      </p>
      {!hasFiltersApplied && (
        <Button onClick={onCreateMission}>
          <Plus className="h-4 w-4 mr-2" />
          {messages.buttonText}
        </Button>
      )}
    </div>
  );
});

// Header component
const PageHeader = memo(function PageHeader({
  onCreateMission,
  onGoToDashboard,
}: {
  onCreateMission: () => void;
  onGoToDashboard: () => void;
}) {
  return (
    <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoToDashboard}
              className="text-orden-300 hover:text-orden-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-orden-600" />
            <div className="flex items-center space-x-3">
              <div className="bg-gold-500/20 p-2 rounded-lg">
                <Target className="h-6 w-6 text-gold-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gold-400">
                  Gestión de Contratos
                </h1>
                <p className="text-sm text-orden-400">
                  Administrar misiones y asignaciones
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onCreateMission}
            className="bg-gold-600 hover:bg-gold-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Misión
          </Button>
        </div>
      </div>
    </header>
  );
});

// Stats section component
const StatsSection = memo(function StatsSection({
  missionStats,
  statusFilter,
  onFilterChange,
}: {
  missionStats: import("../hooks/useMissionManagement").MissionStats;
  statusFilter: import("../hooks/useMissionManagement").MissionFilter;
  onFilterChange: (
    filter: import("../hooks/useMissionManagement").MissionFilter
  ) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {MISSION_FILTER_CONFIG.map((config) => (
        <StatCard
          key={config.key}
          title={config.title}
          value={missionStats[config.statKey]}
          color={config.color}
          isActive={statusFilter === config.key}
          onClick={() => onFilterChange(config.key)}
        />
      ))}
    </div>
  );
});

// Search section component
const SearchSection = memo(function SearchSection({
  searchQuery,
  onSearchChange,
  onClearFilters,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
            <Input
              placeholder={SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              aria-label="Buscar misiones"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
            aria-label="Limpiar filtros de búsqueda"
          >
            <Filter className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
});

// Main component
export function MissionManagementPage() {
  const { goToDashboard } = useNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const {
    assassins,
    filteredMissions,
    activeAssassins,
    missionStats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters,
    isLoading,
    hasError,
    hasNoResults,
    hasFiltersApplied,
  } = useMissionManagement();

  // Event handlers
  const handleCreateMission = () => {
    setSelectedMission(null);
    setShowCreateModal(true);
  };

  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowCreateModal(true);
  };

  const handleAssignMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowAssignModal(true);
  };

  const handleViewDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetailsModal(true);
  };

  const handleModalSuccess = () => {
    setShowCreateModal(false);
    setShowAssignModal(false);
    setShowDetailsModal(false);
    setSelectedMission(null);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowAssignModal(false);
    setShowDetailsModal(false);
    setSelectedMission(null);
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (hasError) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <MissionErrorBoundary>
      <div className="min-h-screen bg-orden-900">
        <PageHeader
          onCreateMission={handleCreateMission}
          onGoToDashboard={goToDashboard}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsSection
            missionStats={missionStats}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />

          <SearchSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearFilters={clearFilters}
          />

          {/* Missions Grid */}
          {hasNoResults ? (
            <EmptyState
              hasFiltersApplied={hasFiltersApplied}
              onCreateMission={handleCreateMission}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  assassins={assassins}
                  onEdit={handleEditMission}
                  onAssign={handleAssignMission}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </main>

        {/* Modals */}
        {showCreateModal && (
          <CreateMissionForm
            mission={selectedMission}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}

        {showAssignModal && selectedMission && (
          <AssignMissionForm
            mission={selectedMission}
            assassins={activeAssassins}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}

        {showDetailsModal && selectedMission && (
          <MissionDetailsModal
            mission={selectedMission}
            assassins={assassins}
            onClose={handleModalClose}
            onEdit={(mission) => {
              setSelectedMission(mission);
              setShowDetailsModal(false);
              setShowCreateModal(true);
            }}
            onAssign={(mission) => {
              setSelectedMission(mission);
              setShowDetailsModal(false);
              setShowAssignModal(true);
            }}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </MissionErrorBoundary>
  );
}
