import React from "react";
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Skull,
  Mail,
  XCircle,
} from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils";
import {
  getStatusColorForCard,
  getStatusIcon,
  getMarkerRole,
  canPayMarker,
  canConfirmPayment,
  canRespondToRequest,
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
  onAcceptRequest,
}: // onRejectRequest, // Not used directly - handled through modal
BloodMarkerCardProps) {
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
  const showRequestActions = canRespondToRequest(marker, currentUserId);

  const handleAcceptRequest = () => {
    if (onAcceptRequest) {
      onAcceptRequest(marker.id);
    }
  };

  const handleRejectRequest = () => {
    // For quick reject without reason - open modal instead
    onViewDetails(marker);
  };

  return (
    <div className="card p-6 hover:border-red-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${roleInfo.bgColor}`}>
              {marker.status === "Solicitud Pendiente" ? (
                <Mail className={`h-5 w-5 text-blue-400`} />
              ) : isCreditor ? (
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          {showRequestActions && (
            <>
              <Button
                size="sm"
                onClick={handleAcceptRequest}
                className="bg-green-600 hover:bg-green-700 text-xs"
                aria-label="Aceptar solicitud"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRejectRequest}
                className="text-red-400 hover:text-red-300 text-xs"
                aria-label="Rechazar solicitud"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Rechazar
              </Button>
            </>
          )}

          {showPayButton && (
            <Button
              size="sm"
              onClick={() => onPayMarker(marker.id)}
              className="bg-red-600 hover:bg-red-700 text-xs"
              aria-label="Pagar marcador"
            >
              <Skull className="h-3 w-3 mr-1" />
              Pagar
            </Button>
          )}

          {showConfirmButton && (
            <Button
              size="sm"
              onClick={() => onConfirmPayment(marker.id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-xs"
              aria-label="Confirmar pago"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmar
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(marker)}
            className="text-orden-300 hover:text-orden-100 text-xs"
            aria-label="Ver detalles"
          >
            Ver detalles
          </Button>
        </div>
      </div>
    </div>
  );
});
