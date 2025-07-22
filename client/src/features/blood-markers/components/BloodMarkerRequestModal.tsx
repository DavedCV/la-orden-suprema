import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { formatDate } from "../../../shared/utils";
import { X, Skull, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type {
  BloodMarker,
  RespondToBloodMarkerForm,
} from "../../../shared/types";

interface BloodMarkerRequestModalProps {
  request: BloodMarker;
  requesterName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BloodMarkerRequestModal({
  request,
  requesterName,
  onClose,
  onSuccess,
}: BloodMarkerRequestModalProps) {
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const respondMutation = useMutation({
    mutationFn: (data: RespondToBloodMarkerForm) =>
      apiService.respondToBloodMarkerRequest(data),
    onSuccess: (response) => {
      toast({
        type: "success",
        title: "Respuesta enviada",
        message: response.message || "Tu respuesta ha sido registrada",
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo procesar la respuesta";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  const handleAccept = () => {
    respondMutation.mutate({
      markerId: request.id,
      accepted: true,
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        type: "error",
        title: "Razón requerida",
        message: "Debes proporcionar una razón para rechazar la solicitud",
      });
      return;
    }

    respondMutation.mutate({
      markerId: request.id,
      accepted: false,
      rejectionReason: rejectionReason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500/20 p-2 rounded-full">
              <Skull className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-orden-100">
                Solicitud de Blood Marker
              </h2>
              <p className="text-sm text-orden-400">De: {requesterName}</p>
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

        <div className="p-6 space-y-6">
          {/* Request Details */}
          <div>
            <h3 className="text-sm font-medium text-orden-300 mb-3">
              Detalles de la solicitud
            </h3>
            <div className="bg-orden-900 rounded-lg p-4 border border-orden-600">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-orden-400 mb-1">Solicitante</p>
                  <p className="text-orden-200 font-medium">{requesterName}</p>
                </div>
                <div>
                  <p className="text-xs text-orden-400 mb-1">
                    Fecha de solicitud
                  </p>
                  <p className="text-orden-200">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-orden-400 mb-1">
                    Descripción del favor
                  </p>
                  <p className="text-orden-200 leading-relaxed">
                    {request.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-400">
                  ¿Qué significa esto?
                </p>
                <p className="text-xs text-orden-300 mt-1">
                  <strong>{requesterName}</strong> está solicitando contraer una
                  deuda contigo. Si aceptas, tendrán la obligación de devolverte
                  un favor equivalente en el futuro. Esta es una relación seria
                  dentro del código de la orden.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isRejecting ? (
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={respondMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {respondMutation.isPending
                  ? "Procesando..."
                  : "Aceptar Solicitud"}
              </Button>

              <Button
                onClick={() => setIsRejecting(true)}
                variant="secondary"
                disabled={respondMutation.isPending}
                className="w-full border-red-500/30 hover:bg-red-500/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar Solicitud
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full"
                disabled={respondMutation.isPending}
              >
                Decidir más tarde
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orden-300 mb-2">
                  Razón del rechazo *
                </label>
                <p className="text-xs text-orden-500 mb-2">
                  Explica por qué no puedes aceptar esta solicitud
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: No puedo comprometer favores en este momento debido a otras obligaciones..."
                  rows={3}
                  className="w-full px-3 py-2 bg-orden-900 border border-orden-600 rounded-md text-orden-200 placeholder-orden-500 focus:border-gold-500 focus:outline-none resize-none"
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-orden-500">Mínimo 10 caracteres</p>
                  <p className="text-xs text-orden-500">
                    {rejectionReason.length}/200
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setIsRejecting(false);
                    setRejectionReason("");
                  }}
                  variant="ghost"
                  className="flex-1"
                  disabled={respondMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={
                    respondMutation.isPending ||
                    !rejectionReason.trim() ||
                    rejectionReason.length < 10
                  }
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {respondMutation.isPending
                    ? "Procesando..."
                    : "Confirmar Rechazo"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
