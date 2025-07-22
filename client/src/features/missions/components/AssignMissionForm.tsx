import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import {
  X,
  UserPlus,
  Search,
  Target,
  User,
  Coins,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "../../../shared/utils";
import type { Mission, Assassin } from "../../../shared/types";

interface AssignMissionFormProps {
  mission: Mission;
  assassins: Assassin[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignMissionForm({
  mission,
  assassins,
  onClose,
  onSuccess,
}: AssignMissionFormProps) {
  const queryClient = useQueryClient();
  const [selectedAssassin, setSelectedAssassin] = useState<Assassin | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Mission assignment mutation
  const assignMissionMutation = useMutation({
    mutationFn: ({
      missionId,
      assassinId,
    }: {
      missionId: string;
      assassinId: string;
    }) => apiService.assignMission(missionId, assassinId),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["assassins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["available-missions"] });

      toast({
        type: "success",
        title: "Misión asignada",
        message: `La misión "${mission.title}" ha sido asignada a ${selectedAssassin?.alias}`,
      });

      onSuccess();
    },
    onError: (error) => {
      console.error("Error assigning mission:", error);
      toast({
        type: "error",
        title: "Error",
        message: "Error al asignar la misión. Inténtalo de nuevo.",
      });
    },
  });

  // Filter assassins based on search
  const filteredAssassins = assassins.filter(
    (assassin) =>
      assassin.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assassin.realName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assassin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = () => {
    if (!selectedAssassin) {
      toast({
        type: "error",
        title: "Error",
        message: "Debes seleccionar un asesino para asignar la misión",
      });
      return;
    }

    assignMissionMutation.mutate({
      missionId: mission.id,
      assassinId: selectedAssassin.id,
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-orden-400";
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                Asignar Misión
              </h3>
              <p className="text-sm text-orden-400">
                Selecciona un asesino activo para esta misión
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Mission Info Sidebar */}
          <div className="w-1/3 p-6 border-r border-orden-700 bg-orden-900/50">
            <h4 className="text-sm font-medium text-orden-200 mb-4">
              Información de la Misión
            </h4>

            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-semibold text-orden-100 mb-1">
                  {mission.title}
                </h5>
                <p className="text-sm text-orden-400 line-clamp-3">
                  {mission.description}
                </p>
              </div>

              <div className="space-y-3">
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
                  <AlertTriangle className="h-4 w-4 text-orden-400 mr-2" />
                  <span
                    className={`font-medium ${getPriorityColor(
                      mission.priority
                    )}`}
                  >
                    Prioridad {getPriorityLabel(mission.priority)}
                  </span>
                </div>
              </div>

              {selectedAssassin && (
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">
                    Asesino Seleccionado
                  </h5>
                  <div className="space-y-2">
                    <p className="text-orden-100 font-medium">
                      {selectedAssassin.alias}
                    </p>
                    <p className="text-xs text-orden-400">
                      {selectedAssassin.realName}
                    </p>
                    <div className="flex items-center text-xs">
                      <Coins className="h-3 w-3 text-gold-400 mr-1" />
                      <span className="text-gold-400">
                        {formatCurrency(selectedAssassin.goldCoins)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assassin Selection */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-6 border-b border-orden-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
                <Input
                  placeholder="Buscar asesino por alias, nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-orden-400 mt-2">
                {filteredAssassins.length} asesinos activos disponibles
              </p>
            </div>

            {/* Assassin List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {filteredAssassins.map((assassin) => (
                  <AssassinCard
                    key={assassin.id}
                    assassin={assassin}
                    isSelected={selectedAssassin?.id === assassin.id}
                    onSelect={() => setSelectedAssassin(assassin)}
                  />
                ))}

                {filteredAssassins.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-orden-600 mx-auto mb-4" />
                    <p className="text-orden-400">
                      {searchQuery
                        ? "No se encontraron asesinos"
                        : "No hay asesinos activos disponibles"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-orden-700">
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                  disabled={assignMissionMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssign}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !selectedAssassin || assignMissionMutation.isPending
                  }
                >
                  {assignMissionMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Asignar Misión
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assassin Card Component
function AssassinCard({
  assassin,
  isSelected,
  onSelect,
}: {
  assassin: Assassin;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border transition-all text-left ${
        isSelected
          ? "border-blue-500 bg-blue-500/10"
          : "border-orden-600 hover:border-orden-500 hover:bg-orden-700/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orden-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-orden-200">
                {assassin.alias.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-orden-100">
                {assassin.alias}
              </h4>
              <p className="text-xs text-orden-400">{assassin.realName}</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center text-xs text-gold-400 mb-1">
            <Coins className="h-3 w-3 mr-1" />
            {formatCurrency(assassin.goldCoins)}
          </div>
          <p className="text-xs text-orden-400">
            {assassin.completedMissions} misiones
          </p>
        </div>

        {isSelected && (
          <div className="ml-3">
            <CheckCircle className="h-5 w-5 text-blue-400" />
          </div>
        )}
      </div>

      {assassin.skills && assassin.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {assassin.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-orden-700 text-orden-300 rounded"
            >
              {skill}
            </span>
          ))}
          {assassin.skills.length > 3 && (
            <span className="px-2 py-1 text-xs bg-orden-700 text-orden-400 rounded">
              +{assassin.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
