import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import {
  ArrowLeft,
  Users,
  Search,
  Shield,
  ShieldOff,
  UserX,
  Skull,
  TrendingUp,
  Eye,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import { formatDate } from "../../../shared/utils";
import type { Assassin, BloodMarker, AsassinStatus } from "../../../shared/types";

export function AssassinDirectoryPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AsassinStatus | "Todos">(
    "Todos"
  );
  const [selectedAssassin, setSelectedAssassin] = useState<Assassin | null>(
    null
  );

  // Fetch assassins data
  const { data: assassinsData, isLoading: isLoadingAssassins } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  // Fetch blood markers to show relationships
  const { data: bloodMarkersData, isLoading: isLoadingMarkers } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
  });

  const assassins = assassinsData?.data || [];
  const bloodMarkers = bloodMarkersData?.data || [];
  const isLoading = isLoadingAssassins || isLoadingMarkers;

  // Filter assassins based on search and status
  const filteredAssassins = assassins
    .filter((assassin) => assassin.id !== user?.id) // Don't show current user
    .filter((assassin) => {
      const matchesSearch = assassin.alias
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "Todos" || assassin.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  // Get relationship with another assassin
  const getRelationshipWith = (assassinId: string) => {
    const markers = bloodMarkers.filter(
      (marker) =>
        (marker.debtorId === user?.id && marker.creditorId === assassinId) ||
        (marker.creditorId === user?.id && marker.debtorId === assassinId)
    );

    if (markers.length === 0) return null;

    const pendingMarkers = markers.filter((m) => m.status === "Pendiente");
    const owedByMe = pendingMarkers.filter((m) => m.debtorId === user?.id);
    const owedToMe = pendingMarkers.filter((m) => m.creditorId === user?.id);

    return {
      total: markers.length,
      pending: pendingMarkers.length,
      owedByMe: owedByMe.length,
      owedToMe: owedToMe.length,
      markers: markers.slice(0, 3), // Show only first 3 for preview
    };
  };

  const handleBackToDashboard = () => {
    window.history.back();
  };

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

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
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
                {filteredAssassins.length} asesinos encontrados
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
                {
                  assassins.filter(
                    (a) => a.status === "Activo" && a.id !== user?.id
                  ).length
                }
              </div>
              <div className="text-sm text-orden-400">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {
                  assassins.filter(
                    (a) => a.status === "Retirado" && a.id !== user?.id
                  ).length
                }
              </div>
              <div className="text-sm text-orden-400">Retirados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {
                  assassins.filter(
                    (a) => a.status === "Excommunicado" && a.id !== user?.id
                  ).length
                }
              </div>
              <div className="text-sm text-orden-400">Excommunicados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {
                  bloodMarkers.filter(
                    (m) => m.debtorId === user?.id || m.creditorId === user?.id
                  ).length
                }
              </div>
              <div className="text-sm text-orden-400">Mis Marcadores</div>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssassins.map((assassin) => (
            <AssassinCard
              key={assassin.id}
              assassin={assassin}
              relationship={getRelationshipWith(assassin.id)}
              onViewDetails={() => setSelectedAssassin(assassin)}
            />
          ))}
        </div>

        {filteredAssassins.length === 0 && (
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
          onClose={() => setSelectedAssassin(null)}
        />
      )}
    </div>
  );
}

// Assassin Card Component
function AssassinCard({
  assassin,
  relationship,
  onViewDetails,
}: {
  assassin: Assassin;
  relationship: {
    owedByMe: number;
    owedToMe: number;
    markers: BloodMarker[];
    total: number;
  } | null;
  onViewDetails: () => void;
}) {
  const getStatusIcon = (status: AsassinStatus) => {
    switch (status) {
      case "Activo":
        return <Shield className="h-4 w-4 text-green-400" />;
      case "Retirado":
        return <ShieldOff className="h-4 w-4 text-yellow-400" />;
      case "Excommunicado":
        return <UserX className="h-4 w-4 text-red-400" />;
      default:
        return <User className="h-4 w-4 text-orden-400" />;
    }
  };

  const getStatusColor = (status: AsassinStatus) => {
    switch (status) {
      case "Activo":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "Retirado":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "Excommunicado":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-orden-400 bg-orden-700/50 border-orden-600/30";
    }
  };

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700 hover:border-purple-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-2 rounded-full">
            <User className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orden-100">
              {assassin.alias}
            </h3>
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                assassin.status
              )}`}
            >
              {getStatusIcon(assassin.status)}
              <span>{assassin.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-orden-200">
            {assassin.completedMissions}
          </div>
          <div className="text-xs text-orden-400">Misiones</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gold-400">
            {Math.floor(assassin.goldCoins / 1000)}K
          </div>
          <div className="text-xs text-orden-400">Monedas</div>
        </div>
      </div>

      {/* Relationship Status */}
      {relationship && (
        <div className="bg-orden-900/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-orden-300">
              Marcadores de Sangre
            </span>
            <Skull className="h-4 w-4 text-red-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {relationship.owedByMe > 0 && (
              <div className="flex items-center space-x-1 text-red-400">
                <Clock className="h-3 w-3" />
                <span>Debo: {relationship.owedByMe}</span>
              </div>
            )}
            {relationship.owedToMe > 0 && (
              <div className="flex items-center space-x-1 text-gold-400">
                <TrendingUp className="h-3 w-3" />
                <span>Me debe: {relationship.owedToMe}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewDetails}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
        {assassin.status === "Activo" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-400 hover:text-purple-300"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Assassin Details Modal
function AssassinDetailsModal({
  assassin,
  relationship,
  onClose,
}: {
  assassin: Assassin;
  relationship: {
    owedByMe: number;
    owedToMe: number;
    markers: BloodMarker[];
    total: number;
  } | null;
  onClose: () => void;
}) {
  const getStatusColor = (status: AsassinStatus) => {
    switch (status) {
      case "Activo":
        return "text-green-400";
      case "Retirado":
        return "text-yellow-400";
      case "Excommunicado":
        return "text-red-400";
      default:
        return "text-orden-400";
    }
  };

  const getMarkerStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "Pago Pendiente de Confirmación":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case "Saldado":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-orden-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <User className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orden-100">
                {assassin.alias}
              </h2>
              <p
                className={`text-sm font-medium ${getStatusColor(
                  assassin.status
                )}`}
              >
                {assassin.status}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orden-200">
                {assassin.completedMissions}
              </div>
              <div className="text-sm text-orden-400">Misiones Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-400">
                {assassin.goldCoins.toLocaleString()}
              </div>
              <div className="text-sm text-orden-400">Monedas de Oro</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatDate(assassin.joinDate).split(" ")[0]}
              </div>
              <div className="text-sm text-orden-400">Fecha de Ingreso</div>
            </div>
          </div>

          {/* Skills */}
          {assassin.skills && assassin.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orden-100 mb-3">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {assassin.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Blood Markers Relationship */}
          {relationship && relationship.markers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orden-100 mb-3 flex items-center">
                <Skull className="h-5 w-5 mr-2 text-red-400" />
                Marcadores de Sangre
              </h3>
              <div className="space-y-3">
                {relationship.markers.map((marker: BloodMarker) => (
                  <div
                    key={marker.id}
                    className="bg-orden-900/50 rounded-lg p-4 border border-orden-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-orden-200 flex-1">
                        {marker.description}
                      </p>
                      <div className="flex items-center space-x-1 ml-3">
                        {getMarkerStatusIcon(marker.status)}
                        <span className="text-xs text-orden-400">
                          {marker.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-orden-500">
                      <span>{formatDate(marker.createdAt)}</span>
                      <span>
                        {marker.debtorId === assassin.id
                          ? "Te debe"
                          : "Le debes"}
                      </span>
                    </div>
                  </div>
                ))}
                {relationship.total > 3 && (
                  <p className="text-sm text-orden-400 text-center">
                    +{relationship.total - 3} marcadores más
                  </p>
                )}
              </div>
            </div>
          )}

          {!relationship && (
            <div className="text-center py-8">
              <Skull className="h-12 w-12 text-orden-600 mx-auto mb-4" />
              <p className="text-orden-400">
                No tienes marcadores de sangre con este asesino
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-orden-700">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {assassin.status === "Activo" && (
            <Button className="bg-purple-600 hover:bg-purple-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
