import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import {
  ArrowLeft,
  Skull,
  Plus,
  Search,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  X,
  Shield,
} from "lucide-react";
import { formatDate } from "../../../shared/utils";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type { BloodMarker, Assassin } from "../../../shared/types";

type BloodMarkerFilter =
  | "all"
  | "owed_by_me"
  | "owed_to_me"
  | "pending"
  | "paid";

export function BloodMarkersPage() {
  const { user } = useAuthStore();
  const { goBack } = useNavigation();
  const [activeFilter, setActiveFilter] = useState<BloodMarkerFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<BloodMarker | null>(
    null
  );

  const queryClient = useQueryClient();

  // Fetch blood markers
  const { data: bloodMarkersData, isLoading } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
  });

  // Fetch assassins for the create form
  const { data: assassinsData } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  const bloodMarkers = bloodMarkersData?.data || [];
  const assassins = assassinsData?.data || [];

  // Mutations
  const payMarkerMutation = useMutation({
    mutationFn: (markerId: string) => apiService.payBloodMarker(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Marcador pagado",
        message: "Has marcado la deuda como pagada. Esperando confirmación.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo procesar el pago del marcador",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (markerId: string) =>
      apiService.confirmBloodMarkerPayment(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Pago confirmado",
        message: "El marcador ha sido saldado exitosamente",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo confirmar el pago",
      });
    },
  });

  // Filter markers
  const filteredMarkers = bloodMarkers.filter((marker) => {
    const matchesSearch =
      marker.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getOtherPartyName(marker)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case "owed_by_me":
        return marker.debtorId === user?.id;
      case "owed_to_me":
        return marker.creditorId === user?.id;
      case "pending":
        return marker.status === "Pendiente";
      case "paid":
        return marker.status === "Saldado";
      default:
        return true;
    }
  });

  const getOtherPartyName = (marker: BloodMarker) => {
    const isCreditor = marker.creditorId === user?.id;
    const otherPartyId = isCreditor ? marker.debtorId : marker.creditorId;
    const otherParty = assassins.find((a) => a.id === otherPartyId);
    return otherParty?.alias || "Desconocido";
  };

  const getMarkerStats = () => {
    const owedByMe = bloodMarkers.filter(
      (m) => m.debtorId === user?.id && m.status === "Pendiente"
    ).length;
    const owedToMe = bloodMarkers.filter(
      (m) => m.creditorId === user?.id && m.status === "Pendiente"
    ).length;
    const pendingConfirmation = bloodMarkers.filter(
      (m) =>
        m.creditorId === user?.id &&
        m.status === "Pago Pendiente de Confirmación"
    ).length;

    return { owedByMe, owedToMe, pendingConfirmation };
  };

  const stats = getMarkerStats();

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
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="text-orden-300 hover:text-orden-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <Skull className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orden-100">
                    Marcadores de Sangre
                  </h1>
                  <p className="text-sm text-orden-400">
                    Gestión de deudas y favores
                  </p>
                </div>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orden-300 mb-1">
                  Deudas que debo
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.owedByMe}
                </p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-lg">
                <Skull className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orden-300 mb-1">
                  Deudas que me deben
                </p>
                <p className="text-2xl font-bold text-gold-400">
                  {stats.owedToMe}
                </p>
              </div>
              <div className="bg-gold-500/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-gold-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orden-300 mb-1">
                  Pendientes de confirmar
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.pendingConfirmation}
                </p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Todos" },
                { key: "owed_by_me", label: "Que debo" },
                { key: "owed_to_me", label: "Que me deben" },
                { key: "pending", label: "Pendientes" },
                { key: "paid", label: "Saldados" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "primary" : "ghost"}
                  size="sm"
                  onClick={() =>
                    setActiveFilter(filter.key as BloodMarkerFilter)
                  }
                  className={
                    activeFilter === filter.key
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
              <Input
                placeholder="Buscar por descripción o asesino..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Blood Markers List */}
        <div className="space-y-4">
          {filteredMarkers.map((marker) => (
            <BloodMarkerCard
              key={marker.id}
              marker={marker}
              currentUserId={user?.id || ""}
              otherPartyName={getOtherPartyName(marker)}
              onPayMarker={(id) => payMarkerMutation.mutate(id)}
              onConfirmPayment={(id) => confirmPaymentMutation.mutate(id)}
              onViewDetails={(marker) => setSelectedMarker(marker)}
            />
          ))}

          {filteredMarkers.length === 0 && (
            <div className="card p-12 text-center">
              <Skull className="h-16 w-16 text-orden-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-orden-200 mb-2">
                No hay marcadores de sangre
              </h3>
              <p className="text-orden-400 mb-6">
                {activeFilter === "all"
                  ? "No tienes marcadores de sangre registrados"
                  : "No hay marcadores que coincidan con el filtro seleccionado"}
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer marcador
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateBloodMarkerModal
          assassins={assassins}
          currentUserId={user?.id || ""}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
          }}
        />
      )}

      {selectedMarker && (
        <BloodMarkerDetailsModal
          marker={selectedMarker}
          otherPartyName={getOtherPartyName(selectedMarker)}
          currentUserId={user?.id || ""}
          onClose={() => setSelectedMarker(null)}
          onPayMarker={(id) => {
            payMarkerMutation.mutate(id);
            setSelectedMarker(null);
          }}
          onConfirmPayment={(id) => {
            confirmPaymentMutation.mutate(id);
            setSelectedMarker(null);
          }}
        />
      )}
    </div>
  );
}

// Blood Marker Card Component
function BloodMarkerCard({
  marker,
  currentUserId,
  otherPartyName,
  onPayMarker,
  onConfirmPayment,
  onViewDetails,
}: {
  marker: BloodMarker;
  currentUserId: string;
  otherPartyName: string;
  onPayMarker: (id: string) => void;
  onConfirmPayment: (id: string) => void;
  onViewDetails: (marker: BloodMarker) => void;
}) {
  const isCreditor = marker.creditorId === currentUserId;
  const isDebtor = marker.debtorId === currentUserId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return isCreditor
          ? "text-gold-400 bg-gold-500/20"
          : "text-red-400 bg-red-500/20";
      case "Pago Pendiente de Confirmación":
        return "text-yellow-400 bg-yellow-500/20";
      case "Saldado":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-orden-400 bg-orden-700/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-4 w-4" />;
      case "Pago Pendiente de Confirmación":
        return <AlertTriangle className="h-4 w-4" />;
      case "Saldado":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="card p-6 hover:border-red-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className={`p-2 rounded-lg ${
                isCreditor ? "bg-gold-500/20" : "bg-red-500/20"
              }`}
            >
              {isCreditor ? (
                <DollarSign className="h-5 w-5 text-gold-400" />
              ) : (
                <Skull className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-orden-100">
                  {isCreditor
                    ? `${otherPartyName} te debe`
                    : `Debes a ${otherPartyName}`}
                </h3>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    marker.status
                  )}`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(marker.status)}
                    <span>{marker.status}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-orden-300 mb-2 line-clamp-2">
                {marker.description}
              </p>

              <div className="flex items-center text-xs text-orden-400 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(marker.createdAt)}
                </div>
                {marker.paidAt && (
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pagado {formatDate(marker.paidAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(marker)}
          >
            Ver detalles
          </Button>

          {/* Actions based on status and role */}
          {marker.status === "Pendiente" && isDebtor && (
            <Button
              size="sm"
              onClick={() => onPayMarker(marker.id)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Marcar como pagado
            </Button>
          )}

          {marker.status === "Pago Pendiente de Confirmación" && isCreditor && (
            <Button
              size="sm"
              onClick={() => onConfirmPayment(marker.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar pago
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Blood Marker Modal
function CreateBloodMarkerModal({
  assassins,
  currentUserId,
  onClose,
  onSuccess,
}: {
  assassins: Assassin[];
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    debtorId: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.debtorId || !formData.description.trim()) {
      toast({
        type: "error",
        title: "Error",
        message: "Todos los campos son requeridos",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await apiService.createBloodMarker({
        debtorId: formData.debtorId,
        creditorId: currentUserId,
        description: formData.description.trim(),
      });

      toast({
        type: "success",
        title: "Marcador creado",
        message: "El marcador de sangre ha sido registrado exitosamente",
      });

      onSuccess();
    } catch {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo crear el marcador de sangre",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out current user from assassins list
  const availableAssassins = assassins.filter(
    (a) => a.id !== currentUserId && a.status === "Activo"
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Skull className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                Nuevo Marcador de Sangre
              </h3>
              <p className="text-sm text-orden-400">
                Registrar una nueva deuda
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Asesino deudor *
            </label>
            <select
              value={formData.debtorId}
              onChange={(e) =>
                setFormData({ ...formData, debtorId: e.target.value })
              }
              className="w-full px-4 py-3 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar asesino...</option>
              {availableAssassins.map((assassin) => (
                <option key={assassin.id} value={assassin.id}>
                  {assassin.alias} ({assassin.realName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Descripción del favor *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 placeholder-orden-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Describe el favor o asistencia proporcionada..."
              required
            />
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-1">
                  Aviso importante
                </h4>
                <p className="text-xs text-orden-300">
                  Un marcador de sangre es un compromiso sagrado en La Orden.
                  Solo debe usarse para registrar favores reales y
                  significativos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Skull className="h-4 w-4 mr-2" />
                  Crear Marcador
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Blood Marker Details Modal
function BloodMarkerDetailsModal({
  marker,
  otherPartyName,
  currentUserId,
  onClose,
  onPayMarker,
  onConfirmPayment,
}: {
  marker: BloodMarker;
  otherPartyName: string;
  currentUserId: string;
  onClose: () => void;
  onPayMarker: (id: string) => void;
  onConfirmPayment: (id: string) => void;
}) {
  const isCreditor = marker.creditorId === currentUserId;
  const isDebtor = marker.debtorId === currentUserId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "Pago Pendiente de Confirmación":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "Saldado":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-orden-400 bg-orden-700/50 border-orden-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Skull className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                Detalles del Marcador
              </h3>
              <p className="text-sm text-orden-400">
                Información completa de la deuda
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="text-center">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                marker.status
              )}`}
            >
              {marker.status === "Pendiente" && (
                <Clock className="h-4 w-4 mr-2" />
              )}
              {marker.status === "Pago Pendiente de Confirmación" && (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              {marker.status === "Saldado" && (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {marker.status}
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-red-500/20 p-3 rounded-lg inline-flex mb-2">
                <User className="h-6 w-6 text-red-400" />
              </div>
              <h4 className="text-sm font-medium text-orden-200">Deudor</h4>
              <p className="text-orden-100">
                {isDebtor ? "Tú" : otherPartyName}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gold-500/20 p-3 rounded-lg inline-flex mb-2">
                <DollarSign className="h-6 w-6 text-gold-400" />
              </div>
              <h4 className="text-sm font-medium text-orden-200">Acreedor</h4>
              <p className="text-orden-100">
                {isCreditor ? "Tú" : otherPartyName}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-orden-200 mb-2">
              Descripción del favor
            </h4>
            <div className="bg-orden-900/50 rounded-lg p-4 border border-orden-700">
              <p className="text-orden-100 leading-relaxed">
                {marker.description}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-medium text-orden-200 mb-3">
              Historial
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-orden-200">Marcador creado</p>
                  <p className="text-xs text-orden-400">
                    {formatDate(marker.createdAt)}
                  </p>
                </div>
              </div>

              {marker.paidAt && (
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500/20 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orden-200">
                      Marcado como pagado
                    </p>
                    <p className="text-xs text-orden-400">
                      {formatDate(marker.paidAt)}
                    </p>
                  </div>
                </div>
              )}

              {marker.status === "Saldado" && (
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orden-200">
                      Pago confirmado - Deuda saldada
                    </p>
                    <p className="text-xs text-orden-400">Marcador cerrado</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-orden-700">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cerrar
            </Button>

            {marker.status === "Pendiente" && isDebtor && (
              <Button
                onClick={() => onPayMarker(marker.id)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Marcar como pagado
              </Button>
            )}

            {marker.status === "Pago Pendiente de Confirmación" &&
              isCreditor && (
                <Button
                  onClick={() => onConfirmPayment(marker.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar pago
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
