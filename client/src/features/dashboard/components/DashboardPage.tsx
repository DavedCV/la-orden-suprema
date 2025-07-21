import { useAuthStore } from "../../../shared/store/authStore";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../../shared/services/api";
import {
  LogOut,
  User,
  Target,
  Coins,
  Users,
  BarChart3,
  Shield,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Skull,
  Bell,
  ExternalLink,
  PieChart,
} from "lucide-react";
import { toast } from "../../../shared/utils/toast";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type {
  AdminDashboard,
  AssassinDashboard,
  BloodMarker,
  Assassin,
} from "../../../shared/types";

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch dashboard data based on user role
  const { data: adminData, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiService.getAdminDashboard(),
    enabled: user?.role === "admin",
  });

  const { data: assassinData, isLoading: isLoadingAssassin } = useQuery({
    queryKey: ["assassin-dashboard"],
    queryFn: () => apiService.getAssassinDashboard(),
    enabled: user?.role === "assassin",
  });

  // Fetch blood markers for assassins
  const { data: bloodMarkersData, isLoading: isLoadingBloodMarkers } = useQuery(
    {
      queryKey: ["blood-markers"],
      queryFn: () => apiService.getBloodMarkers(),
      enabled: user?.role === "assassin",
    }
  );

  // Fetch assassins data for blood marker names
  const { data: assassinsData } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
    enabled: user?.role === "assassin",
  });

  const isLoading =
    isLoadingAdmin || isLoadingAssassin || isLoadingBloodMarkers;
  const dashboardData =
    user?.role === "admin" ? adminData?.data : assassinData?.data;
  const bloodMarkers = bloodMarkersData?.data || [];
  const assassins = assassinsData?.data || [];

  // Mutations for interactive functionality
  const payMarkerMutation = useMutation({
    mutationFn: (markerId: string) => apiService.payBloodMarker(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Marcador pagado",
        message: "Has marcado la deuda como pagada. Esperando confirmación.",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo procesar el pago del marcador",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (markerId: string) =>
      apiService.confirmBloodMarkerPayment(markerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-markers"] });
      toast({
        type: "success",
        title: "Pago confirmado",
        message: "El marcador ha sido saldado exitosamente",
      });
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo confirmar el pago",
      });
    },
  });

  const handleLogout = () => {
    logout();
    toast({
      type: "info",
      title: "Sesión cerrada",
      message: "Has cerrado sesión correctamente",
    });
  };

  const { navigateTo } = useNavigation();

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
          <div className="flex justify-between items-center py-4">
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
              <div className="text-right">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === "admin" && dashboardData ? (
            <AdminStats data={dashboardData as AdminDashboard} />
          ) : user?.role === "assassin" && dashboardData ? (
            <AssassinStats data={dashboardData as AssassinDashboard} />
          ) : null}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orden-100">
                  {user?.role === "admin"
                    ? "Actividad Reciente"
                    : "Misiones Activas"}
                </h3>
                {user?.role === "assassin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateTo("/my-missions")}
                    className="text-gold-400 hover:text-gold-300"
                  >
                    Ver todas <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {user?.role === "admin" && dashboardData ? (
                  <AdminActivity data={dashboardData as AdminDashboard} />
                ) : user?.role === "assassin" && dashboardData ? (
                  <AssassinMissions
                    data={dashboardData as AssassinDashboard}
                    onNavigate={navigateTo}
                  />
                ) : (
                  <div className="text-center py-8 text-orden-400">
                    <p>No hay datos disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Section - Only for Assassins */}
            {user?.role === "assassin" && dashboardData && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-gold-400" />
                  Actividad Reciente
                </h3>
                <div className="space-y-3">
                  <AssassinActivity data={dashboardData as AssassinDashboard} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions - For both roles */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-orden-100 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                {user?.role === "admin" ? (
                  <>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/assassins")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Gestionar Asesinos
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/missions")}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Gestionar Misiones
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/map")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Mapa Global
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/reports")}
                    >
                      <PieChart className="h-4 w-4 mr-2" />
                      Reportes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/my-missions")}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Mis Misiones
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/blood-markers")}
                    >
                      <Skull className="h-4 w-4 mr-2" />
                      Blood Markers
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => navigateTo("/directory")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Directorio
                    </Button>
                  </>
                )}
                <Button fullWidth variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </div>
            </div>

            {/* Blood Markers Section - Only for Assassins */}
            {user?.role === "assassin" && (
              <>
                {/* Deudas que debo */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-orden-100">
                      Mis Deudas
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Skull className="h-5 w-5 text-red-400" />
                      <span className="text-sm text-red-400 font-medium">
                        {
                          bloodMarkers.filter(
                            (marker) =>
                              marker.debtorId === user?.id &&
                              marker.status === "Pendiente"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {bloodMarkers
                      .filter((marker) => marker.debtorId === user?.id)
                      .slice(0, 3)
                      .map((marker) => (
                        <BloodMarkerItem
                          key={marker.id}
                          marker={marker}
                          isCreditor={false}
                          assassins={assassins}
                          onPayMarker={(id) => payMarkerMutation.mutate(id)}
                          onConfirmPayment={(id) =>
                            confirmPaymentMutation.mutate(id)
                          }
                          isLoading={
                            payMarkerMutation.isPending ||
                            confirmPaymentMutation.isPending
                          }
                        />
                      ))}
                    {bloodMarkers.filter(
                      (marker) => marker.debtorId === user?.id
                    ).length === 0 && (
                      <div className="text-center py-6 text-orden-400">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tienes deudas pendientes</p>
                      </div>
                    )}
                    {bloodMarkers.filter(
                      (marker) => marker.debtorId === user?.id
                    ).length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateTo("/blood-markers")}
                        className="w-full text-red-400 hover:text-red-300"
                      >
                        Ver todas mis deudas{" "}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Deudas que me deben */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-orden-100">
                      Me Deben
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-gold-400" />
                      <span className="text-sm text-gold-400 font-medium">
                        {
                          bloodMarkers.filter(
                            (marker) =>
                              marker.creditorId === user?.id &&
                              marker.status === "Pendiente"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {bloodMarkers
                      .filter((marker) => marker.creditorId === user?.id)
                      .slice(0, 3)
                      .map((marker) => (
                        <BloodMarkerItem
                          key={marker.id}
                          marker={marker}
                          isCreditor={true}
                          assassins={assassins}
                          onPayMarker={(id) => payMarkerMutation.mutate(id)}
                          onConfirmPayment={(id) =>
                            confirmPaymentMutation.mutate(id)
                          }
                          isLoading={
                            payMarkerMutation.isPending ||
                            confirmPaymentMutation.isPending
                          }
                        />
                      ))}
                    {bloodMarkers.filter(
                      (marker) => marker.creditorId === user?.id
                    ).length === 0 && (
                      <div className="text-center py-6 text-orden-400">
                        <Skull className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nadie te debe favores</p>
                      </div>
                    )}
                    {bloodMarkers.filter(
                      (marker) => marker.creditorId === user?.id
                    ).length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateTo("/blood-markers")}
                        className="w-full text-gold-400 hover:text-gold-300"
                      >
                        Ver todas las deudas{" "}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* System Status - For both roles */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-orden-100 mb-4">
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                <StatusItem status="online" label="Continental Network" />
                <StatusItem status="online" label="Secure Communications" />
                <StatusItem status="warning" label="Location Services" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Admin Stats Component
function AdminStats({ data }: { data: AdminDashboard }) {
  return (
    <>
      <StatCard
        icon={<Users className="h-6 w-6" />}
        title="Asesinos Activos"
        value={data.stats.activeAssassins.toString()}
        subtitle={`${data.stats.totalAssassins} total`}
        color="blue"
      />
      <StatCard
        icon={<Target className="h-6 w-6" />}
        title="Misiones Activas"
        value={data.stats.activeMissions.toString()}
        subtitle={`${data.stats.completedMissions} completadas`}
        color="yellow"
      />
      <StatCard
        icon={<Coins className="h-6 w-6" />}
        title="Fondos Disponibles"
        value={formatCurrency(data.stats.totalGoldCoins)}
        subtitle="Monedas de Oro"
        color="gold"
      />
      <StatCard
        icon={<BarChart3 className="h-6 w-6" />}
        title="Blood Markers"
        value={data.stats.outstandingBloodMarkers.toString()}
        subtitle="Pendientes"
        color="green"
      />
    </>
  );
}

// Assassin Stats Component
function AssassinStats({ data }: { data: AssassinDashboard }) {
  return (
    <>
      <StatCard
        icon={<Target className="h-6 w-6" />}
        title="Misiones Activas"
        value={data.activeMissions.length.toString()}
        subtitle={`${data.stats.missionsCompleted} completadas`}
        color="blue"
      />
      <StatCard
        icon={<Coins className="h-6 w-6" />}
        title="Monedas de Oro"
        value={formatCurrency(data.stats.goldCoins)}
        subtitle={`Tasa de éxito: ${data.stats.successRate}%`}
        color="gold"
      />
      <StatCard
        icon={<Skull className="h-6 w-6" />}
        title="Mis Deudas"
        value={data.stats.bloodMarkersOwed.toString()}
        subtitle="Marcadores pendientes"
        color="yellow"
      />
      <StatCard
        icon={<TrendingUp className="h-6 w-6" />}
        title="Me Deben"
        value={data.stats.bloodMarkersOwing.toString()}
        subtitle="Por confirmar"
        color="green"
      />
    </>
  );
}

// Admin Activity Component
function AdminActivity({ data }: { data: AdminDashboard }) {
  return (
    <>
      {data.recentActivity.map((activity) => (
        <ActivityItem
          key={activity.id}
          title={activity.message.split(" ").slice(0, 3).join(" ")}
          subtitle={activity.message}
          time={formatDate(activity.timestamp)}
        />
      ))}
    </>
  );
}

// Assassin Missions Component
function AssassinMissions({
  data,
  onNavigate,
}: {
  data: AssassinDashboard;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {data.activeMissions.slice(0, 3).map((mission) => (
        <MissionItem
          key={mission.id}
          title={mission.title}
          target={mission.description}
          reward={formatCurrency(mission.reward)}
          status={mission.status}
          deadline={formatDate(mission.deadline)}
          onNavigate={onNavigate}
        />
      ))}
      {data.activeMissions.length === 0 && (
        <div className="text-center py-8 text-orden-400">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tienes misiones activas</p>
        </div>
      )}
      {data.activeMissions.length > 3 && (
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate("/my-missions")}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center space-x-1"
          >
            <span>Ver todas las misiones ({data.activeMissions.length})</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
      {data.activeMissions.length > 0 && data.activeMissions.length <= 3 && (
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate("/my-missions")}
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center justify-center space-x-1"
          >
            <span>Ver mis misiones</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
}

// Assassin Activity Component
function AssassinActivity({ data }: { data: AssassinDashboard }) {
  return (
    <>
      {data.recentActivity.slice(0, 5).map((activity) => (
        <ActivityItem
          key={activity.id}
          title={activity.message}
          subtitle={getActivityTypeLabel(activity.type)}
          time={formatDate(activity.timestamp)}
        />
      ))}
      {data.recentActivity.length === 0 && (
        <div className="text-center py-8 text-orden-400">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay actividad reciente</p>
        </div>
      )}
    </>
  );
}

function getActivityTypeLabel(type: string): string {
  switch (type) {
    case "mission_assigned":
      return "Misión asignada";
    case "mission_completed":
      return "Misión completada";
    case "mission_failed":
      return "Misión fallida";
    case "debt_created":
      return "Marcador creado";
    case "debt_paid":
      return "Deuda saldada";
    case "profile_updated":
      return "Perfil actualizado";
    default:
      return "Actividad del sistema";
  }
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "yellow" | "gold" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    gold: "bg-gold-500/20 text-gold-400 border-gold-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-orden-300 mb-1">{title}</p>
          <p className="text-2xl font-bold text-orden-100 mb-1">{value}</p>
          <p className="text-xs text-orden-400">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  subtitle,
  time,
}: {
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-orden-800/50 hover:bg-orden-800 transition-colors">
      <div className="bg-gold-500/20 p-2 rounded-full">
        <CheckCircle className="h-4 w-4 text-gold-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-orden-200">{title}</p>
        <p className="text-xs text-orden-400 mt-1">{subtitle}</p>
        <p className="text-xs text-orden-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function MissionItem({
  title,
  target,
  reward,
  status,
  deadline,
  onNavigate,
}: {
  title: string;
  target: string;
  reward: string;
  status: string;
  deadline: string;
  onNavigate: (path: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
      case "en progreso":
        return "text-yellow-400 bg-yellow-500/20";
      case "asignada":
        return "text-blue-400 bg-blue-500/20";
      case "completada":
        return "text-green-400 bg-green-500/20";
      case "fallida":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-orden-400 bg-orden-700/50";
    }
  };

  const canProgressMission = (status: string) => {
    return status === "Asignada";
  };

  return (
    <div className="flex items-start space-x-3 p-4 rounded-lg bg-orden-800/50 hover:bg-orden-800 transition-colors border border-orden-700/50">
      <div className="bg-gold-500/20 p-2 rounded-full">
        <Target className="h-4 w-4 text-gold-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-orden-200">{title}</h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          </div>
        </div>
        <p className="text-xs text-orden-400 mb-2">{target}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gold-400 font-medium">{reward}</span>
          <div className="flex items-center text-orden-500">
            <Clock className="h-3 w-3 mr-1" />
            {deadline}
          </div>
        </div>
        {canProgressMission(status) && (
          <div className="mt-3 pt-3 border-t border-orden-700">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
              onClick={() => onNavigate("/my-missions")}
            >
              Ver y Gestionar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusItem({
  status,
  label,
}: {
  status: "online" | "warning" | "offline";
  label: string;
}) {
  const statusConfig = {
    online: {
      color: "bg-green-500",
      text: "text-green-400",
    },
    warning: {
      color: "bg-yellow-500",
      text: "text-yellow-400",
    },
    offline: {
      color: "bg-red-500",
      text: "text-red-400",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-orden-300">{label}</span>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className={`text-xs font-medium ${config.text}`}>
          {status === "online"
            ? "Activo"
            : status === "warning"
            ? "Alerta"
            : "Inactivo"}
        </span>
      </div>
    </div>
  );
}

function BloodMarkerItem({
  marker,
  isCreditor,
  assassins,
  onPayMarker,
  onConfirmPayment,
  isLoading,
}: {
  marker: BloodMarker;
  isCreditor: boolean;
  assassins: Assassin[];
  onPayMarker: (id: string) => void;
  onConfirmPayment: (id: string) => void;
  isLoading: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return isCreditor ? "text-gold-400" : "text-red-400";
      case "Pago Pendiente de Confirmación":
        return "text-yellow-400";
      case "Saldado":
        return "text-green-400";
      default:
        return "text-orden-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-4 w-4" />;
      case "Pago Pendiente de Confirmación":
        return <AlertTriangle className="h-4 w-4" />;
      case "Saldado":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getOtherPartyName = () => {
    const otherPartyId = isCreditor ? marker.debtorId : marker.creditorId;
    const otherParty = assassins.find((a) => a.id === otherPartyId);
    return otherParty?.alias || "Desconocido";
  };

  return (
    <div className="bg-orden-800/50 rounded-lg p-4 border border-orden-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-orden-200 line-clamp-2 mb-1">
            {marker.description}
          </p>
          <p className="text-xs text-orden-400">
            {isCreditor ? "Deudor: " : "Acreedor: "}
            {getOtherPartyName()}
          </p>
        </div>
        <div
          className={`flex items-center space-x-1 ${getStatusColor(
            marker.status
          )}`}
        >
          {getStatusIcon(marker.status)}
          <span className="text-xs font-medium">{marker.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-orden-400">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(marker.createdAt)}</span>
        </div>

        {marker.status === "Pendiente" && (
          <Button
            size="sm"
            variant={isCreditor ? "secondary" : "danger"}
            className="h-6 px-2 text-xs"
            onClick={() => onPayMarker(marker.id)}
            disabled={isLoading}
          >
            {isCreditor ? "Recordar" : "Pagar"}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}

        {marker.status === "Pago Pendiente de Confirmación" && isCreditor && (
          <Button
            size="sm"
            variant="primary"
            className="h-6 px-2 text-xs"
            onClick={() => onConfirmPayment(marker.id)}
            disabled={isLoading}
          >
            Confirmar
            <CheckCircle className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
