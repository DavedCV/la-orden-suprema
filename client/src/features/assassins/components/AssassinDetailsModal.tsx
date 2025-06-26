import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  Save,
  User,
  Mail,
  MapPin,
  Calendar,
  Coins,
  Target,
  Plus,
  Trash2,
  Shield,
  ShieldOff,
  UserX,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { toast } from "../../../shared/utils/toast";
import type { Assassin, AsassinStatus } from "../../../shared/types";

// Schema for editing assassin
const editAssassinSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias debe tener al menos 2 caracteres")
    .max(50, "El alias no puede exceder 50 caracteres"),
  realName: z
    .string()
    .min(2, "El nombre real debe tener al menos 2 caracteres")
    .max(100, "El nombre real no puede exceder 100 caracteres"),
  email: z
    .string()
    .email("Formato de email inválido")
    .min(1, "El email es requerido"),
  lastKnownLocation: z
    .string()
    .max(100, "La ubicación no puede exceder 100 caracteres")
    .optional(),
  goldCoins: z
    .number()
    .min(0, "Las monedas de oro no pueden ser negativas")
    .max(1000000, "Cantidad máxima excedida"),
});

type EditAssassinFormData = z.infer<typeof editAssassinSchema>;

interface AssassinDetailsModalProps {
  assassin: Assassin;
  onClose: () => void;
  onUpdate: () => void;
}

function getStatusColor(status: AsassinStatus) {
  switch (status) {
    case "Activo":
      return "text-green-400 bg-green-400/10 border-green-400/20";
    case "Retirado":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "Excommunicado":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-orden-400 bg-orden-400/10 border-orden-400/20";
  }
}

function getStatusIcon(status: AsassinStatus) {
  switch (status) {
    case "Activo":
      return <Shield className="h-4 w-4" />;
    case "Retirado":
      return <ShieldOff className="h-4 w-4" />;
    case "Excommunicado":
      return <UserX className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

export function AssassinDetailsModal({
  assassin,
  onClose,
  onUpdate,
}: AssassinDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(assassin.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditAssassinFormData>({
    resolver: zodResolver(editAssassinSchema),
    defaultValues: {
      alias: assassin.alias,
      realName: assassin.realName || "",
      email: assassin.email,
      lastKnownLocation: assassin.lastKnownLocation || "",
      goldCoins: assassin.goldCoins,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditAssassinFormData & { skills: string[] }) =>
      apiService.updateProfile(data),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Asesino actualizado",
        message: "La información ha sido actualizada correctamente",
      });
      setIsEditing(false);
      onUpdate();
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el asesino",
      });
    },
  });

  const onSubmit = (formData: EditAssassinFormData) => {
    updateMutation.mutate({ ...formData, skills });
  };

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !skills.includes(newSkill.trim()) &&
      skills.length < 10
    ) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
    setSkills(assassin.skills || []);
    setNewSkill("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gold-500/20 p-2 rounded-lg">
              <User className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orden-100">
                {assassin.alias}
              </h3>
              <div
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  assassin.status
                )}`}
              >
                {getStatusIcon(assassin.status)}
                <span>{assassin.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit(onSubmit)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-orden-100 mb-4">
                  Información Personal
                </h4>
                <div className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-orden-400 mb-1">
                          Alias
                        </label>
                        <p className="text-orden-100">{assassin.alias}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orden-400 mb-1">
                          Nombre Real
                        </label>
                        <p className="text-orden-100">
                          {assassin.realName || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orden-400 mb-1">
                          Email
                        </label>
                        <p className="text-orden-100 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-orden-400" />
                          {assassin.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orden-400 mb-1">
                          Última Ubicación Conocida
                        </label>
                        <p className="text-orden-100 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-orden-400" />
                          {assassin.lastKnownLocation || "No especificada"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <form className="space-y-4">
                      <Input
                        {...register("alias")}
                        label="Alias"
                        error={errors.alias?.message}
                      />
                      <Input
                        {...register("realName")}
                        label="Nombre Real"
                        error={errors.realName?.message}
                      />
                      <Input
                        {...register("email")}
                        label="Email"
                        type="email"
                        error={errors.email?.message}
                      />
                      <Input
                        {...register("lastKnownLocation")}
                        label="Última Ubicación Conocida"
                        error={errors.lastKnownLocation?.message}
                      />
                      <Input
                        {...register("goldCoins", { valueAsNumber: true })}
                        label="Monedas de Oro"
                        type="number"
                        error={errors.goldCoins?.message}
                      />
                    </form>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div>
                <h4 className="text-lg font-medium text-orden-100 mb-4">
                  Información del Sistema
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      ID del Sistema
                    </label>
                    <p className="text-orden-100 font-mono text-sm">
                      {assassin.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orden-400 mb-1">
                      Fecha de Registro
                    </label>
                    <p className="text-orden-100 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-orden-400" />
                      {formatDate(assassin.joinDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and Skills */}
            <div className="space-y-6">
              {/* Statistics */}
              <div>
                <h4 className="text-lg font-medium text-orden-100 mb-4">
                  Estadísticas
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orden-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Coins className="h-5 w-5 text-gold-400 mr-2" />
                        <span className="text-sm text-orden-400">
                          Monedas de Oro
                        </span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gold-400 mt-1">
                      {formatCurrency(assassin.goldCoins)}
                    </p>
                  </div>
                  <div className="bg-orden-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-sm text-orden-400">
                          Misiones Completadas
                        </span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-400 mt-1">
                      {assassin.completedMissions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-medium text-orden-100 mb-4">
                  Habilidades Especializadas
                </h4>
                {!isEditing ? (
                  <div className="space-y-2">
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orden-700 text-orden-200 text-sm rounded-md border border-orden-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-orden-500 italic">
                        No se han especificado habilidades
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Add Skill */}
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Agregar nueva habilidad"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        disabled={!newSkill.trim() || skills.length >= 10}
                        size="sm"
                        variant="secondary"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Skills List */}
                    {skills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-orden-300">
                          Habilidades ({skills.length}/10):
                        </p>
                        <div className="space-y-2">
                          {skills.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-orden-700 text-orden-200 px-3 py-2 rounded-md text-sm border border-orden-600"
                            >
                              <span>{skill}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(skill)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
