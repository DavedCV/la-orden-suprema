import React from "react";
import { useAuthStore } from "../../../shared/store/authStore";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { LogOut, Shield } from "lucide-react";
import { toast } from "../../../shared/utils/toast";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import { useDashboardData } from "../hooks/useDashboardData";
import { AdminDashboard } from "./AdminDashboard";
import { AssassinDashboard } from "./AssassinDashboard";

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { navigateTo } = useNavigation();

  const {
    isLoading,
    adminData,
    assassinData,
    bloodMarkers,
    assassins,
    payMarkerMutation,
    confirmPaymentMutation,
    isProcessingPayment,
  } = useDashboardData();

  const handleLogout = React.useCallback(() => {
    logout();
    toast({
      type: "info",
      title: "Sesión cerrada",
      message: "Has cerrado sesión correctamente",
    });
  }, [logout]);

  // Memoized mutation handlers to prevent unnecessary re-renders
  const handlePayMarker = React.useCallback(
    (markerId: string) => payMarkerMutation.mutate(markerId),
    [payMarkerMutation]
  );

  const handleConfirmPayment = React.useCallback(
    (markerId: string) => confirmPaymentMutation.mutate(markerId),
    [confirmPaymentMutation]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile layout: stack vertically */}
          <div className="flex flex-col space-y-4 py-4 sm:hidden">
            <div className="flex items-center space-x-3">
              <div className="bg-gold-500/20 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-gold-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gold-400">
                  La Orden Suprema
                </h1>
                <p className="text-sm text-orden-400">
                  {user?.role === "admin"
                    ? "Panel de Administración"
                    : "Portal del Asesino"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-orden-200">
                  {user?.alias}
                </p>
                <p className="text-xs text-orden-400">
                  {user?.role === "admin" ? "Administrador" : "Asesino"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-orden-300 hover:text-orden-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>

          {/* Desktop layout: horizontal */}
          <div className="hidden sm:flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gold-500/20 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-gold-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gold-400">
                  La Orden Suprema
                </h1>
                <p className="text-sm text-orden-400">
                  {user?.role === "admin"
                    ? "Panel de Administración"
                    : "Portal del Asesino"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-orden-200">
                  {user?.alias}
                </p>
                <p className="text-xs text-orden-400">
                  {user?.role === "admin" ? "Administrador" : "Asesino"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-orden-300 hover:text-orden-100"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-orden-100 mb-2">
            ¡Bienvenido de vuelta, {user?.alias}!
          </h2>
          <p className="text-orden-300">
            {user?.role === "admin"
              ? "Administra la orden y supervisa las operaciones"
              : "Revisa tus misiones activas y gestiona tu perfil"}
          </p>
        </div>

        {/* Role-based Dashboard Content */}
        {user?.role === "admin" && adminData ? (
          <AdminDashboard data={adminData} />
        ) : user?.role === "assassin" && assassinData ? (
          <AssassinDashboard
            data={assassinData}
            bloodMarkers={bloodMarkers}
            assassins={assassins}
            onPayMarker={handlePayMarker}
            onConfirmPayment={handleConfirmPayment}
            isProcessingPayment={isProcessingPayment}
          />
        ) : (
          <div className="text-center py-8 text-orden-400">
            <p>No hay datos disponibles para mostrar</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateTo("/profile")}
              className="mt-4"
            >
              Ir a Mi Perfil
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
