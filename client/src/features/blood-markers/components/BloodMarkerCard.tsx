import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { formatDate } from "../../../shared/utils";
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  ArrowRight,
  Skull,
} from "lucide-react";
import type { BloodMarker, Assassin } from "../../../shared/types";

interface BloodMarkerCardProps {
  marker: BloodMarker;
  assassins: Assassin[];
  currentUserId: string;
  onRequestResponse?: () => void;
  onViewDetails: () => void;
  onRefresh: () => void;
}

export function BloodMarkerCard({
  marker,
  assassins,
  currentUserId,
  onRequestResponse,
  onViewDetails,
  onRefresh,
}: BloodMarkerCardProps) {
  const queryClient = useQueryClient();

  const debtor = assassins.find((a) => a.id === marker.debtorId);
  const creditor = assassins.find((a) => a.id === marker.creditorId);

  const isDebtor = marker.debtorId === currentUserId;
  const isCreditor = marker.creditorId === currentUserId;

  // Mutations
  const payMutation = useMutation({
    mutationFn: () => apiService.payBloodMarker(marker.id),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Marcador pagado",
        message: "Has marcado la deuda como pagada. Esperando confirmación.",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      onRefresh();
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo procesar el pago del marcador",
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => apiService.confirmBloodMarkerPayment(marker.id),
    onSuccess: () => {
      toast({
        type: "success",
        title: "Pago confirmado",
        message: "El marcador ha sido saldado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      onRefresh();
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo confirmar el pago",
      });
    },
  });

  const getStatusInfo = () => {
    switch (marker.status) {
      case "Solicitud Pendiente":
        return {
          color: "text-yellow-400 bg-yellow-500/20",
          icon: <Clock className="h-4 w-4" />,
          label: "Solicitud Pendiente",
        };
      case "Pendiente":
        return {
          color: isDebtor
            ? "text-red-400 bg-red-500/20"
            : "text-green-400 bg-green-500/20",
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Pendiente",
        };
      case "Pago Pendiente de Confirmación":
        return {
          color: "text-yellow-400 bg-yellow-500/20",
          icon: <Clock className="h-4 w-4" />,
          label: "Esperando Confirmación",
        };
      case "Saldado":
        return {
          color: "text-green-400 bg-green-500/20",
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Saldado",
        };
      case "Rechazada":
        return {
          color: "text-red-400 bg-red-500/20",
          icon: <XCircle className="h-4 w-4" />,
          label: "Rechazada",
        };
      default:
        return {
          color: "text-orden-400 bg-orden-700/50",
          icon: <Clock className="h-4 w-4" />,
          label: marker.status,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const canPay = isDebtor && marker.status === "Pendiente";
  const canConfirm =
    isCreditor && marker.status === "Pago Pendiente de Confirmación";
  const canRespond =
    isCreditor && marker.status === "Solicitud Pendiente" && onRequestResponse;

  return (
    <div className="bg-orden-800 rounded-lg border border-orden-700 hover:border-orden-600 transition-colors">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <Skull className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-orden-400 hover:text-orden-200"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-orden-200 mb-2 line-clamp-3">
            {marker.description}
          </p>
        </div>

        {/* Participants Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-xs text-orden-400">Deudor</p>
              <p className="text-sm text-orden-200 font-medium">
                {debtor?.alias || "Desconocido"}
                {isDebtor && (
                  <span className="text-xs text-yellow-400 ml-2">(Tú)</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-xs text-orden-400">Acreedor</p>
              <p className="text-sm text-orden-200 font-medium">
                {creditor?.alias || "Desconocido"}
                {isCreditor && (
                  <span className="text-xs text-yellow-400 ml-2">(Tú)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Date and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-orden-400">
            <Calendar className="h-3 w-3" />
            <span>Creado: {formatDate(marker.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-2">
            {canRespond && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRequestResponse}
                className="text-xs"
              >
                Responder
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}

            {canPay && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
                className="text-xs"
              >
                {payMutation.isPending ? "Procesando..." : "Pagar"}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}

            {canConfirm && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="text-xs"
              >
                {confirmMutation.isPending ? "Confirmando..." : "Confirmar"}
                <CheckCircle className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Additional Status Information */}
        {marker.paidAt && (
          <div className="mt-3 pt-3 border-t border-orden-700">
            <div className="flex items-center space-x-2 text-xs text-orden-400">
              <Clock className="h-3 w-3" />
              <span>Marcado como pagado: {formatDate(marker.paidAt)}</span>
            </div>
          </div>
        )}

        {marker.confirmedAt && (
          <div className="mt-1">
            <div className="flex items-center space-x-2 text-xs text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>Confirmado: {formatDate(marker.confirmedAt)}</span>
            </div>
          </div>
        )}

        {marker.rejectedAt && (
          <div className="mt-3 pt-3 border-t border-orden-700">
            <div className="flex items-center space-x-2 text-xs text-red-400">
              <XCircle className="h-3 w-3" />
              <span>Rechazado: {formatDate(marker.rejectedAt)}</span>
            </div>
            {marker.rejectionReason && (
              <p className="text-xs text-orden-400 mt-1">
                Razón: {marker.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
