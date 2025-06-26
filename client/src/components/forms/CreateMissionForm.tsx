import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { apiService } from "../../services/api";
import { toast } from "../../utils/toast";
import {
  X,
  Target,
  Calendar,
  Coins,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { Mission } from "../../types";

// Validation schema
const createMissionSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  targetName: z.string().min(2, "El nombre del objetivo es requerido"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  reward: z.number().min(100, "La recompensa mínima es 100 monedas"),
  deadline: z.string().min(1, "La fecha límite es requerida"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type CreateMissionFormData = z.infer<typeof createMissionSchema>;

interface CreateMissionFormProps {
  mission?: Mission | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMissionForm({
  mission,
  onClose,
  onSuccess,
}: CreateMissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!mission;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      title: mission?.title || "",
      targetName: mission?.targetName || "",
      description: mission?.description || "",
      reward: mission?.reward || 1000,
      deadline: mission?.deadline
        ? new Date(mission.deadline).toISOString().split("T")[0]
        : "",
      priority: mission?.priority || "medium",
    },
  });

  const watchedReward = watch("reward");

  const onSubmit = async (data: CreateMissionFormData) => {
    try {
      setIsSubmitting(true);

      // Convert deadline to ISO string
      const deadlineISO = new Date(data.deadline + "T23:59:59Z").toISOString();

      const missionData = {
        ...data,
        deadline: deadlineISO,
      };

      if (isEditing && mission) {
        await apiService.updateMission(mission.id, missionData);
        toast({
          type: "success",
          title: "Misión actualizada",
          message: "La misión ha sido actualizada exitosamente",
        });
      } else {
        await apiService.createMission(missionData);
        toast({
          type: "success",
          title: "Misión creada",
          message: "La nueva misión ha sido creada exitosamente",
        });
      }

      onSuccess();
    } catch {
      toast({
        type: "error",
        title: "Error",
        message: isEditing
          ? "Error al actualizar la misión"
          : "Error al crear la misión",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getPriorityLabel = (priority: string) => {
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
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gold-500/20 p-2 rounded-lg">
              <Target className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                {isEditing ? "Editar Misión" : "Nueva Misión"}
              </h3>
              <p className="text-sm text-orden-400">
                {isEditing
                  ? "Actualizar información de la misión"
                  : "Crear una nueva misión para asignar"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Título de la Misión *
            </label>
            <Input
              {...register("title")}
              placeholder="ej. Operación Silencio"
              error={errors.title?.message}
            />
          </div>

          {/* Target Name */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Nombre del Objetivo *
            </label>
            <Input
              {...register("targetName")}
              placeholder="ej. Viktor Kozlov"
              error={errors.targetName?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Descripción *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-orden-400" />
              <textarea
                {...register("description")}
                rows={4}
                className="w-full pl-10 pr-4 py-3 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 placeholder-orden-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                placeholder="Descripción detallada de la misión, objetivos y consideraciones especiales..."
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Reward and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reward */}
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                Recompensa (Monedas de Oro) *
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-400" />
                <Input
                  {...register("reward", { valueAsNumber: true })}
                  type="number"
                  min="100"
                  step="100"
                  className="pl-10"
                  placeholder="1000"
                  error={errors.reward?.message}
                />
              </div>
              {watchedReward && (
                <p className="mt-1 text-xs text-gold-400">
                  Recompensa:{" "}
                  {new Intl.NumberFormat("es-ES").format(watchedReward)} monedas
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                Prioridad
              </label>
              <select
                {...register("priority")}
                className="w-full px-4 py-3 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Fecha Límite *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orden-400" />
              <Input
                {...register("deadline")}
                type="date"
                className="pl-10"
                min={new Date().toISOString().split("T")[0]}
                error={errors.deadline?.message}
              />
            </div>
          </div>

          {/* Mission Preview */}
          {watchedReward && (
            <div className="bg-orden-900/50 rounded-lg p-4 border border-orden-700">
              <h4 className="text-sm font-medium text-orden-200 mb-2">
                Vista Previa
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orden-400">Recompensa:</span>
                  <span className="text-gold-400 font-medium">
                    {new Intl.NumberFormat("es-ES").format(watchedReward)}{" "}
                    monedas
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orden-400">Prioridad:</span>
                  <span
                    className={`font-medium ${getPriorityColor(
                      watch("priority")
                    )}`}
                  >
                    {getPriorityLabel(watch("priority"))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orden-400">Estado inicial:</span>
                  <span className="text-gray-400">No Asignada</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
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
              className="flex-1 bg-gold-600 hover:bg-gold-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isEditing ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {isEditing ? "Actualizar Misión" : "Crear Misión"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
