import React from "react";
import {
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Skull,
  User,
  X,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils";
import {
  getStatusInfo,
  getMarkerRole,
  canPayMarker,
  canConfirmPayment,
} from "../utils/statusUtils";
import type { BloodMarkerDetailsModalProps } from "../types";

export const BloodMarkerDetailsModal = React.memo(
  function BloodMarkerDetailsModal({
    marker,
    otherPartyName,
    currentUserId,
    onClose,
    onPayMarker,
    onConfirmPayment,
  }: BloodMarkerDetailsModalProps) {
    const { isCreditor, isDebtor } = getMarkerRole(marker, currentUserId);
    const statusInfo = getStatusInfo(marker.status);
    const StatusIcon = statusInfo.icon;
    const showPayButton = canPayMarker(marker, currentUserId);
    const showConfirmButton = canConfirmPayment(marker, currentUserId);

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
      >
        <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500/20 p-2 rounded-lg" aria-hidden="true">
                <Skull className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3
                  id="details-modal-title"
                  className="text-lg font-semibold text-orden-100"
                >
                  Detalles del Marcador
                </h3>
                <p className="text-sm text-orden-400">
                  Información completa de la deuda
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

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="text-center">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color} ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                role="status"
                aria-label={`Estado del marcador: ${marker.status}`}
              >
                <StatusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                {marker.status}
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div
                  className="bg-red-500/20 p-3 rounded-lg inline-flex mb-2"
                  aria-hidden="true"
                >
                  <User className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-sm font-medium text-orden-200">Deudor</h4>
                <p
                  className="text-orden-100"
                  aria-label={`Deudor: ${isDebtor ? "Tú" : otherPartyName}`}
                >
                  {isDebtor ? "Tú" : otherPartyName}
                </p>
              </div>

              <div className="text-center">
                <div
                  className="bg-gold-500/20 p-3 rounded-lg inline-flex mb-2"
                  aria-hidden="true"
                >
                  <DollarSign className="h-6 w-6 text-gold-400" />
                </div>
                <h4 className="text-sm font-medium text-orden-200">Acreedor</h4>
                <p
                  className="text-orden-100"
                  aria-label={`Acreedor: ${isCreditor ? "Tú" : otherPartyName}`}
                >
                  {isCreditor ? "Tú" : otherPartyName}
                </p>
              </div>
            </div>

            {/* Description */}
            <section aria-labelledby="description-heading">
              <h4
                id="description-heading"
                className="text-sm font-medium text-orden-200 mb-2"
              >
                Descripción del favor
              </h4>
              <div className="bg-orden-900/50 rounded-lg p-4 border border-orden-700">
                <p className="text-orden-100 leading-relaxed">
                  {marker.description}
                </p>
              </div>
            </section>

            {/* Timeline */}
            <section aria-labelledby="timeline-heading">
              <h4
                id="timeline-heading"
                className="text-sm font-medium text-orden-200 mb-3"
              >
                Historial
              </h4>
              <div
                className="space-y-3"
                role="list"
                aria-label="Historial del marcador"
              >
                <div className="flex items-center space-x-3" role="listitem">
                  <div
                    className="bg-blue-500/20 p-2 rounded-full"
                    aria-hidden="true"
                  >
                    <FileText className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orden-200">Marcador creado</p>
                    <p className="text-xs text-orden-400">
                      <time dateTime={marker.createdAt}>
                        {formatDate(marker.createdAt)}
                      </time>
                    </p>
                  </div>
                </div>

                {marker.paidAt && (
                  <div className="flex items-center space-x-3" role="listitem">
                    <div
                      className="bg-yellow-500/20 p-2 rounded-full"
                      aria-hidden="true"
                    >
                      <Clock className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-orden-200">
                        Marcado como pagado
                      </p>
                      <p className="text-xs text-orden-400">
                        <time dateTime={marker.paidAt}>
                          {formatDate(marker.paidAt)}
                        </time>
                      </p>
                    </div>
                  </div>
                )}

                {marker.status === "Saldado" && (
                  <div className="flex items-center space-x-3" role="listitem">
                    <div
                      className="bg-green-500/20 p-2 rounded-full"
                      aria-hidden="true"
                    >
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-orden-200">
                        Pago confirmado - Deuda saldada
                      </p>
                      <p className="text-xs text-orden-400">Marcador cerrado</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-orden-700">
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cerrar
              </Button>

              {showPayButton && (
                <Button
                  onClick={() => onPayMarker(marker.id)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  aria-label="Marcar este marcador como pagado"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Marcar como Saldado
                </Button>
              )}

              {showConfirmButton && (
                <Button
                  onClick={() => onConfirmPayment(marker.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  aria-label="Confirmar que has recibido el pago"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Recepción
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
