import { Button } from "../../../shared/components/Button";
import { Skull, AlertTriangle, Clock, ArrowRight, Coins } from "lucide-react";
import type { BloodMarker, Assassin } from "../../../shared/types";

interface DebtsSummaryCardProps {
  debts: BloodMarker[];
  assassins: Assassin[];
  currentUserId: string;
  onPayDebt: (markerId: string) => void;
  onViewAll: () => void;
  isProcessing: boolean;
}

export function DebtsSummaryCard({
  debts,
  assassins,
  currentUserId,
  onPayDebt,
  onViewAll,
  isProcessing,
}: DebtsSummaryCardProps) {
  // Filter debts that the current user owes (where they are the debtor)
  const myDebts = debts.filter(
    (debt) =>
      debt.debtorId === currentUserId &&
      ["Pendiente", "Pago Pendiente de Confirmación"].includes(debt.status)
  );

  const pendingPayments = myDebts.filter(
    (debt) => debt.status === "Pago Pendiente de Confirmación"
  );

  const getCreditorName = (creditorId: string) => {
    const creditor = assassins.find((a) => a.id === creditorId);
    return creditor?.alias || "Desconocido";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "text-red-400";
      case "Pago Pendiente de Confirmación":
        return "text-yellow-400";
      default:
        return "text-orden-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <AlertTriangle className="h-3 w-3" />;
      case "Pago Pendiente de Confirmación":
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-orden-100">Mis Deudas</h3>
        <div className="flex items-center space-x-2">
          <Skull className="h-5 w-5 text-red-400" />
          <span className="text-sm text-red-400 font-medium">
            {myDebts.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {myDebts.length === 0 ? (
          <div className="text-center py-6 text-orden-400">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes deudas pendientes</p>
            <p className="text-xs text-orden-500 mt-1">
              Mantén tu honor intacto
            </p>
          </div>
        ) : (
          <>
            {/* Priority debts - show first 3 */}
            {myDebts.slice(0, 3).map((debt) => (
              <div
                key={debt.id}
                className="bg-orden-800/50 rounded-lg p-4 border border-orden-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-orden-200 line-clamp-2 mb-1">
                      {debt.description}
                    </p>
                    <p className="text-xs text-orden-400">
                      A: {getCreditorName(debt.creditorId)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${getStatusColor(
                      debt.status
                    )}`}
                  >
                    {getStatusIcon(debt.status)}
                    <span className="text-xs font-medium">
                      {debt.status === "Pendiente" ? "Pendiente" : "Esperando"}
                    </span>
                  </div>
                </div>

                {debt.status === "Pendiente" && (
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-6 px-2 text-xs"
                      onClick={() => onPayDebt(debt.id)}
                      disabled={isProcessing}
                    >
                      Pagar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Summary info */}
            <div className="border-t border-orden-700 pt-3 mt-3">
              {pendingPayments.length > 0 && (
                <div className="flex items-center justify-between text-xs text-yellow-400 mb-2">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Esperando confirmación
                  </span>
                  <span className="font-medium">{pendingPayments.length}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAll}
                className="w-full text-gold-400 hover:text-gold-300"
              >
                Gestionar todas las deudas
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
