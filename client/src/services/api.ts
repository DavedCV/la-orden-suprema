import type {
  ApiResponse,
  LoginForm,
  User,
  AssassinDashboard,
  AdminDashboard,
  CreateAssassinForm,
  CreateMissionForm,
  CreateBloodMarkerForm,
  Mission,
  BloodMarker,
  Assassin,
  PaginatedResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock data for development
const MOCK_USERS: { [key: string]: User } = {
  'admin@orden.com': {
    id: '1',
    email: 'admin@orden.com',
    alias: 'El Director',
    role: 'admin',
  },
  'john@orden.com': {
    id: '2',
    email: 'john@orden.com',
    alias: 'Baba Yaga',
    role: 'assassin',
  },
};

const MOCK_ASSASSINS: { [key: string]: Assassin } = {
  'john@orden.com': {
    id: '2',
    email: 'john@orden.com',
    alias: 'Baba Yaga',
    role: 'assassin',
    status: 'Activo',
    goldCoins: 50000,
    joinDate: new Date().toISOString(),
    completedMissions: 127,
    skills: ['Eliminación de alto perfil', 'Combate cuerpo a cuerpo'],
  },
};

const MOCK_PASSWORDS: { [key: string]: string } = {
  'admin@orden.com': 'admin123',
  'john@orden.com': 'wick123',
};

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check if we're in development mode and use mock data
    if (import.meta.env.DEV && endpoint.startsWith('/auth/')) {
      return this.handleMockAuth<T>(endpoint, options);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);

      // In development, return mock data for other endpoints too
      if (import.meta.env.DEV) {
        return this.handleMockRequest<T>(endpoint);
      }

      throw error;
    }
  }

  private async handleMockAuth<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint === '/auth/login' && options.method === 'POST') {
      const body = JSON.parse(options.body as string) as LoginForm;
      const user = MOCK_USERS[body.email];
      const password = MOCK_PASSWORDS[body.email];

      if (!user || password !== body.password) {
        return {
          success: false,
          message: 'Credenciales inválidas',
        } as ApiResponse<T>;
      }

      const token = `mock-token-${user.id}-${Date.now()}`;

      return {
        success: true,
        data: { user, token },
        message: 'Login exitoso',
      } as ApiResponse<T>;
    }

    if (endpoint === '/auth/validate') {
      const token = localStorage.getItem('token');
      if (!token || !token.startsWith('mock-token-')) {
        throw new Error('Token inválido');
      }

      const userId = token.split('-')[2];
      const user = Object.values(MOCK_USERS).find(u => u.id === userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        data: user,
        message: 'Token válido',
      } as ApiResponse<T>;
    }

    if (endpoint === '/auth/logout') {
      return {
        success: true,
        message: 'Logout exitoso',
      } as ApiResponse<T>;
    }

    throw new Error('Endpoint no implementado en modo mock');
  }

  private async handleMockRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock dashboard data
    if (endpoint === '/dashboard/admin') {
      const mockAdminDashboard: AdminDashboard = {
        stats: {
          totalAssassins: 15,
          activeAssassins: 12,
          totalMissions: 45,
          activeMissions: 8,
          completedMissions: 32,
          totalGoldCoins: 2500000,
          outstandingBloodMarkers: 3,
        },
        recentActivity: [
          {
            id: '1',
            type: 'mission_completed',
            message: 'Baba Yaga completó la misión "Eliminación en el Continental"',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: '2',
            type: 'assassin_joined',
            message: 'Nuevo asesino "La Sombra" se unió a la orden',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
        ],
      };

      return {
        success: true,
        data: mockAdminDashboard,
      } as ApiResponse<T>;
    }

    if (endpoint === '/dashboard/assassin') {
      const mockAssassinDashboard: AssassinDashboard = {
        profile: MOCK_ASSASSINS['john@orden.com'],
        stats: {
          goldCoins: 50000,
          missionsCompleted: 127,
          successRate: 98.5,
          bloodMarkersOwed: 1,
          bloodMarkersOwing: 0,
        },
        activeMissions: [
          {
            id: '1',
            title: 'Eliminación en el Continental',
            description: 'Objetivo de alto perfil en territorio neutral',
            reward: 25000,
            status: 'in_progress',
            priority: 'high',
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        recentActivity: [
          {
            id: '1',
            type: 'mission_assigned',
            message: 'Nueva misión asignada: "Eliminación en el Continental"',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        ],
      };

      return {
        success: true,
        data: mockAssassinDashboard,
      } as ApiResponse<T>;
    }

    throw new Error(`Mock endpoint ${endpoint} no implementado`);
  }

  // Authentication
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async validateToken(): Promise<ApiResponse<User>> {
    return this.request('/auth/validate');
  }

  // Dashboard
  async getAssassinDashboard(): Promise<ApiResponse<AssassinDashboard>> {
    return this.request('/dashboard/assassin');
  }

  async getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return this.request('/dashboard/admin');
  }

  // Assassins Management (Admin only)
  async getAssassins(page = 1, limit = 10): Promise<PaginatedResponse<Assassin>> {
    return this.request(`/assassins?page=${page}&limit=${limit}`) as Promise<PaginatedResponse<Assassin>>;
  }

  async createAssassin(data: CreateAssassinForm): Promise<ApiResponse<Assassin>> {
    return this.request('/assassins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssassinStatus(
    assassinId: string,
    status: string
  ): Promise<ApiResponse<Assassin>> {
    return this.request(`/assassins/${assassinId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async searchAssassins(query: string): Promise<ApiResponse<Assassin[]>> {
    return this.request(`/assassins/search?q=${encodeURIComponent(query)}`);
  }

  // Missions
  async getMissions(page = 1, limit = 10): Promise<PaginatedResponse<Mission>> {
    return this.request(`/missions?page=${page}&limit=${limit}`) as Promise<PaginatedResponse<Mission>>;
  }

  async createMission(data: CreateMissionForm): Promise<ApiResponse<Mission>> {
    return this.request('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignMission(
    missionId: string,
    assassinId: string
  ): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${missionId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assassinId }),
    });
  }

  async updateMissionStatus(
    missionId: string,
    status: string
  ): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${missionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Blood Markers (Debts)
  async getBloodMarkers(): Promise<ApiResponse<BloodMarker[]>> {
    return this.request('/blood-markers');
  }

  async createBloodMarker(data: CreateBloodMarkerForm): Promise<ApiResponse<BloodMarker>> {
    return this.request('/blood-markers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async payBloodMarker(markerId: string): Promise<ApiResponse<BloodMarker>> {
    return this.request(`/blood-markers/${markerId}/pay`, {
      method: 'PATCH',
    });
  }

  async confirmBloodMarkerPayment(markerId: string): Promise<ApiResponse<BloodMarker>> {
    return this.request(`/blood-markers/${markerId}/confirm`, {
      method: 'PATCH',
    });
  }

  // Profile Management
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return this.request('/profile/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export const apiService = new ApiService();
