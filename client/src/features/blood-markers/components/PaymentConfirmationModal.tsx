import React, { useState } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { formatDate } from "../../../shared/utils";
import type { BloodMarker } from "../../../shared/types";

interface PaymentConfirmationModalProps {
  marker: BloodMarker;
  otherPartyName: string;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const PaymentConfirmationModal = React.memo(
  function PaymentConfirmationModal({
    marker,
    otherPartyName,
    onClose,
    onConfirm,
    isProcessing,
  }: PaymentConfirmationModalProps) {
    const [hasReadWarning, setHasReadWarning] = useState(false);

    const handleConfirm = () => {
      if (!hasReadWarning) {
        setHasReadWarning(true);
        return;
      }
      onConfirm();
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-3">
              <div
                className="bg-yellow-500/20 p-2 rounded-lg"
                aria-hidden="true"
              >
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h3
                  id="payment-modal-title"
                  className="text-lg font-semibold text-orden-100"
                >
                  Confirmar Pago de Deuda
                </h3>
                <p className="text-sm text-orden-400">
                  Marcar como pagada a {otherPartyName}
                </p>
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
            {/* Detalles de la deuda */}
            <div>
              <h4 className="text-sm font-medium text-orden-200 mb-2">
                Descripción de la deuda:
              </h4>
              <div className="bg-orden-700/50 rounded-lg p-3">
                <p className="text-orden-100 text-sm leading-relaxed">
                  {marker.description}
                </p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-orden-400 space-y-1">
              <p>Fecha de creación: {formatDate(marker.createdAt)}</p>
              <p>Acreedor: {otherPartyName}</p>
              <p>ID del marcador: {marker.id}</p>
            </div>

            {/* Advertencia importante */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle
                  className="h-5 w-5 text-yellow-400 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">
                    ⚠️ Proceso de Saldo de Deuda
                  </h4>
                  <div className="text-xs text-orden-300 space-y-2">
                    <p>
                      Al confirmar, estarás indicando que HAS SALDADO esta deuda
                      con {otherPartyName}.
                    </p>
                    <p>
                      El marcador pasará a estado{" "}
                      <strong>"Pago Pendiente de Confirmación"</strong> hasta
                      que
                      {otherPartyName} confirme que ha recibido el favor/pago.
                    </p>
                    <p>
                      Solo marca como pagado si ya has cumplido con tu
                      obligación.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox de confirmación */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="confirm-payment"
                checked={hasReadWarning}
                onChange={(e) => setHasReadWarning(e.target.checked)}
                className="mt-1 h-4 w-4 text-yellow-600 bg-orden-700 border-orden-600 rounded focus:ring-yellow-500 focus:ring-2"
                disabled={isProcessing}
              />
              <label
                htmlFor="confirm-payment"
                className="text-sm text-orden-200"
              >
                Confirmo que he leído la información anterior y que he saldado
                mi deuda con {otherPartyName}.
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                disabled={isProcessing || !hasReadWarning}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Confirmar Pago
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
