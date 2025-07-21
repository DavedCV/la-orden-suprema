import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Plus,
  Search,
  Edit,
  Shield,
  ShieldOff,
  UserX,
  Eye,
  Coins,
  Target,
  X,
  Save,
  Calendar,
  MapPin,
  Mail,
  User,
  Award,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { toast } from "../../../shared/utils/toast";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type { Assassin, AsassinStatus } from "../../../shared/types";
import { CreateAssassinForm } from "./CreateAssassinForm";

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

export function AssassinManagementPage() {
  const { goToDashboard } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AsassinStatus | "Todos">(
    "Todos"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssassin, setSelectedAssassin] = useState<Assassin | null>(
    null
  );

  // Fetch assassins data
  const {
    data: assassinsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["assassins", { search: searchTerm, status: statusFilter }],
    queryFn: () => apiService.getAssassins(1, 50),
  });

  const assassins = assassinsData?.data || [];

  // Filter assassins based on search and status
  const filteredAssassins = assassins.filter((assassin) => {
    const matchesSearch =
      assassin.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assassin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assassin.realName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesStatus =
      statusFilter === "Todos" || assassin.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    assassinId: string,
    newStatus: AsassinStatus
  ) => {
    try {
      await apiService.updateAssassinStatus(assassinId, newStatus);
      toast({
        type: "success",
        title: "Estado actualizado",
        message: "El estado del asesino ha sido actualizado correctamente",
      });
      refetch();
    } catch {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el estado del asesino",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando asesinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <div className="bg-orden-800 border-b border-orden-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToDashboard}
                className="text-orden-400 hover:text-orden-200"
              >
                ← Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-orden-100 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-gold-400" />
                  Gestión de Asesinos
                </h1>
                <p className="text-orden-300 mt-1">
                  Administra los miembros de La Orden Suprema
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gold-500 hover:bg-gold-600 text-orden-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Asesino
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-orden-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por alias, email o nombre real..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                className="w-full bg-orden-700 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Retirado">Retirado</option>
                <option value="Excommunicado">Excommunicado</option>
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-orden-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {assassins.filter((a) => a.status === "Activo").length}
              </div>
              <div className="text-sm text-orden-400">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {assassins.filter((a) => a.status === "Retirado").length}
              </div>
              <div className="text-sm text-orden-400">Retirados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {assassins.filter((a) => a.status === "Excommunicado").length}
              </div>
              <div className="text-sm text-orden-400">Excommunicados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orden-200">
                {assassins.length}
              </div>
              <div className="text-sm text-orden-400">Total</div>
            </div>
          </div>
        </div>

        {/* Assassins List */}
        <div className="space-y-4">
          {filteredAssassins.map((assassin) => (
            <AssassinCard
              key={assassin.id}
              assassin={assassin}
              onStatusChange={handleStatusChange}
              onViewDetails={(assassin) => setSelectedAssassin(assassin)}
            />
          ))}

          {filteredAssassins.length === 0 && (
            <div className="bg-orden-800 rounded-lg p-12 text-center">
              <Users className="h-16 w-16 text-orden-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-orden-300 mb-2">
                No se encontraron asesinos
              </h3>
              <p className="text-orden-500">
                {searchTerm || statusFilter !== "Todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay asesinos registrados en el sistema"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Assassin Modal */}
      {showCreateModal && (
        <CreateAssassinForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      {/* Assassin Details Modal */}
      {selectedAssassin && (
        <AssassinDetailsModal
          assassin={selectedAssassin}
          onClose={() => setSelectedAssassin(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}

// Assassin Card Component
interface AssassinCardProps {
  assassin: Assassin;
  onStatusChange: (id: string, status: AsassinStatus) => void;
  onViewDetails: (assassin: Assassin) => void;
}

function AssassinCard({
  assassin,
  onStatusChange,
  onViewDetails,
}: AssassinCardProps) {
  const getStatusColor = (status: AsassinStatus) => {
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
  };

  const getStatusIcon = (status: AsassinStatus) => {
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
  };

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700 hover:border-orden-600 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-gold-400 font-bold text-lg">
              {assassin.alias.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-semibold text-orden-100">
              {assassin.alias}
            </h3>
            <p className="text-orden-400 text-sm">{assassin.email}</p>
            {assassin.realName && (
              <p className="text-orden-500 text-sm">({assassin.realName})</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats */}
          <div className="text-right space-y-1">
            <div className="flex items-center text-sm text-orden-300">
              <Coins className="h-4 w-4 mr-1 text-gold-400" />
              {formatCurrency(assassin.goldCoins)}
            </div>
            <div className="flex items-center text-sm text-orden-300">
              <Target className="h-4 w-4 mr-1" />
              {assassin.completedMissions} misiones
            </div>
          </div>

          {/* Status */}
          <div
            className={`px-3 py-1 rounded-lg border text-sm font-medium flex items-center ${getStatusColor(
              assassin.status
            )}`}
          >
            {getStatusIcon(assassin.status)}
            <span className="ml-1">{assassin.status}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails(assassin)}
              className="text-orden-400 hover:text-orden-200"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {assassin.status === "Activo" && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(assassin.id, "Retirado")}
                  className="text-yellow-400 hover:text-yellow-300"
                  title="Marcar como Retirado"
                >
                  <ShieldOff className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange(assassin.id, "Excommunicado")}
                  className="text-red-400 hover:text-red-300"
                  title="Excommunicar"
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </>
            )}

            {assassin.status !== "Activo" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStatusChange(assassin.id, "Activo")}
                className="text-green-400 hover:text-green-300"
                title="Reactivar"
              >
                <Shield className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {assassin.skills && assassin.skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-orden-700">
          <div className="flex flex-wrap gap-2">
            {assassin.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orden-700 text-orden-300 text-xs rounded-md border border-orden-600"
              >
                {skill}
              </span>
            ))}
            {assassin.skills.length > 5 && (
              <span className="px-2 py-1 bg-orden-700/50 text-orden-400 text-xs rounded-md border border-orden-600">
                +{assassin.skills.length - 5} más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Complete Assassin Details Modal
function AssassinDetailsModal({
  assassin,
  onClose,
  onUpdate,
}: {
  assassin: Assassin;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(assassin.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  // Edit form
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditAssassinFormData & { skills: string[] }) => {
      // Mock update - in real app would call API with data
      console.log("Mock update for:", data.alias); // Remove in production
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Asesino actualizado",
        message: "La información ha sido actualizada correctamente",
      });
      setIsEditing(false);
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["assassins"] });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar la información del asesino",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Mock delete - in real app would call API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Asesino eliminado",
        message: "El asesino ha sido eliminado del sistema",
      });
      onClose();
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["assassins"] });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo eliminar el asesino",
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

  const getStatusColor = (status: AsassinStatus) => {
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
  };

  const getStatusIcon = (status: AsassinStatus) => {
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
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-orden-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
                <span className="text-gold-400 font-bold text-lg">
                  {assassin.alias.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-orden-100">
                  {assassin.alias}
                </h2>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-lg border text-sm font-medium mt-1 ${getStatusColor(
                    assassin.status
                  )}`}
                >
                  {getStatusIcon(assassin.status)}
                  <span className="ml-1">{assassin.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    disabled={updateMutation.isPending}
                    className="bg-gold-500 hover:bg-gold-600 text-orden-900"
                  >
                    {updateMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-orden-400 hover:text-orden-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Card */}
              <div className="lg:col-span-1">
                <div className="bg-orden-900/50 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-orden-100 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-gold-400" />
                    Estadísticas
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-orden-400 flex items-center">
                        <Coins className="h-4 w-4 mr-2 text-gold-400" />
                        Monedas de Oro
                      </span>
                      <span className="font-bold text-gold-400">
                        {formatCurrency(assassin.goldCoins)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-orden-400 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Misiones Completadas
                      </span>
                      <span className="font-bold text-orden-200">
                        {assassin.completedMissions}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-orden-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Miembro desde
                      </span>
                      <span className="text-orden-200">
                        {formatDate(assassin.joinDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-orden-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gold-400" />
                    Información Personal
                  </h3>

                  {!isEditing ? (
                    <div className="space-y-3">
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
                    </div>
                  ) : (
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Alias *
                        </label>
                        <Input
                          {...register("alias")}
                          error={errors.alias?.message}
                          placeholder="Ingresa el alias"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Nombre Real *
                        </label>
                        <Input
                          {...register("realName")}
                          error={errors.realName?.message}
                          placeholder="Ingresa el nombre real"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Email *
                        </label>
                        <Input
                          {...register("email")}
                          type="email"
                          error={errors.email?.message}
                          placeholder="Ingresa el email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Última Ubicación Conocida
                        </label>
                        <Input
                          {...register("lastKnownLocation")}
                          error={errors.lastKnownLocation?.message}
                          placeholder="ej. Nueva York, Continental Hotel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Monedas de Oro *
                        </label>
                        <Input
                          {...register("goldCoins", { valueAsNumber: true })}
                          type="number"
                          min="0"
                          max="1000000"
                          error={errors.goldCoins?.message}
                          placeholder="1000"
                        />
                      </div>
                    </form>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-orden-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gold-400" />
                    Habilidades Especializadas
                  </h3>

                  {!isEditing ? (
                    <div>
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
                            e.key === "Enter" &&
                            (e.preventDefault(), addSkill())
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
                          Agregar
                        </Button>
                      </div>

                      {/* Skills List */}
                      {skills.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-orden-300">
                            Habilidades ({skills.length}/10):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-orden-700 text-orden-200 px-3 py-1 rounded-md text-sm border border-orden-600"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 text-orden-400 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-60 p-4">
          <div className="bg-orden-800 rounded-lg w-full max-w-md border border-red-500/20">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orden-100">
                    Eliminar Asesino
                  </h3>
                  <p className="text-orden-400 text-sm">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="text-orden-300 mb-6">
                ¿Estás seguro de que quieres eliminar a{" "}
                <strong>{assassin.alias}</strong> del sistema? Toda su
                información y historial se perderá permanentemente.
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
