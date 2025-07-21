import { CheckCircle, Clock, AlertTriangle, XCircle, Mail } from "lucide-react";
import type { BloodMarker } from "../../../shared/types";

export type BloodMarkerStatus = BloodMarker["status"];

export interface StatusInfo {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const getStatusColor = (status: BloodMarkerStatus): string => {
  switch (status) {
    case "Pendiente":
      return "text-red-400 bg-red-500/20";
    case "Pago Pendiente de Confirmación":
      return "text-yellow-400 bg-yellow-500/20";
    case "Saldado":
      return "text-green-400 bg-green-500/20";
    default:
      return "text-orden-400 bg-orden-700/50";
  }
};

export const getStatusColorForCard = (
  status: BloodMarkerStatus,
  isCreditor: boolean
): string => {
  switch (status) {
    case "Solicitud Pendiente":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Pendiente":
      return isCreditor
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-red-500/20 text-red-400 border-red-500/30";
    case "Pago Pendiente de Confirmación":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Saldado":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Rechazada":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-orden-700/50 text-orden-400 border-orden-600";
  }
};

export const getStatusInfo = (status: BloodMarkerStatus): StatusInfo => {
  switch (status) {
    case "Solicitud Pendiente":
      return {
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        icon: Mail,
      };
    case "Pendiente":
      return {
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
        icon: Clock,
      };
    case "Pago Pendiente de Confirmación":
      return {
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/30",
        icon: AlertTriangle,
      };
    case "Saldado":
      return {
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
        icon: CheckCircle,
      };
    case "Rechazada":
      return {
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
        icon: XCircle,
      };
    default:
      return {
        color: "text-orden-400",
        bgColor: "bg-orden-700/50",
        borderColor: "border-orden-600",
        icon: Clock,
      };
  }
};

export const getStatusIcon = (status: BloodMarkerStatus) => {
  const statusInfo = getStatusInfo(status);
  return statusInfo.icon;
};

export const getMarkerRole = (marker: BloodMarker, currentUserId: string) => {
  const isCreditor = marker.creditorId === currentUserId;
  const isDebtor = marker.debtorId === currentUserId;

  return { isCreditor, isDebtor };
};

export const canPayMarker = (marker: BloodMarker, currentUserId: string): boolean => {
  const { isDebtor } = getMarkerRole(marker, currentUserId);
  return marker.status === "Pendiente" && isDebtor;
};

export const canConfirmPayment = (marker: BloodMarker, currentUserId: string): boolean => {
  const { isCreditor } = getMarkerRole(marker, currentUserId);
  return marker.status === "Pago Pendiente de Confirmación" && isCreditor;
};

export const canRespondToRequest = (marker: BloodMarker, currentUserId: string): boolean => {
  const { isDebtor } = getMarkerRole(marker, currentUserId);
  return marker.status === "Solicitud Pendiente" && isDebtor;
};

export const getMarkerDescription = (
  marker: BloodMarker,
  currentUserId: string,
  otherPartyName: string
): string => {
  const { isCreditor, isDebtor } = getMarkerRole(marker, currentUserId);

  switch (marker.status) {
    case "Solicitud Pendiente":
      if (isDebtor) {
        return `Solicitud de ${otherPartyName}`;
      } else if (isCreditor) {
        return `Tu solicitud a ${otherPartyName}`;
      }
      break;
    case "Pendiente":
      if (isDebtor) {
        return `Debes a ${otherPartyName}`;
      } else if (isCreditor) {
        return `${otherPartyName} te debe`;
      }
      break;
    case "Pago Pendiente de Confirmación":
      if (isCreditor) {
        return `${otherPartyName} marcó como pagado`;
      } else if (isDebtor) {
        return `Esperando confirmación de ${otherPartyName}`;
      }
      break;
    case "Saldado":
      return `Marcador saldado con ${otherPartyName}`;
    case "Rechazada":
      if (isCreditor) {
        return `${otherPartyName} rechazó tu solicitud`;
      } else if (isDebtor) {
        return `Solicitud rechazada de ${otherPartyName}`;
      }
      break;
  }

  return `Marcador con ${otherPartyName}`;
};

export const getRoleDisplayInfo = (isCreditor: boolean) => {
  return isCreditor
    ? {
        bgColor: "bg-gold-500/20",
        iconColor: "text-gold-400",
        label: "Acreedor",
      }
    : {
        bgColor: "bg-red-500/20",
        iconColor: "text-red-400",
        label: "Deudor",
      };
};
