import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../shared/store/authStore";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { apiService } from "../../../shared/services/api";
import {
  ArrowLeft,
  BarChart3,
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
import { MetricCard } from "./MetricCard";
import { StatusBar } from "./StatusBar";
import { ErrorDisplay } from "./ErrorDisplay";
import { ReportExporter } from "../utils/exportUtils";
import type { SystemMetrics, AssassinPerformance, TimeRange } from "../types";

const TIME_RANGES: TimeRange[] = [
  { label: "Últimos 7 días", value: "7d", days: 7 },
  { label: "Últimos 30 días", value: "30d", days: 30 },
  { label: "Últimos 90 días", value: "90d", days: 90 },
  { label: "Todo el tiempo", value: "all", days: 0 },
];

const TOP_PERFORMERS_LIMIT = 10;

export function ReportsPage() {
  const { user } = useAuthStore();
  const { goBack } = useNavigation();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TIME_RANGES[1]
  );
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== "admin") {
      goBack();
    }
  }, [user, goBack]);

  // Fetch data with error handling
  const {
    data: assassinsData,
    isLoading: isLoadingAssassins,
    error: assassinsError,
    refetch: refetchAssassins,
  } = useQuery({
    queryKey: ["assassins"],
    queryFn: () => apiService.getAssassins(),
    retry: 2,
  });

  const {
    data: missionsData,
    isLoading: isLoadingMissions,
    error: missionsError,
    refetch: refetchMissions,
  } = useQuery({
    queryKey: ["missions"],
    queryFn: () => apiService.getMissions(),
    retry: 2,
  });

  const {
    data: bloodMarkersData,
    isLoading: isLoadingMarkers,
    error: markersError,
    refetch: refetchMarkers,
  } = useQuery({
    queryKey: ["blood-markers"],
    queryFn: () => apiService.getBloodMarkers(),
    retry: 2,
  });

  const assassins = assassinsData?.data || [];
  const missions = missionsData?.data || [];
  const bloodMarkers = bloodMarkersData?.data || [];
  const isLoading = isLoadingAssassins || isLoadingMissions || isLoadingMarkers;
  const hasError = assassinsError || missionsError || markersError;

  // Memoized calculations for better performance
  const metrics = useMemo((): SystemMetrics => {
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

    // Calculate actual average completion time from missions data
    const completedMissionsWithDates = missions.filter(
      (m) => m.status === "Completada" && m.createdAt && m.completedAt
    );

    const averageCompletionTime =
      completedMissionsWithDates.length > 0
        ? completedMissionsWithDates.reduce((sum, m) => {
            const start = new Date(m.createdAt!).getTime();
            const end = new Date(m.completedAt!).getTime();
            return sum + (end - start) / (1000 * 60 * 60 * 24); // days
          }, 0) / completedMissionsWithDates.length
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
      averageCompletionTime,
    };
  }, [assassins, missions, bloodMarkers]);

  // Memoized assassin performance calculation
  const assassinPerformance = useMemo((): AssassinPerformance[] => {
    return assassins
      .map((assassin) => {
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
      })
      .sort((a, b) => b.missionsCompleted - a.missionsCompleted);
  }, [assassins, missions, bloodMarkers]);

  // Callback handlers for better performance
  const handleBackToDashboard = useCallback(() => {
    window.history.back();
  }, []);

  const handleTimeRangeChange = useCallback((value: string) => {
    const range = TIME_RANGES.find((r) => r.value === value);
    if (range) setSelectedTimeRange(range);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchAssassins();
    refetchMissions();
    refetchMarkers();
  }, [refetchAssassins, refetchMissions, refetchMarkers]);

  const handleExportReport = useCallback(() => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange.label,
      metrics,
      topPerformers: assassinPerformance.slice(0, TOP_PERFORMERS_LIMIT),
    };

    if (exportFormat === "csv") {
      ReportExporter.exportCSV(reportData);
    } else {
      ReportExporter.exportJSON(reportData);
    }
  }, [selectedTimeRange, metrics, assassinPerformance, exportFormat]);

  // Access control check
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

  // Error handling
  if (hasError) {
    const errorMessage =
      assassinsError?.message ||
      missionsError?.message ||
      markersError?.message ||
      "Error desconocido al cargar los datos";
    return <ErrorDisplay message={errorMessage} onRetry={handleRefresh} />;
  }

  // Loading state
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
          {/* Mobile layout: stack vertically */}
          <div className="flex flex-col space-y-4 py-4 sm:hidden">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="bg-purple-500/20 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>

              <div className="flex-1">
                <h1 className="text-lg font-bold text-orden-100">
                  Reportes del Sistema
                </h1>
                <p className="text-sm text-orden-400">Análisis y métricas</p>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-orden-400" aria-hidden="true" />
                <select
                  id="time-range-select-mobile"
                  value={selectedTimeRange.value}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="flex-1 bg-orden-700 border border-orden-600 rounded px-3 py-2 text-sm text-orden-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filtro de rango de tiempo"
                >
                  {TIME_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-orden-300 hover:text-orden-100 flex-1 justify-center"
                  aria-label="Actualizar datos"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Actualizar
                </Button>

                <select
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as "json" | "csv")
                  }
                  className="bg-orden-700 border border-orden-600 rounded px-3 py-2 text-sm text-orden-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Formato de exportación"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>

                <Button
                  onClick={handleExportReport}
                  className="bg-purple-600 hover:bg-purple-700"
                  aria-label="Exportar reporte"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop layout: horizontal */}
          <div className="hidden sm:flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-orden-300 hover:text-orden-100"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <div
                  className="bg-purple-500/20 p-2 rounded-lg"
                  aria-hidden="true"
                >
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
                <Filter className="h-4 w-4 text-orden-400" aria-hidden="true" />
                <label htmlFor="time-range-select" className="sr-only">
                  Seleccionar rango de tiempo
                </label>
                <select
                  id="time-range-select"
                  value={selectedTimeRange.value}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="bg-orden-700 border border-orden-600 rounded px-3 py-1 text-sm text-orden-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filtro de rango de tiempo"
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
                onClick={handleRefresh}
                className="text-orden-300 hover:text-orden-100 hidden lg:flex"
                aria-label="Actualizar datos"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Actualizar
              </Button>

              {/* Refresh button for medium screens */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-orden-300 hover:text-orden-100 lg:hidden"
                aria-label="Actualizar datos"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </Button>

              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as "json" | "csv")
                  }
                  className="bg-orden-700 border border-orden-600 rounded px-3 py-2 text-sm text-orden-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Formato de exportación"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>

                <Button
                  onClick={handleExportReport}
                  className="bg-purple-600 hover:bg-purple-700"
                  aria-label="Exportar reporte"
                >
                  <Download className="h-4 w-4 lg:mr-2" aria-hidden="true" />
                  <span className="hidden lg:inline">Exportar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Overview Cards */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">
            Resumen general del sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Asesinos Activos"
              value={metrics.activeAssassins}
              total={metrics.totalAssassins}
              icon={<Users className="h-6 w-6" />}
              color="green"
              trend={+2.5}
              aria-label={`Asesinos activos: ${metrics.activeAssassins} de ${metrics.totalAssassins} totales`}
            />
            <MetricCard
              title="Misiones Completadas"
              value={metrics.completedMissions}
              total={metrics.totalMissions}
              icon={<CheckCircle className="h-6 w-6" />}
              color="blue"
              trend={+15.3}
              aria-label={`Misiones completadas: ${metrics.completedMissions} de ${metrics.totalMissions} totales`}
            />
            <MetricCard
              title="Tasa de Éxito"
              value={`${metrics.successRate.toFixed(1)}%`}
              icon={<Award className="h-6 w-6" />}
              color="gold"
              trend={+5.2}
              aria-label={`Tasa de éxito: ${metrics.successRate.toFixed(
                1
              )} por ciento`}
            />
            <MetricCard
              title="Recompensas Pagadas"
              value={formatCurrency(metrics.totalRewards)}
              icon={<Coins className="h-6 w-6" />}
              color="yellow"
              trend={+8.7}
              aria-label={`Recompensas pagadas: ${formatCurrency(
                metrics.totalRewards
              )}`}
            />
          </div>
        </section>

        {/* Detailed Metrics */}
        <section aria-labelledby="detailed-metrics-heading">
          <h2 id="detailed-metrics-heading" className="sr-only">
            Métricas detalladas
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Mission Status Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-orden-100">
                  Estado de Misiones
                </h3>
                <Target className="h-5 w-5 text-orden-400" aria-hidden="true" />
              </div>
              <div className="space-y-4">
                <StatusBar
                  label="Completadas"
                  value={metrics.completedMissions}
                  total={metrics.totalMissions}
                  color="green"
                  aria-label={`Misiones completadas: ${metrics.completedMissions} de ${metrics.totalMissions}`}
                />
                <StatusBar
                  label="En Progreso"
                  value={metrics.activeMissions}
                  total={metrics.totalMissions}
                  color="blue"
                  aria-label={`Misiones en progreso: ${metrics.activeMissions} de ${metrics.totalMissions}`}
                />
                <StatusBar
                  label="Fallidas"
                  value={metrics.failedMissions}
                  total={metrics.totalMissions}
                  color="red"
                  aria-label={`Misiones fallidas: ${metrics.failedMissions} de ${metrics.totalMissions}`}
                />
              </div>
            </div>

            {/* Assassin Status Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-orden-100">
                  Estado de Asesinos
                </h3>
                <Users className="h-5 w-5 text-orden-400" aria-hidden="true" />
              </div>
              <div className="space-y-4">
                <StatusBar
                  label="Activos"
                  value={metrics.activeAssassins}
                  total={metrics.totalAssassins}
                  color="green"
                  aria-label={`Asesinos activos: ${metrics.activeAssassins} de ${metrics.totalAssassins}`}
                />
                <StatusBar
                  label="Retirados"
                  value={metrics.retiredAssassins}
                  total={metrics.totalAssassins}
                  color="yellow"
                  aria-label={`Asesinos retirados: ${metrics.retiredAssassins} de ${metrics.totalAssassins}`}
                />
                <StatusBar
                  label="Excommunicados"
                  value={metrics.excommunicatedAssassins}
                  total={metrics.totalAssassins}
                  color="red"
                  aria-label={`Asesinos excommunicados: ${metrics.excommunicatedAssassins} de ${metrics.totalAssassins}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Additional Stats */}
        <section aria-labelledby="additional-stats-heading">
          <h2 id="additional-stats-heading" className="sr-only">
            Estadísticas adicionales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-orden-300">
                  Recompensa Promedio
                </h4>
                <DollarSign
                  className="h-4 w-4 text-gold-400"
                  aria-hidden="true"
                />
              </div>
              <p className="text-2xl font-bold text-gold-400">
                {formatCurrency(metrics.averageReward)}
              </p>
              <p className="text-xs text-orden-500 mt-1">
                Por misión completada
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-orden-300">
                  Marcadores Pendientes
                </h4>
                <Skull className="h-4 w-4 text-red-400" aria-hidden="true" />
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
                <Clock className="h-4 w-4 text-blue-400" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {metrics.averageCompletionTime > 0
                  ? `${metrics.averageCompletionTime.toFixed(1)} días`
                  : "No disponible"}
              </p>
              <p className="text-xs text-orden-500 mt-1">
                Para completar misiones
              </p>
            </div>
          </div>
        </section>

        {/* Top Performers */}
        <section aria-labelledby="performance-heading">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3
                id="performance-heading"
                className="text-lg font-semibold text-orden-100"
              >
                Rendimiento de Asesinos
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                  aria-pressed={showDetailedView}
                  aria-label={
                    showDetailedView
                      ? "Cambiar a vista simple"
                      : "Cambiar a vista detallada"
                  }
                >
                  <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  {showDetailedView ? "Vista Simple" : "Vista Detallada"}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className="w-full"
                role="table"
                aria-label="Tabla de rendimiento de asesinos"
              >
                <thead>
                  <tr className="border-b border-orden-700">
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-orden-300"
                      scope="col"
                    >
                      Asesino
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-orden-300"
                      scope="col"
                    >
                      Estado
                    </th>
                    <th
                      className="text-center py-3 px-4 text-sm font-medium text-orden-300"
                      scope="col"
                    >
                      Completadas
                    </th>
                    <th
                      className="text-center py-3 px-4 text-sm font-medium text-orden-300"
                      scope="col"
                    >
                      Tasa Éxito
                    </th>
                    <th
                      className="text-right py-3 px-4 text-sm font-medium text-orden-300"
                      scope="col"
                    >
                      Recompensas
                    </th>
                    {showDetailedView && (
                      <>
                        <th
                          className="text-center py-3 px-4 text-sm font-medium text-orden-300"
                          scope="col"
                        >
                          Deudas
                        </th>
                        <th
                          className="text-center py-3 px-4 text-sm font-medium text-orden-300"
                          scope="col"
                        >
                          Última Actividad
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {assassinPerformance
                    .slice(0, TOP_PERFORMERS_LIMIT)
                    .map((performance, index) => (
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
                              Promedio:{" "}
                              {formatCurrency(performance.averageReward)}
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
        </section>
      </main>
    </div>
  );
}
