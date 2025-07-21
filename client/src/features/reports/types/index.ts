import type { Assassin } from "../../../shared/types";

export interface SystemMetrics {
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

export interface AssassinPerformance {
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

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}
