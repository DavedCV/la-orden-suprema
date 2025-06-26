import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { AssassinManagementPage } from "../pages/AssassinManagementPage";
import { MissionManagementPage } from "../pages/MissionManagementPage";
import { ProfilePage } from "../pages/ProfilePage";
import { BloodMarkersPage } from "../pages/BloodMarkersPage";
import { FirstLoginModal } from "./auth/FirstLoginModal";

type Route =
  | "dashboard"
  | "assassins"
  | "missions"
  | "profile"
  | "blood-markers";

export function Router() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState<Route>("dashboard");
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  // Check for first login
  useEffect(() => {
    if (isAuthenticated && user?.isFirstLogin) {
      setShowFirstLoginModal(true);
    }
  }, [isAuthenticated, user]);

  // Simple client-side routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/assassins") {
      setCurrentRoute("assassins");
    } else if (path === "/missions") {
      setCurrentRoute("missions");
    } else if (path === "/profile") {
      setCurrentRoute("profile");
    } else if (path === "/blood-markers") {
      setCurrentRoute("blood-markers");
    } else {
      setCurrentRoute("dashboard");
    }

    // Listen for navigation changes
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath === "/assassins") {
        setCurrentRoute("assassins");
      } else if (newPath === "/missions") {
        setCurrentRoute("missions");
      } else if (newPath === "/profile") {
        setCurrentRoute("profile");
      } else if (newPath === "/blood-markers") {
        setCurrentRoute("blood-markers");
      } else {
        setCurrentRoute("dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  // Show first login modal if needed
  if (showFirstLoginModal) {
    return (
      <>
        <DashboardPage />
        <FirstLoginModal
          onPasswordChanged={() => {
            setShowFirstLoginModal(false);
            // Update user state to remove first login flag
            // In real app, this would update the backend
          }}
        />
      </>
    );
  }

  // Route protection - only admins can access assassin and mission management
  if (currentRoute === "assassins" && user?.role !== "admin") {
    return <DashboardPage />;
  }

  if (currentRoute === "missions" && user?.role !== "admin") {
    return <DashboardPage />;
  }

  switch (currentRoute) {
    case "assassins":
      return <AssassinManagementPage />;
    case "missions":
      return <MissionManagementPage />;
    case "profile":
      return <ProfilePage />;
    case "blood-markers":
      return <BloodMarkersPage />;
    default:
      return <DashboardPage />;
  }
}
