import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  LoginPage,
  ProfilePage,
  FirstLoginModal,
} from "../../features/auth/components";
import { DashboardPage } from "../../features/dashboard/components";
import {
  AssassinManagementPage,
  AssassinDirectoryPage,
  LocationMapPage,
  AssassinMissionsPage,
} from "../../features/assassins/components";
import {
  MissionManagementPage,
  AvailableMissionsPage,
} from "../../features/missions/components";
import { BloodMarkersPage } from "../../features/blood-markers/components";
import { ReportsPage } from "../../features/reports/components";
import { useState, useEffect } from "react";

// Route protection wrapper
function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}) {
  const { user } = useAuthStore();

  if (allowedRoles && !allowedRoles.includes(user?.role || "")) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Authentication wrapper
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.isFirstLogin) {
      setShowFirstLoginModal(true);
    }
  }, [isAuthenticated, user]);

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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      {children}
      {showFirstLoginModal && (
        <FirstLoginModal
          onPasswordChanged={() => setShowFirstLoginModal(false)}
        />
      )}
    </>
  );
}

export function Router() {
  return (
    <AuthGuard>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes (accessible to all authenticated users) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin-only routes */}
        <Route
          path="/assassins"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssassinManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MissionManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LocationMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Assassin-only routes */}
        <Route
          path="/available-missions"
          element={
            <ProtectedRoute allowedRoles={["assassin"]}>
              <AvailableMissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/directory"
          element={
            <ProtectedRoute allowedRoles={["assassin"]}>
              <AssassinDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blood-markers"
          element={
            <ProtectedRoute allowedRoles={["assassin"]}>
              <BloodMarkersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-missions"
          element={
            <ProtectedRoute allowedRoles={["assassin"]}>
              <AssassinMissionsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthGuard>
  );
}
