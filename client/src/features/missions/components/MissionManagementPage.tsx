import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../../shared/services/api";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import {
  Target,
  Plus,
  Search,
  Filter,
  Edit3,
  UserPlus,
  Calendar,
  Coins,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Users,
} from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils";
import type { Mission, Assassin, MissionStatus } from "../../../shared/types";
import { CreateMissionForm } from "./CreateMissionForm";
import { AssignMissionForm } from "./AssignMissionForm";
import { MissionDetailsModal } from "./MissionDetailsModal";

type MissionFilter =
  | "all"
  | "no_asignada"
  | "asignada"
  | "en_progreso"
  | "completada"
  | "fallida";

export function MissionManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissionFilter>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Fetch missions
  const { data: missionsData, isLoading: isLoadingMissions } = useQuery({
    queryKey: ["missions"],
    queryFn: () => apiService.getMissions(),
  });

  // Fetch assassins for assignment
  const { data: assassinsData, isLoading: isLoadingAssassins } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  const missions = missionsData?.data || [];
  const assassins = assassinsData?.data || [];

  // Filter missions
  const filteredMissions = missions.filter((mission) => {
    const matchesSearch =
      mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.targetName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      mission.status.toLowerCase().replace(" ", "_") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get mission stats
  const missionStats = {
    total: missions.length,
    noAsignada: missions.filter((m) => m.status === "No Asignada").length,
    asignada: missions.filter((m) => m.status === "Asignada").length,
    enProgreso: missions.filter((m) => m.status === "En Progreso").length,
    completada: missions.filter((m) => m.status === "Completada").length,
    fallida: missions.filter((m) => m.status === "Fallida").length,
  };

  const handleBackToDashboard = () => {
    window.history.pushState(null, "", "/dashboard");
    window.location.reload();
  };

  if (isLoadingMissions || isLoadingAssassins) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando gestión de misiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
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
              onClick={() => setShowCreateModal(true)}
              className="bg-gold-600 hover:bg-gold-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Misión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total"
            value={missionStats.total}
            color="blue"
            isActive={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            title="Sin Asignar"
            value={missionStats.noAsignada}
            color="gray"
            isActive={statusFilter === "no_asignada"}
            onClick={() => setStatusFilter("no_asignada")}
          />
          <StatCard
            title="Asignadas"
            value={missionStats.asignada}
            color="blue"
            isActive={statusFilter === "asignada"}
            onClick={() => setStatusFilter("asignada")}
          />
          <StatCard
            title="En Progreso"
            value={missionStats.enProgreso}
            color="yellow"
            isActive={statusFilter === "en_progreso"}
            onClick={() => setStatusFilter("en_progreso")}
          />
          <StatCard
            title="Completadas"
            value={missionStats.completada}
            color="green"
            isActive={statusFilter === "completada"}
            onClick={() => setStatusFilter("completada")}
          />
          <StatCard
            title="Fallidas"
            value={missionStats.fallida}
            color="red"
            isActive={statusFilter === "fallida"}
            onClick={() => setStatusFilter("fallida")}
          />
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              assassins={assassins}
              onEdit={(mission) => {
                setSelectedMission(mission);
                setShowCreateModal(true);
              }}
              onAssign={(mission) => {
                setSelectedMission(mission);
                setShowAssignModal(true);
              }}
              onViewDetails={(mission) => {
                setSelectedMission(mission);
                setShowDetailsModal(true);
              }}
            />
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-orden-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orden-300 mb-2">
              No se encontraron misiones
            </h3>
            <p className="text-orden-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera misión"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Misión
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateMissionForm
          mission={selectedMission}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // In a real app, we would invalidate queries here
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}

      {showAssignModal && selectedMission && (
        <AssignMissionForm
          mission={selectedMission}
          assassins={assassins.filter((a) => a.status === "Activo")}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            // In a real app, we would invalidate queries here
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}

      {showDetailsModal && selectedMission && (
        <MissionDetailsModal
          mission={selectedMission}
          assassins={assassins}
          onClose={() => setShowDetailsModal(false)}
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
          onSuccess={() => {
            setShowDetailsModal(false);
            // In a real app, we would invalidate queries here
            window.location.reload(); // Simple refresh for now
          }}
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
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  color: "blue" | "gray" | "yellow" | "green" | "red";
  isActive: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    blue: isActive
      ? "bg-blue-500/20 border-blue-500 text-blue-400"
      : "hover:bg-blue-500/10 hover:border-blue-500/50",
    gray: isActive
      ? "bg-gray-500/20 border-gray-500 text-gray-400"
      : "hover:bg-gray-500/10 hover:border-gray-500/50",
    yellow: isActive
      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
      : "hover:bg-yellow-500/10 hover:border-yellow-500/50",
    green: isActive
      ? "bg-green-500/20 border-green-500 text-green-400"
      : "hover:bg-green-500/10 hover:border-green-500/50",
    red: isActive
      ? "bg-red-500/20 border-red-500 text-red-400"
      : "hover:bg-red-500/10 hover:border-red-500/50",
  };

  return (
    <button
      onClick={onClick}
      className={`card p-4 text-center transition-all cursor-pointer border ${
        colorClasses[color]
      } ${isActive ? "" : "hover:scale-105"}`}
    >
      <div className="text-2xl font-bold text-orden-100 mb-1">{value}</div>
      <div className="text-xs text-orden-400">{title}</div>
    </button>
  );
}

// Mission Card Component
function MissionCard({
  mission,
  assassins,
  onEdit,
  onAssign,
  onViewDetails,
}: {
  mission: Mission;
  assassins: Assassin[];
  onEdit: (mission: Mission) => void;
  onAssign: (mission: Mission) => void;
  onViewDetails: (mission: Mission) => void;
}) {
  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case "No Asignada":
        return "text-gray-400 bg-gray-500/20";
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
      case "No Asignada":
        return <Clock className="h-4 w-4" />;
      case "Asignada":
        return <UserPlus className="h-4 w-4" />;
      case "En Progreso":
        return <Target className="h-4 w-4" />;
      case "Completada":
        return <CheckCircle className="h-4 w-4" />;
      case "Fallida":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const assignedAssassin = mission.assignedTo
    ? assassins.find((a) => a.id === mission.assignedTo)
    : null;

  return (
    <div className="card p-6 hover:border-gold-500/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orden-100 mb-1">
            {mission.title}
          </h3>
          <p className="text-sm text-orden-400 line-clamp-2">
            {mission.description}
          </p>
        </div>
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            mission.status
          )}`}
        >
          {getStatusIcon(mission.status)}
          <span>{mission.status}</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {mission.targetName && (
          <div className="flex items-center text-sm">
            <Target className="h-4 w-4 text-orden-400 mr-2" />
            <span className="text-orden-300">{mission.targetName}</span>
          </div>
        )}

        <div className="flex items-center text-sm">
          <Coins className="h-4 w-4 text-gold-400 mr-2" />
          <span className="text-gold-400 font-medium">
            {formatCurrency(mission.reward)}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 text-orden-400 mr-2" />
          <span className="text-orden-300">{formatDate(mission.deadline)}</span>
        </div>

        {assignedAssassin && (
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-blue-400">{assignedAssassin.alias}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(mission)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>

        <Button size="sm" variant="secondary" onClick={() => onEdit(mission)}>
          <Edit3 className="h-4 w-4" />
        </Button>

        {mission.status === "No Asignada" && (
          <Button size="sm" variant="primary" onClick={() => onAssign(mission)}>
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
