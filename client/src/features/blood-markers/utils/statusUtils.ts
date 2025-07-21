import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
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
    case "Pendiente":
      return isCreditor
        ? "text-gold-400 bg-gold-500/20"
        : "text-red-400 bg-red-500/20";
    case "Pago Pendiente de Confirmación":
      return "text-yellow-400 bg-yellow-500/20";
    case "Saldado":
      return "text-green-400 bg-green-500/20";
    default:
      return "text-orden-400 bg-orden-700/50";
  }
};

export const getStatusInfo = (status: BloodMarkerStatus): StatusInfo => {
  switch (status) {
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

export const getMarkerDescription = (
  marker: BloodMarker,
  currentUserId: string,
  otherPartyName: string
): string => {
  const { isCreditor } = getMarkerRole(marker, currentUserId);
  return isCreditor
    ? `${otherPartyName} te debe`
    : `Debes a ${otherPartyName}`;
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
