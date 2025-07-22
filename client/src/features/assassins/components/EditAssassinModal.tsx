import { memo, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  User,
  MapPin,
  Coins,
  Shield,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useAssassinForm } from "../hooks/useAssassinForm";
import type { Assassin } from "../../../shared/types";

interface EditAssassinModalProps {
  assassin: Assassin;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAssassinModal = memo(function EditAssassinModal({
  assassin,
  onClose,
  onSuccess,
}: EditAssassinModalProps) {
  const {
    form,
    skills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    resetForm,
    onSubmit,
  } = useAssassinForm(assassin, () => {
    onSuccess();
    onClose();
  });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="edit-modal-title"
      aria-describedby="edit-modal-description"
      aria-modal="true"
    >
      <div className="bg-orden-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <User className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2
                id="edit-modal-title"
                className="text-xl font-bold text-orden-100"
              >
                Editar Asesino
              </h2>
              <p className="text-sm text-orden-400">
                Modificar información de {assassin.alias}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div id="edit-modal-description" className="sr-only">
            Formulario para editar la información del asesino {assassin.alias}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="alias"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                <User className="inline h-4 w-4 mr-1" />
                Alias
              </label>
              <Input
                id="alias"
                {...register("alias")}
                placeholder="Nombre de asesino"
                error={errors.alias?.message}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="realName"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                <User className="inline h-4 w-4 mr-1" />
                Nombre Real
              </label>
              <Input
                id="realName"
                {...register("realName")}
                placeholder="Nombre real completo"
                error={errors.realName?.message}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                <Shield className="inline h-4 w-4 mr-1" />
                Estado
              </label>
              <select
                id="status"
                {...register("status")}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="Activo">Activo</option>
                <option value="Retirado">Retirado</option>
                <option value="Excommunicado">Excommunicado</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="goldCoins"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                <Coins className="inline h-4 w-4 mr-1" />
                Monedas de Oro
              </label>
              <Input
                id="goldCoins"
                type="number"
                {...register("goldCoins", { valueAsNumber: true })}
                placeholder="1000"
                error={errors.goldCoins?.message}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="lastKnownLocation"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                <MapPin className="inline h-4 w-4 mr-1" />
                Última Ubicación Conocida
              </label>
              <Input
                id="lastKnownLocation"
                {...register("lastKnownLocation")}
                placeholder="Ciudad, País"
                error={errors.lastKnownLocation?.message}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Habilidades
            </label>

            {/* Add new skill */}
            <div className="flex gap-2 mb-3">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Nueva habilidad"
                onKeyDown={handleAddSkill}
                disabled={isSubmitting || skills.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addSkill}
                disabled={
                  !newSkill.trim() ||
                  skills.includes(newSkill.trim()) ||
                  skills.length >= 10 ||
                  isSubmitting
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Skills list */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      disabled={isSubmitting}
                      className="hover:text-red-400 transition-colors"
                      aria-label={`Eliminar habilidad ${skill}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {skills.length === 0 && (
              <p className="text-sm text-orden-500 italic">
                No hay habilidades asignadas
              </p>
            )}

            {skills.length >= 10 && (
              <p className="text-sm text-yellow-400 mt-2">
                Máximo 10 habilidades permitidas
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-orden-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});
