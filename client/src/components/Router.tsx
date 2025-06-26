import { useAuthStore } from "../store/authStore";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";

export function Router() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orden-900">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}
