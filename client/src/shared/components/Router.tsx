import { useState, useEffect } from "react";
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
import { MissionManagementPage } from "../../features/missions/components";
import { BloodMarkersPage } from "../../features/blood-markers/components";
import { ReportsPage } from "../../features/reports/components";

type Route =
  | "dashboard"
  | "assassins"
  | "missions"
  | "profile"
  | "blood-markers"
  | "directory"
  | "map"
  | "reports"
  | "my-missions";

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
    } else if (path === "/directory") {
      setCurrentRoute("directory");
    } else if (path === "/map") {
      setCurrentRoute("map");
    } else if (path === "/reports") {
      setCurrentRoute("reports");
    } else if (path === "/my-missions") {
      setCurrentRoute("my-missions");
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
      } else if (newPath === "/directory") {
        setCurrentRoute("directory");
      } else if (newPath === "/map") {
        setCurrentRoute("map");
      } else if (newPath === "/reports") {
        setCurrentRoute("reports");
      } else if (newPath === "/my-missions") {
        setCurrentRoute("my-missions");
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

  // Route protection - only admins can access certain pages
  if (currentRoute === "assassins" && user?.role !== "admin") {
    return <DashboardPage />;
  }

  if (currentRoute === "missions" && user?.role !== "admin") {
    return <DashboardPage />;
  }

  if (currentRoute === "map" && user?.role !== "admin") {
    return <DashboardPage />;
  }

  if (currentRoute === "reports" && user?.role !== "admin") {
    return <DashboardPage />;
  }

  // Directory, blood-markers and my-missions are accessible to assassins only
  if (
    (currentRoute === "directory" ||
      currentRoute === "blood-markers" ||
      currentRoute === "my-missions") &&
    user?.role !== "assassin"
  ) {
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
    case "directory":
      return <AssassinDirectoryPage />;
    case "map":
      return <LocationMapPage />;
    case "reports":
      return <ReportsPage />;
    case "my-missions":
      return <AssassinMissionsPage />;
    default:
      return <DashboardPage />;
  }
}
