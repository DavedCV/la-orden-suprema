import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { apiService } from "../../../shared/services/api";
import { toast } from "../../../shared/utils/toast";
import { formatDate } from "../../../shared/utils";
import {
  X,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Skull,
} from "lucide-react";
import type { BloodMarker, Assassin } from "../../../shared/types";

interface BloodMarkerDetailsModalProps {
  marker: BloodMarker;
  assassins: Assassin[];
  currentUserId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function BloodMarkerDetailsModal({
  marker,
  assassins,
  currentUserId,
  onClose,
  onRefresh,
}: BloodMarkerDetailsModalProps) {
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo procesar el pago";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo confirmar el pago";
      toast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  const getStatusInfo = () => {
    switch (marker.status) {
      case "Solicitud Pendiente":
        return {
          color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
          icon: <Clock className="h-5 w-5" />,
          label: "Solicitud Pendiente",
        };
      case "Pendiente":
        return {
          color: isDebtor
            ? "text-red-400 bg-red-500/20 border-red-500/30"
            : "text-green-400 bg-green-500/20 border-green-500/30",
          icon: <AlertTriangle className="h-5 w-5" />,
          label: "Pendiente",
        };
      case "Pago Pendiente de Confirmación":
        return {
          color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
          icon: <Clock className="h-5 w-5" />,
          label: "Esperando Confirmación",
        };
      case "Saldado":
        return {
          color: "text-green-400 bg-green-500/20 border-green-500/30",
          icon: <CheckCircle className="h-5 w-5" />,
          label: "Saldado",
        };
      case "Rechazada":
        return {
          color: "text-red-400 bg-red-500/20 border-red-500/30",
          icon: <XCircle className="h-5 w-5" />,
          label: "Rechazada",
        };
      default:
        return {
          color: "text-orden-400 bg-orden-700/50 border-orden-600",
          icon: <Clock className="h-5 w-5" />,
          label: marker.status,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const canPay = isDebtor && marker.status === "Pendiente";
  const canConfirm =
    isCreditor && marker.status === "Pago Pendiente de Confirmación";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg border border-orden-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <Skull className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-orden-100">
                Blood Marker
              </h2>
              <p className="text-sm text-orden-400">
                Detalles del marcador de sangre
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-orden-400 hover:text-orden-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className={`p-4 rounded-lg border ${statusInfo.color}`}>
            <div className="flex items-center space-x-3">
              {statusInfo.icon}
              <div>
                <h3 className="font-semibold">{statusInfo.label}</h3>
                <p className="text-sm opacity-80">
                  {marker.status === "Solicitud Pendiente" &&
                    isCreditor &&
                    "Esta solicitud está esperando tu respuesta"}
                  {marker.status === "Pendiente" &&
                    isDebtor &&
                    "Tienes una deuda pendiente de pago"}
                  {marker.status === "Pendiente" &&
                    isCreditor &&
                    "Te deben un favor"}
                  {marker.status === "Pago Pendiente de Confirmación" &&
                    isCreditor &&
                    "El deudor ha marcado como pagado, esperando tu confirmación"}
                  {marker.status === "Pago Pendiente de Confirmación" &&
                    isDebtor &&
                    "Has marcado como pagado, esperando confirmación"}
                  {marker.status === "Saldado" &&
                    "Este marcador ha sido completamente saldado"}
                  {marker.status === "Rechazada" &&
                    "Esta solicitud fue rechazada"}
                </p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orden-900 rounded-lg p-4 border border-orden-600">
              <div className="flex items-center space-x-3 mb-3">
                <User className="h-5 w-5 text-red-400" />
                <h4 className="font-medium text-orden-200">Deudor</h4>
              </div>
              <div>
                <p className="text-lg font-semibold text-orden-100">
                  {debtor?.alias || "Desconocido"}
                  {isDebtor && (
                    <span className="text-sm text-yellow-400 ml-2">(Tú)</span>
                  )}
                </p>
                {debtor && (
                  <div className="text-sm text-orden-400 mt-1">
                    <p>{debtor.status}</p>
                    <p>{debtor.completedMissions} misiones completadas</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orden-900 rounded-lg p-4 border border-orden-600">
              <div className="flex items-center space-x-3 mb-3">
                <User className="h-5 w-5 text-green-400" />
                <h4 className="font-medium text-orden-200">Acreedor</h4>
              </div>
              <div>
                <p className="text-lg font-semibold text-orden-100">
                  {creditor?.alias || "Desconocido"}
                  {isCreditor && (
                    <span className="text-sm text-yellow-400 ml-2">(Tú)</span>
                  )}
                </p>
                {creditor && (
                  <div className="text-sm text-orden-400 mt-1">
                    <p>{creditor.status}</p>
                    <p>{creditor.completedMissions} misiones completadas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-orden-900 rounded-lg p-4 border border-orden-600">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <h4 className="font-medium text-orden-200">
                Descripción del favor
              </h4>
            </div>
            <p className="text-orden-300 leading-relaxed">
              {marker.description}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-orden-900 rounded-lg p-4 border border-orden-600">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-purple-400" />
              <h4 className="font-medium text-orden-200">Cronología</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm text-orden-300">Solicitud creada</p>
                  <p className="text-xs text-orden-500">
                    {formatDate(marker.createdAt)}
                  </p>
                </div>
              </div>

              {marker.status !== "Solicitud Pendiente" && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-orden-300">Solicitud aceptada</p>
                    <p className="text-xs text-orden-500">
                      Marcador oficialmente registrado
                    </p>
                  </div>
                </div>
              )}

              {marker.paidAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-orden-300">
                      Marcado como pagado
                    </p>
                    <p className="text-xs text-orden-500">
                      {formatDate(marker.paidAt)}
                    </p>
                  </div>
                </div>
              )}

              {marker.confirmedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-orden-300">Pago confirmado</p>
                    <p className="text-xs text-orden-500">
                      {formatDate(marker.confirmedAt)}
                    </p>
                  </div>
                </div>
              )}

              {marker.rejectedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div>
                    <p className="text-sm text-orden-300">
                      Solicitud rechazada
                    </p>
                    <p className="text-xs text-orden-500">
                      {formatDate(marker.rejectedAt)}
                    </p>
                    {marker.rejectionReason && (
                      <p className="text-xs text-orden-400 mt-1 italic">
                        "{marker.rejectionReason}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cerrar
            </Button>

            {canPay && (
              <Button
                variant="danger"
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
                className="flex-1"
              >
                {payMutation.isPending ? "Procesando..." : "Marcar como Pagado"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {canConfirm && (
              <Button
                variant="primary"
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="flex-1"
              >
                {confirmMutation.isPending
                  ? "Confirmando..."
                  : "Confirmar Pago"}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
