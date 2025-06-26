import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  Map,
  MapPin,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Navigation,
  Layers,
  Search,
} from "lucide-react";
import type { Assassin, AsassinStatus } from "../types";

// Mock coordinates for major cities (in a real app, these would come from the API)
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  "Nueva York": { lat: 40.7128, lng: -74.006 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  Londres: { lat: 51.5074, lng: -0.1278 },
  París: { lat: 48.8566, lng: 2.3522 },
  Tokio: { lat: 35.6762, lng: 139.6503 },
  Berlín: { lat: 52.52, lng: 13.405 },
  Roma: { lat: 41.9028, lng: 12.4964 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
  "Continental Hotel": { lat: 40.7589, lng: -73.9851 }, // NYC Continental
};

interface AssassinLocation extends Assassin {
  coordinates?: { lat: number; lng: number };
  lastSeen?: string;
}

export function LocationMapPage() {
  const { user } = useAuthStore();
  const [selectedAssassin, setSelectedAssassin] =
    useState<AssassinLocation | null>(null);
  const [statusFilter, setStatusFilter] = useState<AsassinStatus | "Todos">(
    "Activo"
  );
  const [showInactive, setShowInactive] = useState(false);
  const [mapView, setMapView] = useState<"satellite" | "street">("street");

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== "admin") {
      window.history.back();
    }
  }, [user]);

  // Fetch assassins data
  const {
    data: assassinsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  const assassins = assassinsData?.data || [];

  // Add coordinates to assassins based on their last known location
  const assassinsWithLocations: AssassinLocation[] = assassins.map(
    (assassin) => {
      const location = assassin.lastKnownLocation || "Nueva York";
      const coordinates =
        CITY_COORDINATES[location] || CITY_COORDINATES["Nueva York"];

      return {
        ...assassin,
        coordinates,
        lastSeen: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };
    }
  );

  // Filter assassins based on status and visibility settings
  const filteredAssassins = assassinsWithLocations.filter((assassin) => {
    if (!showInactive && assassin.status !== "Activo") return false;
    if (statusFilter !== "Todos" && assassin.status !== statusFilter)
      return false;
    return true;
  });

  const handleBackToDashboard = () => {
    window.history.back();
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-orden-100">Acceso Denegado</h2>
          <p className="text-orden-400">
            Solo los administradores pueden acceder al mapa global
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando mapa global...</p>
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
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Map className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orden-100">
                    Mapa Global de Operaciones
                  </h1>
                  <p className="text-sm text-orden-400">
                    Ubicaciones en tiempo real de todos los asesinos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="text-orden-300 hover:text-orden-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>

              <div className="text-right">
                <p className="text-sm text-orden-400">
                  {filteredAssassins.length} asesinos visibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-orden-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-orden-400" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as AsassinStatus | "Todos")
                  }
                  className="bg-orden-700 border border-orden-600 rounded px-3 py-1 text-sm text-orden-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos</option>
                  <option value="Activo">Solo Activos</option>
                  <option value="Retirado">Solo Retirados</option>
                  <option value="Excommunicado">Solo Excommunicados</option>
                </select>
              </div>

              <Button
                variant={showInactive ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
                className="text-sm"
              >
                {showInactive ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                {showInactive ? "Ocultar Inactivos" : "Mostrar Inactivos"}
              </Button>
            </div>

            {/* Map Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant={mapView === "street" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setMapView("street")}
                className="text-sm"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Calles
              </Button>
              <Button
                variant={mapView === "satellite" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setMapView("satellite")}
                className="text-sm"
              >
                <Layers className="h-4 w-4 mr-2" />
                Satélite
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-orden-800 rounded-lg border border-orden-700 h-[600px] relative overflow-hidden">
              {/* Mock Map Background */}
              <div
                className={`w-full h-full ${
                  mapView === "satellite" ? "bg-green-900" : "bg-gray-800"
                } relative`}
              >
                {/* Map Grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-12 grid-rows-8 h-full">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <div key={i} className="border border-orden-600/30"></div>
                    ))}
                  </div>
                </div>

                {/* Assassin Markers */}
                {filteredAssassins.map((assassin, index) => (
                  <AssassinMarker
                    key={assassin.id}
                    assassin={assassin}
                    index={index}
                    onClick={() => setSelectedAssassin(assassin)}
                    isSelected={selectedAssassin?.id === assassin.id}
                  />
                ))}

                {/* Map Overlay Info */}
                <div className="absolute top-4 right-4 bg-orden-900/80 backdrop-blur-sm rounded-lg p-3 border border-orden-700">
                  <div className="text-xs text-orden-300 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>
                        Activo (
                        {assassins.filter((a) => a.status === "Activo").length})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>
                        Retirado (
                        {
                          assassins.filter((a) => a.status === "Retirado")
                            .length
                        }
                        )
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>
                        Excommunicado (
                        {
                          assassins.filter((a) => a.status === "Excommunicado")
                            .length
                        }
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Assassin Details */}
            {selectedAssassin ? (
              <AssassinLocationCard assassin={selectedAssassin} />
            ) : (
              <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-orden-600 mx-auto mb-4" />
                  <p className="text-orden-400">
                    Selecciona un asesino en el mapa para ver sus detalles
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
              <h3 className="text-lg font-semibold text-orden-100 mb-4">
                Estadísticas Globales
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orden-400">Total Asesinos</span>
                  <span className="text-sm font-medium text-orden-200">
                    {assassins.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orden-400">Operativos</span>
                  <span className="text-sm font-medium text-green-400">
                    {assassins.filter((a) => a.status === "Activo").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orden-400">Ubicaciones</span>
                  <span className="text-sm font-medium text-blue-400">
                    {new Set(assassins.map((a) => a.lastKnownLocation)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orden-400">
                    Última Actualización
                  </span>
                  <span className="text-sm font-medium text-orden-300">
                    Ahora
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assassin Marker Component
function AssassinMarker({
  assassin,
  index,
  onClick,
  isSelected,
}: {
  assassin: AssassinLocation;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  // Position markers in a scattered pattern across the map
  const positions = [
    { top: "15%", left: "20%" },
    { top: "25%", left: "60%" },
    { top: "40%", left: "30%" },
    { top: "55%", left: "70%" },
    { top: "70%", left: "25%" },
    { top: "30%", left: "80%" },
    { top: "60%", left: "45%" },
    { top: "80%", left: "55%" },
    { top: "20%", left: "45%" },
    { top: "45%", left: "15%" },
  ];

  const position = positions[index % positions.length];
  const statusColor =
    assassin.status === "Activo"
      ? "bg-green-500"
      : assassin.status === "Retirado"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
      style={{ top: position.top, left: position.left }}
      onClick={onClick}
    >
      <div
        className={`w-6 h-6 ${statusColor} rounded-full border-2 ${
          isSelected ? "border-white" : "border-orden-900"
        } shadow-lg flex items-center justify-center`}
      >
        <MapPin className="h-3 w-3 text-white" />
      </div>
      {isSelected && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-orden-900/90 backdrop-blur-sm rounded px-2 py-1 border border-orden-700 whitespace-nowrap">
          <span className="text-xs text-orden-200 font-medium">
            {assassin.alias}
          </span>
        </div>
      )}
    </div>
  );
}

// Assassin Location Card Component
function AssassinLocationCard({ assassin }: { assassin: AssassinLocation }) {
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

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Hace menos de 1 hora";
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  };

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-blue-500/20 p-2 rounded-full">
          <MapPin className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orden-100">
            {assassin.alias}
          </h3>
          <p
            className={`text-sm font-medium ${getStatusColor(assassin.status)}`}
          >
            {assassin.status}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-xs text-orden-400 block">Ubicación Actual</span>
          <span className="text-sm text-orden-200 font-medium">
            {assassin.lastKnownLocation || "Desconocida"}
          </span>
        </div>

        <div>
          <span className="text-xs text-orden-400 block">Última Actividad</span>
          <span className="text-sm text-orden-200">
            {assassin.lastSeen
              ? formatLastSeen(assassin.lastSeen)
              : "Desconocida"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <span className="text-xs text-orden-400 block">Misiones</span>
            <span className="text-sm font-medium text-orden-200">
              {assassin.completedMissions}
            </span>
          </div>
          <div>
            <span className="text-xs text-orden-400 block">Monedas</span>
            <span className="text-sm font-medium text-gold-400">
              {assassin.goldCoins.toLocaleString()}
            </span>
          </div>
        </div>

        {assassin.coordinates && (
          <div className="pt-2 border-t border-orden-700">
            <span className="text-xs text-orden-400 block">Coordenadas</span>
            <span className="text-xs text-orden-300 font-mono">
              {assassin.coordinates.lat.toFixed(4)},{" "}
              {assassin.coordinates.lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-orden-700">
        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
          <Search className="h-4 w-4 mr-2" />
          Ver Detalles Completos
        </Button>
      </div>
    </div>
  );
}
