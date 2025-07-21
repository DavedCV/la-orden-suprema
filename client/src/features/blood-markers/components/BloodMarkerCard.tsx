import React from "react";
import { Calendar, CheckCircle, DollarSign, Skull } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils";
import {
  getStatusColorForCard,
  getStatusIcon,
  getMarkerRole,
  canPayMarker,
  canConfirmPayment,
  getMarkerDescription,
  getRoleDisplayInfo,
} from "../utils/statusUtils";
import type { BloodMarkerCardProps } from "../types";

export const BloodMarkerCard = React.memo(function BloodMarkerCard({
  marker,
  currentUserId,
  otherPartyName,
  onPayMarker,
  onConfirmPayment,
  onViewDetails,
}: BloodMarkerCardProps) {
  const { isCreditor } = getMarkerRole(marker, currentUserId);
  const StatusIcon = getStatusIcon(marker.status);
  const roleInfo = getRoleDisplayInfo(isCreditor);
  const description = getMarkerDescription(
    marker,
    currentUserId,
    otherPartyName
  );

  const statusClasses = getStatusColorForCard(marker.status, isCreditor);
  const showPayButton = canPayMarker(marker, currentUserId);
  const showConfirmButton = canConfirmPayment(marker, currentUserId);

  return (
    <div className="card p-6 hover:border-red-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${roleInfo.bgColor}`}>
              {isCreditor ? (
                <DollarSign className={`h-5 w-5 ${roleInfo.iconColor}`} />
              ) : (
                <Skull className={`h-5 w-5 ${roleInfo.iconColor}`} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-orden-100">{description}</h3>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses}`}
                >
                  <div className="flex items-center space-x-1">
                    <StatusIcon className="h-3 w-3" />
                    <span>{marker.status}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-orden-300 mb-2 line-clamp-2">
                {marker.description}
              </p>

              <div className="flex items-center text-xs text-orden-400 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(marker.createdAt)}
                </div>
                {marker.paidAt && (
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pagado {formatDate(marker.paidAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(marker)}
            aria-label={`Ver detalles del marcador con ${otherPartyName}`}
          >
            Ver detalles
          </Button>

          {showPayButton && (
            <Button
              size="sm"
              onClick={() => onPayMarker(marker.id)}
              className="bg-yellow-600 hover:bg-yellow-700"
              aria-label="Marcar como pagado"
            >
              Marcar como pagado
            </Button>
          )}

          {showConfirmButton && (
            <Button
              size="sm"
              onClick={() => onConfirmPayment(marker.id)}
              className="bg-green-600 hover:bg-green-700"
              aria-label="Confirmar pago recibido"
            >
              Confirmar pago
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
