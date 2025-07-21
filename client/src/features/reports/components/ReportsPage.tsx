import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Coins,
  Award,
  CheckCircle,
  Clock,
  Shield,
  Download,
  Filter,
  RefreshCw,
  Skull,
  DollarSign,
  Activity,
  Eye,
} from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import type { Assassin } from "../../../shared/types";

interface SystemMetrics {
  totalAssassins: number;
  activeAssassins: number;
  retiredAssassins: number;
  excommunicatedAssassins: number;
  totalMissions: number;
  completedMissions: number;
  failedMissions: number;
  activeMissions: number;
  totalRewards: number;
  averageReward: number;
  totalBloodMarkers: number;
  pendingBloodMarkers: number;
  successRate: number;
  averageCompletionTime: number;
}

interface AssassinPerformance {
  assassin: Assassin;
  missionsCompleted: number;
  missionsFailed: number;
  totalRewards: number;
  successRate: number;
  averageReward: number;
  bloodMarkersOwed: number;
  bloodMarkersOwing: number;
  lastActivity: string;
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: "Últimos 7 días", value: "7d", days: 7 },
  { label: "Últimos 30 días", value: "30d", days: 30 },
  { label: "Últimos 90 días", value: "90d", days: 90 },
  { label: "Todo el tiempo", value: "all", days: 0 },
];

export function ReportsPage() {
  const { user } = useAuthStore();
  const { goBack } = useNavigation();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TIME_RANGES[1]
  );
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== "admin") {
      goBack();
    }
  }, [user, goBack]);

  // Fetch data
  const { data: assassinsData, isLoading: isLoadingAssassins } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
  });

  const { data: missionsData, isLoading: isLoadingMissions } = useQuery({
    queryKey: ["missions"],
    queryFn: () => apiService.getMissions(),
  });

  const { data: bloodMarkersData, isLoading: isLoadingMarkers } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
  });

  const assassins = assassinsData?.data || [];
  const missions = missionsData?.data || [];
  const bloodMarkers = bloodMarkersData?.data || [];
  const isLoading = isLoadingAssassins || isLoadingMissions || isLoadingMarkers;

  // Calculate metrics
  const calculateMetrics = (): SystemMetrics => {
    const totalAssassins = assassins.length;
    const activeAssassins = assassins.filter(
      (a) => a.status === "Activo"
    ).length;
    const retiredAssassins = assassins.filter(
      (a) => a.status === "Retirado"
    ).length;
    const excommunicatedAssassins = assassins.filter(
      (a) => a.status === "Excommunicado"
    ).length;

    const totalMissions = missions.length;
    const completedMissions = missions.filter(
      (m) => m.status === "Completada"
    ).length;
    const failedMissions = missions.filter(
      (m) => m.status === "Fallida"
    ).length;
    const activeMissions = missions.filter(
      (m) => m.status === "Asignada" || m.status === "En Progreso"
    ).length;

    const totalRewards = missions
      .filter((m) => m.status === "Completada")
      .reduce((sum, m) => sum + m.reward, 0);
    const averageReward =
      completedMissions > 0 ? totalRewards / completedMissions : 0;

    const totalBloodMarkers = bloodMarkers.length;
    const pendingBloodMarkers = bloodMarkers.filter(
      (b) => b.status === "Pendiente"
    ).length;

    const successRate =
      totalMissions > 0
        ? (completedMissions / (completedMissions + failedMissions)) * 100
        : 0;

    return {
      totalAssassins,
      activeAssassins,
      retiredAssassins,
      excommunicatedAssassins,
      totalMissions,
      completedMissions,
      failedMissions,
      activeMissions,
      totalRewards,
      averageReward,
      totalBloodMarkers,
      pendingBloodMarkers,
      successRate,
      averageCompletionTime: 3.5, // Mock data
    };
  };

  // Calculate assassin performance
  const calculateAssassinPerformance = (): AssassinPerformance[] => {
    return assassins.map((assassin) => {
      const assassinMissions = missions.filter(
        (m) => m.assignedTo === assassin.id
      );
      const completedMissions = assassinMissions.filter(
        (m) => m.status === "Completada"
      );
      const failedMissions = assassinMissions.filter(
        (m) => m.status === "Fallida"
      );

      const totalRewards = completedMissions.reduce(
        (sum, m) => sum + m.reward,
        0
      );
      const successRate =
        assassinMissions.length > 0
          ? (completedMissions.length / assassinMissions.length) * 100
          : 0;
      const averageReward =
        completedMissions.length > 0
          ? totalRewards / completedMissions.length
          : 0;

      const bloodMarkersOwed = bloodMarkers.filter(
        (b) => b.debtorId === assassin.id && b.status === "Pendiente"
      ).length;
      const bloodMarkersOwing = bloodMarkers.filter(
        (b) => b.creditorId === assassin.id && b.status === "Pendiente"
      ).length;

      return {
        assassin,
        missionsCompleted: completedMissions.length,
        missionsFailed: failedMissions.length,
        totalRewards,
        successRate,
        averageReward,
        bloodMarkersOwed,
        bloodMarkersOwing,
        lastActivity: assassin.joinDate,
      };
    });
  };

  const metrics = calculateMetrics();
  const assassinPerformance = calculateAssassinPerformance().sort(
    (a, b) => b.missionsCompleted - a.missionsCompleted
  );

  const handleBackToDashboard = () => {
    window.history.back();
  };

  const handleExportReport = () => {
    // Mock export functionality
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange.label,
      metrics,
      topPerformers: assassinPerformance.slice(0, 10),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-sistema-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-orden-100">Acceso Denegado</h2>
          <p className="text-orden-400">
            Solo los administradores pueden acceder a los reportes
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orden-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-orden-300">Generando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orden-900">
      {/* Header */}
      <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orden-100">
                    Reportes del Sistema
                  </h1>
                  <p className="text-sm text-orden-400">
                    Análisis y métricas de rendimiento
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-orden-400" />
                <select
                  value={selectedTimeRange.value}
                  onChange={(e) => {
                    const range = TIME_RANGES.find(
                      (r) => r.value === e.target.value
                    );
                    if (range) setSelectedTimeRange(range);
                  }}
                  className="bg-orden-700 border border-orden-600 rounded px-3 py-1 text-sm text-orden-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {TIME_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Data will refresh automatically with React Query
                  // In production, this would refetch specific queries
                }}
                className="text-orden-300 hover:text-orden-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>

              <Button
                onClick={handleExportReport}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Asesinos Activos"
            value={metrics.activeAssassins}
            total={metrics.totalAssassins}
            icon={<Users className="h-6 w-6" />}
            color="green"
            trend={+2.5}
          />
          <MetricCard
            title="Misiones Completadas"
            value={metrics.completedMissions}
            total={metrics.totalMissions}
            icon={<CheckCircle className="h-6 w-6" />}
            color="blue"
            trend={+15.3}
          />
          <MetricCard
            title="Tasa de Éxito"
            value={`${metrics.successRate.toFixed(1)}%`}
            icon={<Award className="h-6 w-6" />}
            color="gold"
            trend={+5.2}
          />
          <MetricCard
            title="Recompensas Pagadas"
            value={formatCurrency(metrics.totalRewards)}
            icon={<Coins className="h-6 w-6" />}
            color="yellow"
            trend={+8.7}
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mission Status Distribution */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orden-100">
                Estado de Misiones
              </h3>
              <Target className="h-5 w-5 text-orden-400" />
            </div>
            <div className="space-y-4">
              <StatusBar
                label="Completadas"
                value={metrics.completedMissions}
                total={metrics.totalMissions}
                color="green"
              />
              <StatusBar
                label="En Progreso"
                value={metrics.activeMissions}
                total={metrics.totalMissions}
                color="blue"
              />
              <StatusBar
                label="Fallidas"
                value={metrics.failedMissions}
                total={metrics.totalMissions}
                color="red"
              />
            </div>
          </div>

          {/* Assassin Status Distribution */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orden-100">
                Estado de Asesinos
              </h3>
              <Users className="h-5 w-5 text-orden-400" />
            </div>
            <div className="space-y-4">
              <StatusBar
                label="Activos"
                value={metrics.activeAssassins}
                total={metrics.totalAssassins}
                color="green"
              />
              <StatusBar
                label="Retirados"
                value={metrics.retiredAssassins}
                total={metrics.totalAssassins}
                color="yellow"
              />
              <StatusBar
                label="Excommunicados"
                value={metrics.excommunicatedAssassins}
                total={metrics.totalAssassins}
                color="red"
              />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-orden-300">
                Recompensa Promedio
              </h4>
              <DollarSign className="h-4 w-4 text-gold-400" />
            </div>
            <p className="text-2xl font-bold text-gold-400">
              {formatCurrency(metrics.averageReward)}
            </p>
            <p className="text-xs text-orden-500 mt-1">Por misión completada</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-orden-300">
                Marcadores Pendientes
              </h4>
              <Skull className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">
              {metrics.pendingBloodMarkers}
            </p>
            <p className="text-xs text-orden-500 mt-1">
              De {metrics.totalBloodMarkers} totales
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-orden-300">
                Tiempo Promedio
              </h4>
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {metrics.averageCompletionTime} días
            </p>
            <p className="text-xs text-orden-500 mt-1">
              Para completar misiones
            </p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-orden-100">
              Rendimiento de Asesinos
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showDetailedView ? "Vista Simple" : "Vista Detallada"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-orden-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-orden-300">
                    Asesino
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-orden-300">
                    Estado
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-orden-300">
                    Completadas
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-orden-300">
                    Tasa Éxito
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-orden-300">
                    Recompensas
                  </th>
                  {showDetailedView && (
                    <>
                      <th className="text-center py-3 px-4 text-sm font-medium text-orden-300">
                        Deudas
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-orden-300">
                        Última Actividad
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {assassinPerformance.slice(0, 10).map((performance, index) => (
                  <tr
                    key={performance.assassin.id}
                    className="border-b border-orden-800 hover:bg-orden-800/30"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orden-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-orden-200">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-orden-100">
                            {performance.assassin.alias}
                          </p>
                          <p className="text-xs text-orden-400">
                            {performance.assassin.realName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          performance.assassin.status === "Activo"
                            ? "text-green-400 bg-green-500/20"
                            : performance.assassin.status === "Retirado"
                            ? "text-yellow-400 bg-yellow-500/20"
                            : "text-red-400 bg-red-500/20"
                        }`}
                      >
                        {performance.assassin.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-orden-100 font-medium">
                        {performance.missionsCompleted}
                      </span>
                      {performance.missionsFailed > 0 && (
                        <span className="text-red-400 text-xs ml-1">
                          ({performance.missionsFailed} fallidas)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-medium ${
                          performance.successRate >= 80
                            ? "text-green-400"
                            : performance.successRate >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {performance.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gold-400 font-medium">
                        {formatCurrency(performance.totalRewards)}
                      </span>
                      {performance.averageReward > 0 && (
                        <p className="text-xs text-orden-500">
                          Promedio: {formatCurrency(performance.averageReward)}
                        </p>
                      )}
                    </td>
                    {showDetailedView && (
                      <>
                        <td className="py-3 px-4 text-center">
                          <div className="text-xs space-y-1">
                            <div className="text-red-400">
                              Debe: {performance.bloodMarkersOwed}
                            </div>
                            <div className="text-gold-400">
                              Le deben: {performance.bloodMarkersOwing}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs text-orden-400">
                            {formatDate(performance.lastActivity)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assassinPerformance.length === 0 && (
            <div className="text-center py-8 text-orden-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de rendimiento disponibles</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  total,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  color: "green" | "blue" | "gold" | "yellow" | "red";
  trend?: number;
}) {
  const colorClasses = {
    green: "text-green-400 bg-green-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    gold: "text-gold-400 bg-gold-500/20",
    yellow: "text-yellow-400 bg-yellow-500/20",
    red: "text-red-400 bg-red-500/20",
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-orden-300">{title}</h4>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p
            className={`text-2xl font-bold ${
              colorClasses[color].split(" ")[0]
            }`}
          >
            {value}
          </p>
          {total && (
            <p className="text-xs text-orden-500 mt-1">de {total} totales</p>
          )}
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-400" />
            )}
            <span
              className={`text-xs font-medium ${
                trend > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Bar Component
function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "green" | "blue" | "red" | "yellow";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-orden-300">{label}</span>
        <span className="text-sm font-medium text-orden-100">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-orden-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
