import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { Input } from "../../../shared/components/Input";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import {
  ArrowLeft,
  Search,
  Target,
  Calendar,
  Coins,
  AlertTriangle,
  Send,
} from "lucide-react";
import type { Mission } from "../../../shared/types";

export function AvailableMissionsPage() {
  const { goToDashboard } = useNavigation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "reward" | "priority">(
    "deadline"
  );

  // Fetch available missions (status "No Asignada")
  const {
    data: missionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-missions"],
    queryFn: () => apiService.getAvailableMissions(),
  });

  // Mutation for applying to missions
  const applyMutation = useMutation({
    mutationFn: (missionId: string) => apiService.applyToMission(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-missions"] });
      queryClient.invalidateQueries({ queryKey: ["assassin-dashboard"] });
      toast({
        type: "success",
        title: "Postulación enviada",
        message:
          "Tu postulación ha sido enviada. El administrador la revisará pronto.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo enviar la postulación. Inténtalo de nuevo.",
      });
    },
  });

  const missions = missionsData?.data || [];

  // Filter and sort missions
  const filteredMissions = useMemo(() => {
    const filtered = missions.filter((mission: Mission) => {
      const matchesSearch =
        mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.targetName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || mission.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });

    // Sort missions
    filtered.sort((a: Mission, b: Mission) => {
      switch (sortBy) {
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "reward":
          return b.reward - a.reward;
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            priorityOrder[b.priority || "medium"] -
            priorityOrder[a.priority || "medium"]
          );
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [missions, searchQuery, priorityFilter, sortBy]);

  const handleApplyToMission = (missionId: string) => {
    applyMutation.mutate(missionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando misiones disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Target className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-orden-100">
            Error al cargar misiones
          </h2>
          <p className="text-orden-400">
            No se pudieron cargar las misiones disponibles. Verifica tu
            conexión.
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
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
                onClick={goToDashboard}
                className="text-orden-300 hover:text-orden-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-gold-400" />
              <div>
                <h1 className="text-xl font-bold text-gold-400">
                  Misiones Disponibles
                </h1>
                <p className="text-sm text-orden-400">
                  Postúlate a misiones que se ajusten a tus habilidades
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-orden-100">
              {missions.length}
            </p>
            <p className="text-sm text-orden-400">Misiones Disponibles</p>
          </div>

          <div className="card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-orden-100">
              {missions.filter((m) => m.priority === "high").length}
            </p>
            <p className="text-sm text-orden-400">Alta Prioridad</p>
          </div>

          <div className="card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Coins className="h-5 w-5 text-gold-400" />
            </div>
            <p className="text-2xl font-bold text-gold-400">
              {missions.length > 0
                ? Math.max(...missions.map((m) => m.reward)).toLocaleString()
                : 0}
            </p>
            <p className="text-sm text-orden-400">Máxima Recompensa</p>
          </div>

          <div className="card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-orden-100">
              {
                missions.filter((m) => {
                  const deadline = new Date(m.deadline);
                  const now = new Date();
                  const diffDays = Math.ceil(
                    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return diffDays <= 7;
                }).length
              }
            </p>
            <p className="text-sm text-orden-400">Urgentes (7 días)</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
              <Input
                placeholder="Buscar por título, descripción o objetivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-orden-800 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:border-gold-500 focus:outline-none"
              >
                <option value="all">Todas las prioridades</option>
                <option value="high">Alta prioridad</option>
                <option value="medium">Prioridad media</option>
                <option value="low">Prioridad baja</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "deadline" | "reward" | "priority"
                  )
                }
                className="w-full bg-orden-800 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:border-gold-500 focus:outline-none"
              >
                <option value="deadline">Ordenar por fecha límite</option>
                <option value="reward">Ordenar por recompensa</option>
                <option value="priority">Ordenar por prioridad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Missions Grid */}
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-orden-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orden-300 mb-2">
              {searchQuery || priorityFilter !== "all"
                ? "No se encontraron misiones"
                : "No hay misiones disponibles"}
            </h3>
            <p className="text-orden-400 mb-6">
              {searchQuery || priorityFilter !== "all"
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Actualmente no hay misiones disponibles para postulación"}
            </p>
            {(searchQuery || priorityFilter !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setPriorityFilter("all");
                }}
                variant="secondary"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMissions.map((mission: Mission) => (
              <AvailableMissionCard
                key={mission.id}
                mission={mission}
                onApply={handleApplyToMission}
                isApplying={applyMutation.isPending}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Mission Card Component
interface AvailableMissionCardProps {
  mission: Mission;
  onApply: (missionId: string) => void;
  isApplying: boolean;
}

function AvailableMissionCard({
  mission,
  onApply,
  isApplying,
}: AvailableMissionCardProps) {
  const deadline = new Date(mission.deadline);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysRemaining <= 7;
  const isOverdue = daysRemaining < 0;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-orden-400 bg-orden-500/20 border-orden-500/30";
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`card p-6 hover:border-gold-500/30 transition-all ${
        isUrgent ? "border-yellow-500/30 bg-yellow-500/5" : ""
      } ${isOverdue ? "border-red-500/30 bg-red-500/5" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orden-100 mb-1">
            {mission.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                mission.priority
              )}`}
            >
              {getPriorityLabel(mission.priority)}
            </span>
            {isUrgent && !isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
                Urgente
              </span>
            )}
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-400">
                Vencida
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
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
          <span className={isOverdue ? "text-red-400" : "text-orden-300"}>
            {formatDate(mission.deadline)}
          </span>
          <span
            className={`ml-2 text-xs ${
              isOverdue
                ? "text-red-400"
                : isUrgent
                ? "text-yellow-400"
                : "text-orden-500"
            }`}
          >
            (
            {isOverdue
              ? `${Math.abs(daysRemaining)} días vencida`
              : daysRemaining === 0
              ? "Vence hoy"
              : `${daysRemaining} días restantes`}
            )
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-orden-400 line-clamp-3">
          {mission.description}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-orden-700/50">
        <Button
          onClick={() => onApply(mission.id)}
          disabled={isApplying || isOverdue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
        >
          {isApplying ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Enviando...
            </>
          ) : isOverdue ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Misión Vencida
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Postularme
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
