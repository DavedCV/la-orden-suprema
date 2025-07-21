import React, { useState } from "react";
import { Shield, Skull, X } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { toast } from "../../../shared/utils/toast";
import type { CreateBloodMarkerModalProps } from "../types";

export const CreateBloodMarkerModal = React.memo(
  function CreateBloodMarkerModal({
    assassins,
    currentUserId,
    onClose,
    onSuccess,
  }: CreateBloodMarkerModalProps) {
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
        // Pass the form data to parent for handling
        onSuccess({
          debtorId: formData.debtorId,
          description: formData.description.trim(),
        });
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

    const handleFormDataChange = (
      field: keyof typeof formData,
      value: string
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Filter out current user from assassins list
    const availableAssassins = assassins.filter(
      (a) => a.id !== currentUserId && a.status === "Activo"
    );

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500/20 p-2 rounded-lg" aria-hidden="true">
                <Skull className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3
                  id="create-modal-title"
                  className="text-lg font-semibold text-orden-100"
                >
                  Solicitar Marcador de Sangre
                </h3>
                <p className="text-sm text-orden-400">
                  Crear solicitud de favor/deuda
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="debtor-select"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                Asesino al que solicitas el favor *
              </label>
              <select
                id="debtor-select"
                value={formData.debtorId}
                onChange={(e) =>
                  handleFormDataChange("debtorId", e.target.value)
                }
                className="w-full px-4 py-3 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                aria-describedby="debtor-help"
              >
                <option value="">Seleccionar asesino...</option>
                {availableAssassins.map((assassin) => (
                  <option key={assassin.id} value={assassin.id}>
                    {assassin.alias} ({assassin.realName})
                  </option>
                ))}
              </select>
              <p id="debtor-help" className="text-xs text-orden-400 mt-1">
                Este asesino recibirá una solicitud para aceptar la deuda
              </p>
            </div>

            <div>
              <label
                htmlFor="description-input"
                className="block text-sm font-medium text-orden-200 mb-2"
              >
                Descripción del favor solicitado *
              </label>
              <textarea
                id="description-input"
                value={formData.description}
                onChange={(e) =>
                  handleFormDataChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 placeholder-orden-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Describe el favor que ya fue proporcionado y por el cual se solicita el marcador..."
                required
                aria-describedby="description-help"
                maxLength={500}
              />
              <p id="description-help" className="text-xs text-orden-400 mt-1">
                Máximo 500 caracteres. Sé específico sobre el favor realizado.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield
                  className="h-5 w-5 text-red-400 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-1">
                    Sistema de consentimiento
                  </h4>
                  <p className="text-xs text-orden-300">
                    Esta solicitud será enviada al asesino seleccionado. Debe
                    aceptarla para que el marcador de sangre sea válido. Solo
                    registra favores ya realizados.
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
                disabled={
                  isSubmitting ||
                  !formData.debtorId ||
                  !formData.description.trim()
                }
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Skull className="h-4 w-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);
