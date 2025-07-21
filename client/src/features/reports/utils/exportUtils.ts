import { formatDate, formatCurrency } from "../../../shared/utils";
import type { SystemMetrics, AssassinPerformance } from "../types";

export interface ReportData {
  generatedAt: string;
  timeRange: string;
  metrics: SystemMetrics;
  topPerformers: AssassinPerformance[];
}

export type ExportFormat = "json" | "csv";

export class ReportExporter {
  static exportJSON(data: ReportData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    this.downloadFile(blob, `reporte-sistema-${this.getDateString()}.json`);
  }

  static exportCSV(data: ReportData): void {
    const csvContent = this.generateCSVContent(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    this.downloadFile(blob, `reporte-sistema-${this.getDateString()}.csv`);
  }

  private static generateCSVContent(data: ReportData): string {
    let csv = `Reporte del Sistema La Orden Suprema\n`;
    csv += `Generado el: ${formatDate(data.generatedAt)}\n`;
    csv += `Período: ${data.timeRange}\n\n`;

    // System Metrics
    csv += `MÉTRICAS DEL SISTEMA\n`;
    csv += `Métrica,Valor\n`;
    csv += `Total de Asesinos,${data.metrics.totalAssassins}\n`;
    csv += `Asesinos Activos,${data.metrics.activeAssassins}\n`;
    csv += `Asesinos Retirados,${data.metrics.retiredAssassins}\n`;
    csv += `Asesinos Excomunicados,${data.metrics.excommunicatedAssassins}\n`;
    csv += `Total de Misiones,${data.metrics.totalMissions}\n`;
    csv += `Misiones Completadas,${data.metrics.completedMissions}\n`;
    csv += `Misiones Fallidas,${data.metrics.failedMissions}\n`;
    csv += `Misiones Activas,${data.metrics.activeMissions}\n`;
    csv += `Total de Recompensas,"${formatCurrency(data.metrics.totalRewards)}"\n`;
    csv += `Recompensa Promedio,"${formatCurrency(data.metrics.averageReward)}"\n`;
    csv += `Tasa de Éxito,${data.metrics.successRate.toFixed(1)}%\n`;
    csv += `Tiempo Promedio de Completación,${data.metrics.averageCompletionTime.toFixed(1)} días\n`;
    csv += `Total de Marcadores de Sangre,${data.metrics.totalBloodMarkers}\n`;
    csv += `Marcadores Pendientes,${data.metrics.pendingBloodMarkers}\n\n`;

    // Top Performers
    csv += `RENDIMIENTO DE ASESINOS\n`;
    csv += `Posición,Alias,Nombre Real,Estado,Misiones Completadas,Misiones Fallidas,Tasa de Éxito,Recompensas Totales,Recompensa Promedio,Marcadores Debe,Marcadores Le Deben,Última Actividad\n`;

    data.topPerformers.forEach((performer, index) => {
      csv += `${index + 1},"${performer.assassin.alias}","${performer.assassin.realName}","${performer.assassin.status}",${performer.missionsCompleted},${performer.missionsFailed},${performer.successRate.toFixed(1)}%,"${formatCurrency(performer.totalRewards)}","${formatCurrency(performer.averageReward)}",${performer.bloodMarkersOwed},${performer.bloodMarkersOwing},"${formatDate(performer.lastActivity)}"\n`;
    });

    return csv;
  }

  private static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static getDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  static generateSummaryReport(data: ReportData): string {
    const { metrics } = data;
    const efficiencyRate = metrics.totalMissions > 0
      ? ((metrics.completedMissions / metrics.totalMissions) * 100).toFixed(1)
      : "0";

    return `
📊 RESUMEN EJECUTIVO - LA ORDEN SUPREMA

📅 Período: ${data.timeRange}
🗓️ Generado: ${formatDate(data.generatedAt)}

👥 ESTADO DE LA ORGANIZACIÓN
• Asesinos Activos: ${metrics.activeAssassins}/${metrics.totalAssassins} (${((metrics.activeAssassins/metrics.totalAssassins)*100).toFixed(1)}%)
• Asesinos Retirados: ${metrics.retiredAssassins}
• Asesinos Excomunicados: ${metrics.excommunicatedAssassins}

🎯 RENDIMIENTO DE MISIONES
• Misiones Completadas: ${metrics.completedMissions}/${metrics.totalMissions} (${efficiencyRate}%)
• Tasa de Éxito: ${metrics.successRate.toFixed(1)}%
• Misiones Activas: ${metrics.activeMissions}
• Tiempo Promedio: ${metrics.averageCompletionTime.toFixed(1)} días

💰 FINANZAS
• Recompensas Pagadas: ${formatCurrency(metrics.totalRewards)}
• Recompensa Promedio: ${formatCurrency(metrics.averageReward)}

🩸 MARCADORES DE SANGRE
• Marcadores Pendientes: ${metrics.pendingBloodMarkers}/${metrics.totalBloodMarkers}

🏆 TOP 3 ASESINOS
${data.topPerformers.slice(0, 3).map((p, i) =>
  `${i + 1}. ${p.assassin.alias} - ${p.missionsCompleted} misiones (${p.successRate.toFixed(1)}% éxito)`
).join('\n')}
    `.trim();
  }
}
