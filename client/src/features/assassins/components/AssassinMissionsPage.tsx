import React from "react";
import {
  ArrowLeft,
  Target,
  Search,
  Filter,
  Clock,
  Play,
  CheckCircle,
  AlertTriangle,
  Coins,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { formatCurrency } from "../../../shared/utils";
import { useAssassinMissions } from "../hooks/useAssassinMissions";
import {
  StatCard,
  MissionCard,
  MissionDetailsModal,
} from "../../missions/components";

export const AssassinMissionsPage: React.FC = React.memo(() => {
  const {
    missions,
    missionStats,
    selectedMission,
    isLoading,
    isStarting,
    hasError,
    searchQuery,
    statusFilter,
    showMissionDetails,
    handleSearchChange,
    handleStatusFilterChange,
    handleStartMission,
    handleViewDetails,
    handleCloseDetails,
    handleBackToDashboard,
    clearFilters,
  } = useAssassinMissions();

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-orden-100">
            Error al cargar misiones
          </h2>
          <p className="text-orden-300">
            No se pudieron cargar tus misiones. Intenta recargar la página.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Recargar
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando tus misiones...</p>
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
                onClick={handleBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <div className="bg-gold-500/20 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orden-100">
                    Mis Misiones
                  </h1>
                  <p className="text-sm text-orden-400">
                    Gestiona tus contratos y operaciones
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-orden-400">
                {missions.length} de {missionStats.total} misiones
              </p>
              {missionStats.overdue > 0 && (
                <p className="text-xs text-red-400">
                  {missionStats.overdue} vencidas
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Stats Overview */}
        <section className="mb-8" aria-label="Estadísticas de misiones">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total"
              value={missionStats.total}
              color="blue"
              icon={<Target className="h-4 w-4" />}
              isActive={statusFilter === "all"}
              onClick={() => handleStatusFilterChange("all")}
            />
            <StatCard
              title="Asignadas"
              value={missionStats.asignada}
              color="blue"
              icon={<Clock className="h-4 w-4" />}
              isActive={statusFilter === "asignada"}
              onClick={() => handleStatusFilterChange("asignada")}
            />
            <StatCard
              title="En Progreso"
              value={missionStats.enProgreso}
              color="yellow"
              icon={<Play className="h-4 w-4" />}
              isActive={statusFilter === "en_progreso"}
              onClick={() => handleStatusFilterChange("en_progreso")}
            />
            <StatCard
              title="Completadas"
              value={missionStats.completada}
              color="green"
              icon={<CheckCircle className="h-4 w-4" />}
              isActive={statusFilter === "completada"}
              onClick={() => handleStatusFilterChange("completada")}
            />
            <StatCard
              title="Fallidas"
              value={missionStats.fallida}
              color="red"
              icon={<AlertTriangle className="h-4 w-4" />}
              isActive={statusFilter === "fallida"}
              onClick={() => handleStatusFilterChange("fallida")}
            />
            <StatCard
              title="Recompensas"
              value={formatCurrency(missionStats.totalRewards)}
              color="gold"
              icon={<Coins className="h-4 w-4" />}
              subtitle="Ganadas"
            />
          </div>
        </section>

        {/* Search and Filters */}
        <section className="card p-6 mb-8" aria-label="Búsqueda y filtros">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, descripción o objetivo..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                  aria-label="Buscar misiones"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                aria-label="Limpiar filtros"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </section>

        {/* Missions Grid */}
        <section aria-label="Lista de misiones">
          {missions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onStartMission={handleStartMission}
                  onViewDetails={handleViewDetails}
                  isStarting={isStarting}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-orden-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-orden-300 mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "No se encontraron misiones"
                  : "No tienes misiones asignadas"}
              </h3>
              <p className="text-orden-400 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Cuando se te asignen misiones, aparecerán aquí"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  onClick={clearFilters}
                  variant="secondary"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Mission Details Modal */}
      {showMissionDetails && selectedMission && (
        <MissionDetailsModal
          mission={selectedMission}
          onClose={handleCloseDetails}
          onStartMission={handleStartMission}
          isStarting={isStarting}
        />
      )}
    </div>
  );
});

AssassinMissionsPage.displayName = "AssassinMissionsPage";
