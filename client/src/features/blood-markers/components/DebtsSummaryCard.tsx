import React from "react";
import { AlertTriangle, Calendar, Skull, ArrowRight } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import type { BloodMarker, Assassin } from "../../../shared/types";

interface DebtsSummaryCardProps {
  debts: BloodMarker[];
  assassins: Assassin[];
  currentUserId: string;
  onPayDebt: (markerId: string) => void;
  onViewAll: () => void;
  isProcessing: boolean;
}

export const DebtsSummaryCard = React.memo(function DebtsSummaryCard({
  debts,
  assassins,
  currentUserId,
  onPayDebt,
  onViewAll,
  isProcessing,
}: DebtsSummaryCardProps) {
  // Filter only pending debts where current user is the debtor
  const myPendingDebts = debts.filter(
    (debt) => debt.debtorId === currentUserId && debt.status === "Pendiente"
  );

  // Sort by creation date (oldest first - more urgent)
  const sortedDebts = myPendingDebts.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getCreditorName = (debt: BloodMarker) => {
    const creditor = assassins.find((a) => a.id === debt.creditorId);
    return creditor?.alias || "Desconocido";
  };

  const getDaysOld = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (myPendingDebts.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-orden-100 flex items-center">
            <Skull className="h-5 w-5 mr-2 text-green-400" />
            Mis Deudas
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-400 font-medium">
              Sin deudas pendientes
            </span>
          </div>
        </div>
        <div className="text-center py-6 text-orden-400">
          <div className="bg-green-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Skull className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-sm">¡Excelente! No tienes deudas pendientes.</p>
          <p className="text-xs text-orden-500 mt-1">
            Mantén tu honor intacto cumpliendo tus compromisos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-orden-100 flex items-center">
          <Skull className="h-5 w-5 mr-2 text-red-400" />
          Mis Deudas
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-400 font-medium">
            {myPendingDebts.length} pendiente
            {myPendingDebts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {sortedDebts.slice(0, 3).map((debt) => {
          const daysOld = getDaysOld(debt.createdAt);
          const isUrgent = daysOld > 7; // Más de 7 días = urgente

          return (
            <div
              key={debt.id}
              className={`bg-orden-700/50 rounded-lg p-4 border transition-colors ${
                isUrgent ? "border-red-500/30 bg-red-500/5" : "border-orden-600"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-orden-200">
                      Deuda con {getCreditorName(debt)}
                    </p>
                    {isUrgent && (
                      <div className="flex items-center text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">Urgente</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-orden-400 line-clamp-2">
                    {debt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-orden-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {daysOld === 1 ? "Hace 1 día" : `Hace ${daysOld} días`}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onPayDebt(debt.id)}
                  className={`h-6 px-2 text-xs ${
                    isUrgent
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                  disabled={isProcessing}
                >
                  Pagar
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="flex-1 text-red-400 hover:text-red-300"
        >
          Ver todas mis deudas
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
        {myPendingDebts.length > 0 && (
          <Button
            size="sm"
            onClick={() => onPayDebt(sortedDebts[0].id)}
            className="bg-red-600 hover:bg-red-700"
            disabled={isProcessing}
          >
            Pagar más urgente
          </Button>
        )}
      </div>

      {myPendingDebts.some((debt) => getDaysOld(debt.createdAt) > 7) && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
            <div>
              <p className="text-xs text-red-400 font-medium">
                Deudas urgentes detectadas
              </p>
              <p className="text-xs text-orden-300">
                Tienes deudas pendientes de más de 7 días. Es importante
                saldarlas para mantener tu reputación en La Orden.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
