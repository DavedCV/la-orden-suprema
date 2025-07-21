import React, { useState } from "react";
import {
  X,
  Edit,
  Save,
  Trash2,
  Calendar,
  MapPin,
  Mail,
  User,
  Award,
  Target,
  Coins,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { getStatusColor, getStatusIcon } from "../utils";
import { useAssassinForm } from "../hooks/useAssassinForm";
import type { Assassin } from "../../../shared/types";
import { SkillsEditor } from "./SkillsEditor";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface AssassinDetailsModalProps {
  assassin: Assassin;
  onClose: () => void;
  onUpdate: () => void;
  onDelete?: (assassinId: string) => void;
}

export const AssassinDetailsModal: React.FC<AssassinDetailsModalProps> = ({
  assassin,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    form,
    skills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    resetForm,
    onSubmit,
    isUpdating,
  } = useAssassinForm(assassin, () => {
    setIsEditing(false);
    onUpdate();
  });

  const StatusIcon = getStatusIcon(assassin.status);

  const handleCancel = () => {
    setIsEditing(false);
    resetForm();
  };

  const handleDelete = () => {
    onDelete?.(assassin.id);
    onClose();
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
                  <StatusIcon className="h-4 w-4" />
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
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSubmit}
                    disabled={isUpdating}
                    className="bg-gold-500 hover:bg-gold-600 text-orden-900"
                  >
                    {isUpdating ? (
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
                          {...form.register("alias")}
                          error={form.formState.errors.alias?.message}
                          placeholder="Ingresa el alias"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Nombre Real *
                        </label>
                        <Input
                          {...form.register("realName")}
                          error={form.formState.errors.realName?.message}
                          placeholder="Ingresa el nombre real"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Email *
                        </label>
                        <Input
                          {...form.register("email")}
                          type="email"
                          error={form.formState.errors.email?.message}
                          placeholder="Ingresa el email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Última Ubicación Conocida
                        </label>
                        <Input
                          {...form.register("lastKnownLocation")}
                          error={
                            form.formState.errors.lastKnownLocation?.message
                          }
                          placeholder="ej. Nueva York, Continental Hotel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orden-200 mb-2">
                          Monedas de Oro *
                        </label>
                        <Input
                          {...form.register("goldCoins", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="0"
                          max="1000000"
                          error={form.formState.errors.goldCoins?.message}
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

                  <SkillsEditor
                    skills={skills}
                    newSkill={newSkill}
                    setNewSkill={setNewSkill}
                    addSkill={addSkill}
                    removeSkill={removeSkill}
                    isEditing={isEditing}
                    maxSkills={10}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          assassinName={assassin.alias}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
};
