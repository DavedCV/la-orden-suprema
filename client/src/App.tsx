import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Router } from "./components/Router";
import { useAuthStore } from "./store/authStore";
import { apiService } from "./services/api";
import { Toaster } from "./components/ui/Toaster";

// Create a client with modern React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && error.message.includes("401"))
          return false;
        if (error instanceof Error && error.message.includes("403"))
          return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

function AppContent() {
  const { setLoading, login, logout } = useAuthStore();

  useEffect(() => {
    // Check if user has a valid token on app load
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setLoading(true);
          const response = await apiService.validateToken();
          if (response.success && response.data) {
            login(response.data, token);
          } else {
            logout();
          }
        } catch {
          logout();
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [login, logout, setLoading]);

  return (
    <div className="min-h-screen bg-orden-900">
      <Router />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      {/* Show React Query DevTools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
