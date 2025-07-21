import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { ArrowLeft, Users, Search, AlertTriangle } from "lucide-react";
import { AssassinCard } from "./AssassinCard";
import { AssassinDetailsModal } from "./AssassinDetailsModal";
import { useAssassinDirectory } from "../hooks/useAssassinDirectory";
import type { AsassinStatus } from "../../../shared/types";

export function AssassinDirectoryPage() {
  const {
    assassins,
    statusCounts,
    selectedAssassin,
    isLoading,
    hasError,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    getRelationshipWith,
    onSelectAssassin,
    onCloseModal,
    onBackToDashboard,
  } = useAssassinDirectory();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando directorio...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-orden-100">
            Error al cargar datos
          </h2>
          <p className="text-orden-300">
            No se pudo cargar el directorio. Intenta recargar la página.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Recargar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile layout: stack vertically */}
          <div className="flex flex-col space-y-4 py-4 sm:hidden">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>

              <div className="flex-1">
                <h1 className="text-lg font-bold text-orden-100">
                  Directorio de Asesinos
                </h1>
                <p className="text-sm text-orden-400">
                  Busca y conecta con otros miembros
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-orden-400">
                {assassins.length} asesinos encontrados
              </p>
            </div>
          </div>

          {/* Desktop layout: horizontal */}
          <div className="hidden sm:flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orden-100">
                    Directorio de Asesinos
                  </h1>
                  <p className="text-sm text-orden-400">
                    Busca y conecta con otros miembros de La Orden
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-orden-400">
                {assassins.length} asesinos encontrados
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-orden-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por alias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Buscar asesinos por alias"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as AsassinStatus | "Todos")
                }
                className="w-full bg-orden-700 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Filtrar por estado"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Retirado">Retirado</option>
                <option value="Excommunicado">Excommunicado</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-orden-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {statusCounts.Activo}
              </div>
              <div className="text-sm text-orden-400">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {statusCounts.Retirado}
              </div>
              <div className="text-sm text-orden-400">Retirados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {statusCounts.Excommunicado}
              </div>
              <div className="text-sm text-orden-400">Excommunicados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {statusCounts.totalMarkers}
              </div>
              <div className="text-sm text-orden-400">Mis Marcadores</div>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assassins.map((assassin) => (
            <AssassinCard
              key={assassin.id}
              assassin={assassin}
              relationship={getRelationshipWith(assassin.id)}
              onViewDetails={() => onSelectAssassin(assassin)}
            />
          ))}
        </div>

        {assassins.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-orden-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orden-300 mb-2">
              No se encontraron asesinos
            </h3>
            <p className="text-orden-500">
              {searchQuery || statusFilter !== "Todos"
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay otros asesinos en el directorio"}
            </p>
          </div>
        )}
      </main>

      {/* Assassin Details Modal */}
      {selectedAssassin && (
        <AssassinDetailsModal
          assassin={selectedAssassin}
          relationship={getRelationshipWith(selectedAssassin.id)}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}
