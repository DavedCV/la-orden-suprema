import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { X, Skull, Search, User } from "lucide-react";
import type { Assassin, CreateBloodMarkerForm } from "../../../shared/types";

interface CreateBloodMarkerModalProps {
  onClose: () => void;
  onSuccess: () => void;
  assassins: Assassin[];
}

export function CreateBloodMarkerModal({
  onClose,
  onSuccess,
  assassins,
}: CreateBloodMarkerModalProps) {
  const [formData, setFormData] = React.useState<CreateBloodMarkerForm>({
    creditorId: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showAssassinSelect, setShowAssassinSelect] = React.useState(false);

  const createMutation = useMutation({
    mutationFn: (data: CreateBloodMarkerForm) =>
      apiService.createBloodMarker(data),
    onSuccess: (response) => {
      toast({
        type: "success",
        title: "Solicitud enviada",
        message:
          response.message ||
          "Tu solicitud de marcador de sangre ha sido enviada",
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo crear el marcador de sangre";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  const filteredAssassins = React.useMemo(() => {
    if (!searchQuery) return assassins;
    return assassins.filter((assassin) =>
      assassin.alias.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assassins, searchQuery]);

  const selectedAssassin = formData.creditorId
    ? assassins.find((a) => a.id === formData.creditorId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.creditorId || !formData.description.trim()) {
      toast({
        type: "error",
        title: "Campos requeridos",
        message: "Debes seleccionar un acreedor y proporcionar una descripción",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleAssassinSelect = (assassin: Assassin) => {
    setFormData((prev) => ({ ...prev, creditorId: assassin.id }));
    setShowAssassinSelect(false);
    setSearchQuery("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <Skull className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-orden-100">
                Crear Blood Marker
              </h2>
              <p className="text-sm text-orden-400">
                Solicitar contraer una deuda con otro asesino
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-orden-400 hover:text-orden-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Creditor Selection */}
          <div>
            <label className="block text-sm font-medium text-orden-300 mb-2">
              Acreedor *
            </label>
            <p className="text-xs text-orden-500 mb-3">
              Selecciona a quién le quieres deber un favor
            </p>

            {selectedAssassin ? (
              <div className="flex items-center justify-between p-3 bg-orden-900 rounded-lg border border-orden-600">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <User className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-orden-200 font-medium">
                      {selectedAssassin.alias}
                    </p>
                    <p className="text-xs text-orden-400">
                      {selectedAssassin.status} •{" "}
                      {selectedAssassin.completedMissions} misiones
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, creditorId: "" }));
                    setShowAssassinSelect(true);
                  }}
                  className="text-orden-400 hover:text-orden-200"
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAssassinSelect(true)}
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Seleccionar acreedor
                </Button>
              </div>
            )}

            {/* Assassin Selection Dropdown */}
            {showAssassinSelect && (
              <div className="mt-3 border border-orden-600 rounded-lg bg-orden-900">
                <div className="p-3 border-b border-orden-700">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400" />
                    <input
                      type="text"
                      placeholder="Buscar asesino..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-orden-800 border border-orden-600 rounded-md text-orden-200 placeholder-orden-500 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredAssassins.length === 0 ? (
                    <div className="p-4 text-center text-orden-400">
                      No se encontraron asesinos
                    </div>
                  ) : (
                    filteredAssassins.map((assassin) => (
                      <button
                        key={assassin.id}
                        type="button"
                        onClick={() => handleAssassinSelect(assassin)}
                        className="w-full p-3 text-left hover:bg-orden-800 border-b border-orden-700 last:border-b-0 flex items-center space-x-3"
                      >
                        <div className="bg-green-500/20 p-2 rounded-full">
                          <User className="h-3 w-3 text-green-400" />
                        </div>
                        <div>
                          <p className="text-orden-200 font-medium">
                            {assassin.alias}
                          </p>
                          <p className="text-xs text-orden-400">
                            {assassin.status} • {assassin.completedMissions}{" "}
                            misiones
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-orden-700">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssassinSelect(false)}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-orden-300 mb-2">
              Descripción del favor *
            </label>
            <p className="text-xs text-orden-500 mb-2">
              Describe qué favor necesitas y por qué contraerás esta deuda
            </p>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Ej: Necesito apoyo logístico para una misión en el Continental. Te debo un favor equivalente..."
              rows={4}
              className="w-full px-3 py-2 bg-orden-900 border border-orden-600 rounded-md text-orden-200 placeholder-orden-500 focus:border-gold-500 focus:outline-none resize-none"
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-orden-500">
                Mínimo 10 caracteres, máximo 500
              </p>
              <p className="text-xs text-orden-500">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Skull className="h-4 w-4 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400">
                  Importante
                </p>
                <p className="text-xs text-orden-300 mt-1">
                  Estás solicitando <strong>contraer una deuda</strong>. El
                  acreedor debe aceptar tu solicitud antes de que se registre
                  oficialmente el marcador.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={
                createMutation.isPending ||
                !formData.creditorId ||
                !formData.description.trim() ||
                formData.description.length < 10
              }
            >
              {createMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
