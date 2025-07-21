import type { Mission } from "../../../shared/types";

export const MISSION_CONSTANTS = {
  URGENT_DAYS_THRESHOLD: 7,
  PRIORITY_ORDER: { high: 3, medium: 2, low: 1 } as const,
} as const;

export interface MissionTimeInfo {
  daysRemaining: number;
  isUrgent: boolean;
  isOverdue: boolean;
  timeLabel: string;
}

export interface PriorityInfo {
  color: string;
  label: string;
}

/**
 * Calculate time-related information for a mission
 */
export function getMissionTimeInfo(deadline: string): MissionTimeInfo {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isUrgent = daysRemaining <= MISSION_CONSTANTS.URGENT_DAYS_THRESHOLD && daysRemaining > 0;
  const isOverdue = daysRemaining < 0;

  let timeLabel: string;
  if (isOverdue) {
    timeLabel = `${Math.abs(daysRemaining)} días vencida`;
  } else if (daysRemaining === 0) {
    timeLabel = "Vence hoy";
  } else {
    timeLabel = `${daysRemaining} días restantes`;
  }

  return {
    daysRemaining,
    isUrgent,
    isOverdue,
    timeLabel,
  };
}

/**
 * Get priority styling and label information
 */
export function getPriorityInfo(priority?: string): PriorityInfo {
  switch (priority) {
    case "high":
      return {
        color: "text-red-400 bg-red-500/20 border-red-500/30",
        label: "Alta",
      };
    case "medium":
      return {
        color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
        label: "Media",
      };
    case "low":
      return {
        color: "text-green-400 bg-green-500/20 border-green-500/30",
        label: "Baja",
      };
    default:
      return {
        color: "text-orden-400 bg-orden-500/20 border-orden-500/30",
        label: "Media",
      };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Filter missions based on search and priority criteria
 */
export function filterMissions(
  missions: Mission[],
  searchQuery: string,
  priorityFilter: string
): Mission[] {
  return missions.filter((mission) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      mission.title.toLowerCase().includes(searchLower) ||
      mission.description.toLowerCase().includes(searchLower) ||
      mission.targetName?.toLowerCase().includes(searchLower);

    const matchesPriority =
      priorityFilter === "all" || mission.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });
}

/**
 * Sort missions based on specified criteria
 */
export function sortMissions(
  missions: Mission[],
  sortBy: "deadline" | "reward" | "priority"
): Mission[] {
  return [...missions].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "reward":
        return b.reward - a.reward;
      case "priority":
        return (
          MISSION_CONSTANTS.PRIORITY_ORDER[b.priority || "medium"] -
          MISSION_CONSTANTS.PRIORITY_ORDER[a.priority || "medium"]
        );
      default:
        return 0;
    }
  });
}

/**
 * Calculate mission statistics
 */
export function getMissionStats(missions: Mission[]) {
  const total = missions.length;
  const highPriority = missions.filter((m) => m.priority === "high").length;
  const maxReward = total > 0 ? Math.max(...missions.map((m) => m.reward)) : 0;
  const urgent = missions.filter((m) => {
    const { isUrgent } = getMissionTimeInfo(m.deadline);
    return isUrgent;
  }).length;

  return {
    total,
    highPriority,
    maxReward,
    urgent,
  };
}

/**
 * Get mission card styling based on time info
 */
export function getMissionCardStyling(timeInfo: MissionTimeInfo): string {
  let baseClasses = "card p-6 hover:border-gold-500/30 transition-all";

  if (timeInfo.isOverdue) {
    baseClasses += " border-red-500/30 bg-red-500/5";
  } else if (timeInfo.isUrgent) {
    baseClasses += " border-yellow-500/30 bg-yellow-500/5";
  }

  return baseClasses;
}
