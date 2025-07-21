import { Button } from "../../../shared/components/Button";
import {
  Skull,
  Coins,
  CheckCircle,
  ArrowRight,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { formatDate } from "../../../shared/utils";
import type { BloodMarker, Assassin } from "../../../shared/types";

interface BloodMarkersSectionProps {
  bloodMarkers: BloodMarker[];
  assassins: Assassin[];
  onPayMarker: (markerId: string) => void;
  onConfirmPayment: (markerId: string) => void;
  isProcessingPayment: boolean;
  currentUserId: string;
  onNavigate: (path: string) => void;
}

export function BloodMarkersSection({
  bloodMarkers,
  assassins,
  onPayMarker,
  onConfirmPayment,
  isProcessingPayment,
  currentUserId,
  onNavigate,
}: BloodMarkersSectionProps) {
  // Filter markers by user relationship
  const myDebts = bloodMarkers.filter(
    (marker) => marker.debtorId === currentUserId
  );
  const owedToMe = bloodMarkers.filter(
    (marker) => marker.creditorId === currentUserId
  );

  return (
    <>
      {/* Deudas que debo */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-orden-100">Mis Deudas</h3>
          <div className="flex items-center space-x-2">
            <Skull className="h-5 w-5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">
              {myDebts.filter((marker) => marker.status === "Pendiente").length}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {myDebts.slice(0, 3).map((marker) => (
            <BloodMarkerItem
              key={marker.id}
              marker={marker}
              isCreditor={false}
              assassins={assassins}
              onPayMarker={onPayMarker}
              onConfirmPayment={onConfirmPayment}
              isLoading={isProcessingPayment}
            />
          ))}
          {myDebts.length === 0 && (
            <div className="text-center py-6 text-orden-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tienes deudas pendientes</p>
            </div>
          )}
          {myDebts.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("/blood-markers")}
              className="w-full text-red-400 hover:text-red-300"
            >
              Ver todas mis deudas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Deudas que me deben */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-orden-100">Me Deben</h3>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-gold-400" />
            <span className="text-sm text-gold-400 font-medium">
              {
                owedToMe.filter((marker) => marker.status === "Pendiente")
                  .length
              }
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {owedToMe.slice(0, 3).map((marker) => (
            <BloodMarkerItem
              key={marker.id}
              marker={marker}
              isCreditor={true}
              assassins={assassins}
              onPayMarker={onPayMarker}
              onConfirmPayment={onConfirmPayment}
              isLoading={isProcessingPayment}
            />
          ))}
          {owedToMe.length === 0 && (
            <div className="text-center py-6 text-orden-400">
              <Skull className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nadie te debe favores</p>
            </div>
          )}
          {owedToMe.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("/blood-markers")}
              className="w-full text-gold-400 hover:text-gold-300"
            >
              Ver todas las deudas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function BloodMarkerItem({
  marker,
  isCreditor,
  assassins,
  onPayMarker,
  onConfirmPayment,
  isLoading,
}: {
  marker: BloodMarker;
  isCreditor: boolean;
  assassins: Assassin[];
  onPayMarker: (id: string) => void;
  onConfirmPayment: (id: string) => void;
  isLoading: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return isCreditor ? "text-gold-400" : "text-red-400";
      case "Pago Pendiente de Confirmación":
        return "text-yellow-400";
      case "Saldado":
        return "text-green-400";
      default:
        return "text-orden-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-4 w-4" />;
      case "Pago Pendiente de Confirmación":
        return <AlertTriangle className="h-4 w-4" />;
      case "Saldado":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getOtherPartyName = () => {
    const otherPartyId = isCreditor ? marker.debtorId : marker.creditorId;
    const otherParty = assassins.find((a) => a.id === otherPartyId);
    return otherParty?.alias || "Desconocido";
  };

  return (
    <div className="bg-orden-800/50 rounded-lg p-4 border border-orden-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-orden-200 line-clamp-2 mb-1">
            {marker.description}
          </p>
          <p className="text-xs text-orden-400">
            {isCreditor ? "Deudor: " : "Acreedor: "}
            {getOtherPartyName()}
          </p>
        </div>
        <div
          className={`flex items-center space-x-1 ${getStatusColor(
            marker.status
          )}`}
        >
          {getStatusIcon(marker.status)}
          <span className="text-xs font-medium">{marker.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-orden-400">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(marker.createdAt)}</span>
        </div>

        {marker.status === "Pendiente" && (
          <Button
            size="sm"
            variant={isCreditor ? "secondary" : "danger"}
            className="h-6 px-2 text-xs"
            onClick={() => onPayMarker(marker.id)}
            disabled={isLoading}
          >
            {isCreditor ? "Recordar" : "Pagar"}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}

        {marker.status === "Pago Pendiente de Confirmación" && isCreditor && (
          <Button
            size="sm"
            variant="primary"
            className="h-6 px-2 text-xs"
            onClick={() => onConfirmPayment(marker.id)}
            disabled={isLoading}
          >
            Confirmar
            <CheckCircle className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
