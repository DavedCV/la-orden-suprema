import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  Target,
  Search,
  Filter,
  Calendar,
  Coins,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Eye,
  Zap,
} from "lucide-react";
import { formatDate, formatCurrency } from "../utils";
import { toast } from "../utils/toast";
import type { Mission, MissionStatus } from "../types";

type MissionFilter =
  | "all"
  | "asignada"
  | "en_progreso"
  | "completada"
  | "fallida";

interface MissionWithActions extends Mission {
  canStart?: boolean;
  daysRemaining?: number;
  isOverdue?: boolean;
}

export function AssassinMissionsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissionFilter>("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showMissionDetails, setShowMissionDetails] = useState(false);

  const queryClient = useQueryClient();

  // Fetch missions
  const { data: missionsData, isLoading } = useQuery({
    queryKey: ["missions"],
    queryFn: () => apiService.getMissions(),
  });

  // Start mission mutation
  const startMissionMutation = useMutation({
    mutationFn: (missionId: string) =>
      apiService.updateMissionStatus(missionId, "En Progreso"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["assassin-dashboard"] });
      toast({
        type: "success",
        title: "Misión iniciada",
        message: "Has iniciado la misión exitosamente. ¡Buena suerte!",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo iniciar la misión. Inténtalo de nuevo.",
      });
    },
  });

  const missions = missionsData?.data || [];

  // Filter missions for current assassin
  const assassinMissions: MissionWithActions[] = missions
    .filter((mission) => mission.assignedTo === user?.id)
    .map((mission) => {
      const deadline = new Date(mission.deadline);
      const now = new Date();
      const daysRemaining = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...mission,
        canStart: mission.status === "Asignada",
        daysRemaining,
        isOverdue:
          daysRemaining < 0 &&
          mission.status !== "Completada" &&
          mission.status !== "Fallida",
      };
    });

  // Apply filters
  const filteredMissions = assassinMissions.filter((mission) => {
    const matchesSearch =
      mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.targetName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      mission.status.toLowerCase().replace(" ", "_") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const missionStats = {
    total: assassinMissions.length,
    asignada: assassinMissions.filter((m) => m.status === "Asignada").length,
    enProgreso: assassinMissions.filter((m) => m.status === "En Progreso")
      .length,
    completada: assassinMissions.filter((m) => m.status === "Completada")
      .length,
    fallida: assassinMissions.filter((m) => m.status === "Fallida").length,
    overdue: assassinMissions.filter((m) => m.isOverdue).length,
    totalRewards: assassinMissions
      .filter((m) => m.status === "Completada")
      .reduce((sum, m) => sum + m.reward, 0),
  };

  const handleBackToDashboard = () => {
    window.history.back();
  };

  const handleStartMission = (missionId: string) => {
    startMissionMutation.mutate(missionId);
  };

  const handleViewDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setShowMissionDetails(true);
  };

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
                {filteredMissions.length} de {assassinMissions.length} misiones
              </p>
              <p className="text-xs text-orden-500">
                {missionStats.overdue > 0 && (
                  <span className="text-red-400">
                    {missionStats.overdue} vencidas
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total"
            value={missionStats.total}
            color="blue"
            icon={<Target className="h-4 w-4" />}
            isActive={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            title="Asignadas"
            value={missionStats.asignada}
            color="blue"
            icon={<Clock className="h-4 w-4" />}
            isActive={statusFilter === "asignada"}
            onClick={() => setStatusFilter("asignada")}
          />
          <StatCard
            title="En Progreso"
            value={missionStats.enProgreso}
            color="yellow"
            icon={<Play className="h-4 w-4" />}
            isActive={statusFilter === "en_progreso"}
            onClick={() => setStatusFilter("en_progreso")}
          />
          <StatCard
            title="Completadas"
            value={missionStats.completada}
            color="green"
            icon={<CheckCircle className="h-4 w-4" />}
            isActive={statusFilter === "completada"}
            onClick={() => setStatusFilter("completada")}
          />
          <StatCard
            title="Fallidas"
            value={missionStats.fallida}
            color="red"
            icon={<AlertTriangle className="h-4 w-4" />}
            isActive={statusFilter === "fallida"}
            onClick={() => setStatusFilter("fallida")}
          />
          <StatCard
            title="Recompensas"
            value={formatCurrency(missionStats.totalRewards)}
            color="gold"
            icon={<Coins className="h-4 w-4" />}
            subtitle="Ganadas"
          />
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, descripción o objetivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Missions Grid */}
        {filteredMissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStartMission={handleStartMission}
                onViewDetails={handleViewDetails}
                isStarting={startMissionMutation.isPending}
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
          </div>
        )}
      </main>

      {/* Mission Details Modal */}
      {showMissionDetails && selectedMission && (
        <MissionDetailsModal
          mission={selectedMission}
          onClose={() => {
            setShowMissionDetails(false);
            setSelectedMission(null);
          }}
          onStartMission={handleStartMission}
          isStarting={startMissionMutation.isPending}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  color,
  icon,
  subtitle,
  isActive,
  onClick,
}: {
  title: string;
  value: string | number;
  color: "blue" | "yellow" | "green" | "red" | "gold";
  icon: React.ReactNode;
  subtitle?: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    green: "text-green-400 bg-green-500/20 border-green-500/30",
    red: "text-red-400 bg-red-500/20 border-red-500/30",
    gold: "text-gold-400 bg-gold-500/20 border-gold-500/30",
  };

  return (
    <div
      className={`card p-4 cursor-pointer transition-all hover:scale-105 ${
        isActive ? `border ${colorClasses[color].split(" ")[2]} shadow-lg` : ""
      } ${onClick ? "hover:border-orden-600" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-orden-300">{title}</h4>
        <div className={`p-1.5 rounded ${colorClasses[color].split(" ")[1]}`}>
          <div className={colorClasses[color].split(" ")[0]}>{icon}</div>
        </div>
      </div>
      <div>
        <p className={`text-lg font-bold ${colorClasses[color].split(" ")[0]}`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-orden-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// Mission Card Component
function MissionCard({
  mission,
  onStartMission,
  onViewDetails,
  isStarting,
}: {
  mission: MissionWithActions;
  onStartMission: (missionId: string) => void;
  onViewDetails: (mission: Mission) => void;
  isStarting: boolean;
}) {
  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case "Asignada":
        return "text-blue-400 bg-blue-500/20";
      case "En Progreso":
        return "text-yellow-400 bg-yellow-500/20";
      case "Completada":
        return "text-green-400 bg-green-500/20";
      case "Fallida":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-orden-400 bg-orden-700/50";
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case "Asignada":
        return <Clock className="h-4 w-4" />;
      case "En Progreso":
        return <Play className="h-4 w-4" />;
      case "Completada":
        return <CheckCircle className="h-4 w-4" />;
      case "Fallida":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-orden-400 bg-orden-700/50";
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Media";
    }
  };

  return (
    <div
      className={`card p-6 hover:border-gold-500/30 transition-all hover:shadow-lg hover:scale-[1.02] ${
        mission.isOverdue ? "border-red-500/30 bg-red-500/5" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-orden-100">
              {mission.title}
            </h3>
            {mission.isOverdue && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                Vencida
              </span>
            )}
          </div>
          <p className="text-sm text-orden-400 line-clamp-2 leading-relaxed">
            {mission.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              mission.status
            )}`}
          >
            {getStatusIcon(mission.status)}
            <span>{mission.status}</span>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
              mission.priority
            )}`}
          >
            {getPriorityLabel(mission.priority)}
          </div>
        </div>
      </div>

      {/* Mission Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm">
          <Target className="h-4 w-4 text-orden-400 mr-2" />
          <span className="text-orden-300">{mission.targetName}</span>
        </div>

        <div className="flex items-center text-sm">
          <Coins className="h-4 w-4 text-gold-400 mr-2" />
          <span className="text-gold-400 font-medium">
            {formatCurrency(mission.reward)}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 text-orden-400 mr-2" />
          <span
            className={`${
              mission.isOverdue ? "text-red-400" : "text-orden-300"
            }`}
          >
            {formatDate(mission.deadline)}
          </span>
          {mission.daysRemaining !== undefined && (
            <span
              className={`ml-2 text-xs ${
                mission.daysRemaining < 0
                  ? "text-red-400"
                  : mission.daysRemaining <= 3
                  ? "text-yellow-400"
                  : "text-orden-500"
              }`}
            >
              (
              {mission.daysRemaining < 0
                ? `${Math.abs(mission.daysRemaining)} días vencida`
                : mission.daysRemaining === 0
                ? "Vence hoy"
                : `${mission.daysRemaining} días restantes`}
              )
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-orden-700/50">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(mission)}
          className="flex-1 text-orden-300 hover:text-orden-100"
        >
          <Eye className="h-4 w-4 mr-1" />
          Detalles
        </Button>

        {mission.canStart && (
          <Button
            size="sm"
            onClick={() => onStartMission(mission.id)}
            disabled={isStarting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isStarting ? (
              <LoadingSpinner size="sm" className="mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Iniciar
          </Button>
        )}
      </div>
    </div>
  );
}

// Mission Details Modal for Assassins
function MissionDetailsModal({
  mission,
  onClose,
  onStartMission,
  isStarting,
}: {
  mission: Mission;
  onClose: () => void;
  onStartMission: (missionId: string) => void;
  isStarting: boolean;
}) {
  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case "Asignada":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "En Progreso":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "Completada":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "Fallida":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-orden-400 bg-orden-700/50 border-orden-600";
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case "Asignada":
        return <Clock className="h-4 w-4" />;
      case "En Progreso":
        return <Play className="h-4 w-4" />;
      case "Completada":
        return <CheckCircle className="h-4 w-4" />;
      case "Fallida":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canStart = mission.status === "Asignada";
  const deadline = new Date(mission.deadline);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysRemaining < 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-orden-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-orden-100 mb-1">
                {mission.title}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    mission.status
                  )}`}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(mission.status)}
                    {mission.status}
                  </div>
                </div>
                {isOverdue && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    Vencida
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Mission Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Objetivo
                </label>
                <div className="flex items-center text-orden-100">
                  <Target className="h-4 w-4 text-orden-400 mr-2" />
                  {mission.targetName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Recompensa
                </label>
                <div className="flex items-center text-gold-400 font-medium">
                  <Coins className="h-4 w-4 mr-2" />
                  {formatCurrency(mission.reward)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Fecha Límite
                </label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-orden-400 mr-2" />
                  <span
                    className={isOverdue ? "text-red-400" : "text-orden-100"}
                  >
                    {formatDate(mission.deadline)}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    daysRemaining < 0
                      ? "text-red-400"
                      : daysRemaining <= 3
                      ? "text-yellow-400"
                      : "text-orden-500"
                  }`}
                >
                  {daysRemaining < 0
                    ? `Vencida hace ${Math.abs(daysRemaining)} días`
                    : daysRemaining === 0
                    ? "Vence hoy"
                    : `${daysRemaining} días restantes`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Prioridad
                </label>
                <div className="flex items-center text-orden-100">
                  <Zap className="h-4 w-4 text-orden-400 mr-2" />
                  {mission.priority === "high"
                    ? "Alta"
                    : mission.priority === "medium"
                    ? "Media"
                    : "Baja"}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-orden-400 mb-2">
              Descripción de la Misión
            </label>
            <div className="bg-orden-900/50 rounded-lg p-4 border border-orden-700">
              <p className="text-orden-200 leading-relaxed">
                {mission.description}
              </p>
            </div>
          </div>

          {/* Mission Stats */}
          <div className="bg-orden-900/30 rounded-lg p-4 border border-orden-700">
            <h4 className="text-sm font-medium text-orden-200 mb-3">
              Información Adicional
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-orden-400">ID de Misión:</span>
                <span className="text-orden-300 font-mono text-xs">
                  {mission.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-orden-400">Creada:</span>
                <span className="text-orden-300">
                  {formatDate(mission.createdAt)}
                </span>
              </div>
              {mission.assignedAt && (
                <div className="flex justify-between">
                  <span className="text-orden-400">Asignada:</span>
                  <span className="text-orden-300">
                    {formatDate(mission.assignedAt)}
                  </span>
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
            {canStart && (
              <Button
                onClick={() => onStartMission(mission.id)}
                disabled={isStarting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isStarting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Misión
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
