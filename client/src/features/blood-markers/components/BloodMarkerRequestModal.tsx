import React, { useState } from "react";
import { CheckCircle, Mail, X, XCircle } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { formatDate } from "../../../shared/utils";
import type { BloodMarker } from "../../../shared/types";

interface BloodMarkerRequestModalProps {
  marker: BloodMarker;
  otherPartyName: string;
  onClose: () => void;
  onAccept: (markerId: string) => void;
  onReject: (markerId: string, reason: string) => void;
  isProcessing: boolean;
}

export const BloodMarkerRequestModal = React.memo(
  function BloodMarkerRequestModal({
    marker,
    otherPartyName,
    onClose,
    onAccept,
    onReject,
    isProcessing,
  }: BloodMarkerRequestModalProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleAccept = () => {
      onAccept(marker.id);
    };

    const handleReject = () => {
      if (!rejectionReason.trim()) {
        setIsRejecting(true);
        return;
      }
      onReject(marker.id, rejectionReason.trim());
    };

    const handleStartReject = () => {
      setIsRejecting(true);
    };

    const handleCancelReject = () => {
      setIsRejecting(false);
      setRejectionReason("");
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
      >
        <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg" aria-hidden="true">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3
                  id="request-modal-title"
                  className="text-lg font-semibold text-orden-100"
                >
                  Solicitud de Marcador de Sangre
                </h3>
                <p className="text-sm text-orden-400">De: {otherPartyName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Cerrar modal"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            {/* Descripción */}
            <div>
              <h4 className="text-sm font-medium text-orden-200 mb-2">
                Descripción del favor:
              </h4>
              <div className="bg-orden-700/50 rounded-lg p-3">
                <p className="text-orden-100 text-sm leading-relaxed">
                  {marker.description}
                </p>
              </div>
            </div>

            {/* Detalles */}
            <div className="text-xs text-orden-400 space-y-1">
              <p>Fecha de solicitud: {formatDate(marker.createdAt)}</p>
              <p>ID: {marker.id}</p>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Mail
                  className="h-4 w-4 text-blue-400 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">
                    Solicitud de confirmación
                  </h4>
                  <p className="text-xs text-orden-300">
                    {otherPartyName} está solicitando que confirmes este favor.
                    Solo acepta si realmente proporcionaste la asistencia
                    descrita.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de rechazo */}
            {isRejecting && (
              <div className="space-y-3">
                <label
                  htmlFor="rejection-reason"
                  className="block text-sm font-medium text-orden-200"
                >
                  Razón del rechazo (opcional):
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-orden-700 border border-orden-600 rounded-lg text-orden-100 placeholder-orden-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Especifica por qué no reconoces este favor..."
                  maxLength={200}
                />
                <p className="text-xs text-orden-400">Máximo 200 caracteres</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              {!isRejecting ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleStartReject}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Aceptando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleCancelReject}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Rechazando...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirmar Rechazo
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
