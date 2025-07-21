// User and Authentication Types
export type UserRole = 'assassin' | 'admin';

export type AsassinStatus = 'Activo' | 'Retirado' | 'Excommunicado';

export interface User {
  id: string;
  alias: string;
  email: string;
  role: UserRole;
  isFirstLogin?: boolean;
  temporaryPassword?: boolean;
}

export interface Assassin extends User {
  status: AsassinStatus;
  realName?: string;
  lastKnownLocation?: string;
  goldCoins: number;
  skills?: string[];
  joinDate: string;
  completedMissions: number;
}

// Mission Types
export type MissionStatus = 'No Asignada' | 'Asignada' | 'En Progreso' | 'Completada' | 'Fallida' | 'in_progress';

export interface Mission {
  id: string;
  title: string;
  targetName?: string;
  description: string;
  reward: number;
  deadline: string;
  status: MissionStatus;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Assassin ID
  assignedAt?: string;
  completedAt?: string;
  createdBy?: string; // Admin ID
}

// Blood Marker (Debt) Types
export type BloodMarkerStatus = 'Solicitud Pendiente' | 'Pendiente' | 'Pago Pendiente de Confirmación' | 'Saldado' | 'Rechazada';

export interface BloodMarker {
  id: string;
  debtorId: string;
  creditorId: string;
  description: string;
  createdAt: string;
  status: BloodMarkerStatus;
  paidAt?: string;
  confirmedAt?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateAssassinForm {
  alias: string;
  email: string;
  realName: string;
  skills: string[];
  initialGoldCoins?: number;
}

export interface CreateMissionForm {
  title: string;
  targetName: string;
  description: string;
  reward: number;
  deadline: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateBloodMarkerForm {
  debtorId: string;
  creditorId: string;
  description: string;
}

export interface RespondToBloodMarkerForm {
  markerId: string;
  accepted: boolean;
  rejectionReason?: string;
}

// Dashboard Data Types
export interface AssassinDashboard {
  profile: Assassin;
  stats: {
    goldCoins: number;
    missionsCompleted: number;
    successRate: number;
    bloodMarkersOwed: number;
    bloodMarkersOwing: number;
  };
  activeMissions: Mission[];
  recentActivity: Activity[];
}

export interface AdminDashboard {
  stats: {
    totalAssassins: number;
    activeAssassins: number;
    totalMissions: number;
    activeMissions: number;
    completedMissions: number;
    totalGoldCoins: number;
    outstandingBloodMarkers: number;
  };
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'mission_assigned' | 'mission_completed' | 'debt_created' | 'debt_paid' | 'assassin_created' | 'assassin_joined';
  message: string;
  timestamp: string;
  userId?: string;
}

// UI State Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
