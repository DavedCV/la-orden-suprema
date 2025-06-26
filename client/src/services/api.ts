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
  MissionStatus,
  BloodMarker,
  Assassin,
  PaginatedResponse,
  AsassinStatus
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

const MOCK_ASSASSINS: Assassin[] = [
  {
    id: '2',
    email: 'john@orden.com',
    alias: 'Baba Yaga',
    role: 'assassin',
    status: 'Activo',
    realName: 'John Wick',
    goldCoins: 50000,
    joinDate: new Date().toISOString(),
    completedMissions: 127,
    skills: ['Eliminación de alto perfil', 'Combate cuerpo a cuerpo'],
  },
  {
    id: '3',
    email: 'helen@orden.com',
    alias: 'La Sombra',
    role: 'assassin',
    status: 'Activo',
    realName: 'Helen Parker',
    goldCoins: 35000,
    joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    completedMissions: 89,
    skills: ['Infiltración', 'Espionaje', 'Venenos'],
  },
  {
    id: '4',
    email: 'marcus@orden.com',
    alias: 'El Francotirador',
    role: 'assassin',
    status: 'Retirado',
    realName: 'Marcus Young',
    goldCoins: 120000,
    joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5).toISOString(),
    completedMissions: 203,
    skills: ['Francotirador de largo alcance', 'Supervivencia'],
  },
  {
    id: '5',
    email: 'cassian@orden.com',
    alias: 'Cassian',
    role: 'assassin',
    status: 'Excommunicado',
    realName: 'Cassian Volkov',
    goldCoins: 0,
    joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    completedMissions: 45,
    skills: ['Combate cuerpo a cuerpo', 'Armas blancas'],
  },
];

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
        profile: MOCK_ASSASSINS[0],
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

    if (endpoint === '/profile') {
      // Mock detailed profile based on current user role
      // In a real app, this would be determined by the authenticated user
      // For now, we'll simulate based on login credentials
      const isAdmin = false; // This would come from auth context

      if (isAdmin) {
        const mockAdminProfile: User = {
          id: "admin-profile-001",
          alias: "El Director",
          email: "admin@laorden.com",
          role: "admin",
          isFirstLogin: false,
          temporaryPassword: false,
        };

        return {
          success: true,
          data: mockAdminProfile,
        } as ApiResponse<T>;
      } else {
        const mockAssassinProfile: Assassin = {
          id: "assassin-profile-001",
          alias: "El Sombra",
          realName: "Marcus Vega",
          email: "assassin@laorden.com",
          role: "assassin",
          status: "Activo",
          goldCoins: 2500,
          skills: ["Sigilo", "Armas de fuego", "Combate cuerpo a cuerpo", "Infiltración"],
          joinDate: "2023-06-15",
          lastKnownLocation: "Nueva York, Continental Hotel",
          completedMissions: 12,
          isFirstLogin: false,
          temporaryPassword: false,
        };

        return {
          success: true,
          data: mockAssassinProfile,
        } as ApiResponse<T>;
      }
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
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockAssassinDashboard: AssassinDashboard = {
      profile: {
        id: "assassin-001",
        alias: "El Sombra",
        realName: "Marcus Vega",
        email: "assassin@laorden.com",
        role: "assassin",
        status: "Activo",
        goldCoins: 2500,
        skills: ["Sigilo", "Armas de fuego", "Combate cuerpo a cuerpo", "Infiltración"],
        joinDate: "2023-06-15",
        lastKnownLocation: "Nueva York, Continental Hotel",
        completedMissions: 12,
        isFirstLogin: false,
        temporaryPassword: false,
      },
      stats: {
        goldCoins: 2500,
        missionsCompleted: 12,
        successRate: 92,
        bloodMarkersOwed: 2, // Deudas que él debe
        bloodMarkersOwing: 1, // Deudas que le deben
      },
      activeMissions: [
        {
          id: "mission-001",
          title: "Operación Silencio",
          targetName: "Viktor Kozlov",
          description: "Eliminar al traficante de armas en el puerto",
          reward: 5000,
          deadline: "2024-02-15T23:59:59Z",
          status: "En Progreso",
          priority: "high",
          createdAt: "2024-01-20T10:00:00Z",
          updatedAt: "2024-01-22T14:30:00Z",
          assignedTo: "assassin-001",
          assignedAt: "2024-01-20T10:15:00Z",
        },
        {
          id: "mission-002",
          title: "Recuperación de Datos",
          targetName: "Elena Vasquez",
          description: "Obtener información sobre la red de contrabando",
          reward: 3000,
          deadline: "2024-02-20T23:59:59Z",
          status: "Asignada",
          priority: "medium",
          createdAt: "2024-01-25T09:00:00Z",
          updatedAt: "2024-01-25T09:00:00Z",
          assignedTo: "assassin-001",
          assignedAt: "2024-01-25T09:30:00Z",
        }
      ],
      recentActivity: [
        {
          id: "activity-001",
          type: "mission_assigned",
          message: "Nueva misión asignada: Recuperación de Datos",
          timestamp: "2024-01-25T09:30:00Z",
          userId: "2",
        },
        {
          id: "activity-002",
          type: "mission_completed",
          message: "Misión completada: Operación Nocturna - Recompensa: 4,500 monedas",
          timestamp: "2024-01-22T18:45:00Z",
          userId: "2",
        },
        {
          id: "activity-003",
          type: "debt_created",
          message: "Nuevo marcador de sangre: Deuda con John Wick por asistencia",
          timestamp: "2024-01-20T16:20:00Z",
          userId: "2",
        }
      ]
    };

    return {
      success: true,
      data: mockAssassinDashboard,
    };
  }

  async getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return this.request('/dashboard/admin');
  }

  // Assassins Management (Admin only)
  async getAssassins(page = 1, limit = 10): Promise<PaginatedResponse<Assassin>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      data: MOCK_ASSASSINS,
      pagination: {
        page,
        limit,
        total: MOCK_ASSASSINS.length,
        totalPages: Math.ceil(MOCK_ASSASSINS.length / limit),
      },
    };
  }

  async createAssassin(data: CreateAssassinForm & { temporaryPassword?: string; initialStatus?: AsassinStatus }): Promise<ApiResponse<Assassin>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAssassin: Assassin = {
      id: Date.now().toString(),
      email: data.email,
      alias: data.alias,
      role: 'assassin',
      status: data.initialStatus || 'Activo',
      realName: data.realName,
      goldCoins: data.initialGoldCoins || 1000,
      joinDate: new Date().toISOString(),
      completedMissions: 0,
      skills: data.skills,
    };

    // In a real implementation, you would:
    // 1. Hash the temporary password
    // 2. Store it in the database with expiration
    // 3. Send email with credentials
    // 4. Set up first-login flow

    return {
      success: true,
      data: newAssassin,
      message: 'Asesino creado exitosamente con credenciales temporales',
    };
  }

  async updateAssassinStatus(assassinId: string, status: AsassinStatus): Promise<ApiResponse<void>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Updating assassin ${assassinId} status to ${status}`);

    return {
      success: true,
      message: `Estado del asesino actualizado a ${status}`,
    };
  }



  async searchAssassins(query: string): Promise<ApiResponse<Assassin[]>> {
    return this.request(`/assassins/search?q=${encodeURIComponent(query)}`);
  }

  // Missions
  async getMissions(page = 1, limit = 10): Promise<PaginatedResponse<Mission>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockMissions: Mission[] = [
      {
        id: "mission-001",
        title: "Operación Silencio",
        targetName: "Viktor Kozlov",
        description: "Eliminar al traficante de armas en el puerto de Nueva York. Objetivo de alta prioridad con conexiones internacionales.",
        reward: 5000,
        deadline: "2024-02-15T23:59:59Z",
        status: "En Progreso",
        priority: "high",
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-22T14:30:00Z",
        assignedTo: "2",
        assignedAt: "2024-01-20T10:15:00Z",
      },
      {
        id: "mission-002",
        title: "Recuperación de Datos",
        targetName: "Elena Vasquez",
        description: "Obtener información sobre la red de contrabando sin eliminar al objetivo. Operación de infiltración.",
        reward: 3000,
        deadline: "2024-02-20T23:59:59Z",
        status: "Asignada",
        priority: "medium",
        createdAt: "2024-01-25T09:00:00Z",
        updatedAt: "2024-01-25T09:00:00Z",
        assignedTo: "2",
        assignedAt: "2024-01-25T09:30:00Z",
      },
      {
        id: "mission-003",
        title: "Protección Continental",
        targetName: "Marcus Kane",
        description: "Eliminar al asesino rogue que amenaza la neutralidad del Continental Hotel.",
        reward: 7500,
        deadline: "2024-02-10T23:59:59Z",
        status: "No Asignada",
        priority: "high",
        createdAt: "2024-01-28T15:20:00Z",
        updatedAt: "2024-01-28T15:20:00Z",
      },
      {
        id: "mission-004",
        title: "Limpieza de Evidencia",
        targetName: "Detective Rodriguez",
        description: "Eliminar al detective que está investigando las operaciones de La Orden.",
        reward: 4000,
        deadline: "2024-02-25T23:59:59Z",
        status: "No Asignada",
        priority: "medium",
        createdAt: "2024-01-30T11:45:00Z",
        updatedAt: "2024-01-30T11:45:00Z",
      },
      {
        id: "mission-005",
        title: "Operación Nocturna",
        targetName: "Ivan Petrov",
        description: "Misión completada exitosamente. El objetivo fue eliminado sin testigos.",
        reward: 4500,
        deadline: "2024-01-22T23:59:59Z",
        status: "Completada",
        priority: "medium",
        createdAt: "2024-01-15T08:30:00Z",
        updatedAt: "2024-01-22T18:45:00Z",
        assignedTo: "2",
        assignedAt: "2024-01-15T09:00:00Z",
        completedAt: "2024-01-22T18:45:00Z",
      },
      {
        id: "mission-006",
        title: "Infiltración Fallida",
        targetName: "Sarah Connor",
        description: "Misión fallida debido a seguridad imprevista. El objetivo escapó.",
        reward: 3500,
        deadline: "2024-01-18T23:59:59Z",
        status: "Fallida",
        priority: "low",
        createdAt: "2024-01-10T14:20:00Z",
        updatedAt: "2024-01-18T20:30:00Z",
        assignedTo: "assassin-002",
        assignedAt: "2024-01-10T15:00:00Z",
      }
    ];

    return {
      success: true,
      data: mockMissions,
      pagination: {
        page,
        limit,
        total: mockMissions.length,
        totalPages: Math.ceil(mockMissions.length / limit),
      },
    };
  }

  async createMission(data: CreateMissionForm): Promise<ApiResponse<Mission>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 800));

    const newMission: Mission = {
      id: Date.now().toString(),
      title: data.title,
      targetName: data.targetName,
      description: data.description,
      reward: data.reward,
      deadline: data.deadline,
      status: "No Asignada",
      priority: data.priority || "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: newMission,
      message: 'Misión creada exitosamente',
    };
  }

  async updateMission(missionId: string, data: Partial<CreateMissionForm>): Promise<ApiResponse<Mission>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`Updating mission ${missionId} with data:`, data);

    // In a real implementation, you would update the mission in the database
    const updatedMission: Mission = {
      id: missionId,
      title: data.title || "Updated Mission",
      targetName: data.targetName || "Updated Target",
      description: data.description || "Updated description",
      reward: data.reward || 1000,
      deadline: data.deadline || new Date().toISOString(),
      status: "No Asignada",
      priority: data.priority || "medium",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedMission,
      message: 'Misión actualizada exitosamente',
    };
  }

  async assignMission(missionId: string, assassinId: string): Promise<ApiResponse<Mission>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`Assigning mission ${missionId} to assassin ${assassinId}`);

    // In a real implementation, you would update the mission in the database
    const assignedMission: Mission = {
      id: missionId,
      title: "Operación Silencio",
      targetName: "Viktor Kozlov",
      description: "Misión de alta prioridad en territorio enemigo",
      reward: 2500,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Asignada",
      priority: "high",
      assignedTo: assassinId,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: assignedMission,
      message: 'Misión asignada exitosamente',
    };
  }



  async updateMissionStatus(
    missionId: string,
    status: string
  ): Promise<ApiResponse<Mission>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`Updating mission ${missionId} status to ${status}`);

    // In a real implementation, you would update the mission status in the database
    const updatedMission: Mission = {
      id: missionId,
      title: "Operación Silencio",
      targetName: "Viktor Kozlov",
      description: "Misión de alta prioridad actualizada",
      reward: 2500,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: status as MissionStatus,
      priority: "high",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedMission,
      message: `Estado de la misión actualizado a ${status}`,
    };
  }

  // Blood Markers (Debts)
  async getBloodMarkers(): Promise<ApiResponse<BloodMarker[]>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockBloodMarkers: BloodMarker[] = [
      // Deudas que el asesino actual debe (él es el deudor)
      {
        id: "debt-001",
        debtorId: "assassin-001", // El asesino actual
        creditorId: "assassin-002",
        description: "Asistencia durante la misión en el Continental - John Wick proporcionó armas",
        createdAt: "2024-01-20T16:20:00Z",
        status: "Pendiente",
      },
      {
        id: "debt-002",
        debtorId: "assassin-001", // El asesino actual
        creditorId: "assassin-003",
        description: "Información sobre ubicación del objetivo - Sofia Al-Azwar compartió contactos",
        createdAt: "2024-01-18T12:30:00Z",
        status: "Pendiente",
      },
      // Deudas que le deben al asesino actual (él es el acreedor)
      {
        id: "debt-003",
        debtorId: "assassin-004",
        creditorId: "assassin-001", // El asesino actual
        description: "Salvé la vida de Cassian durante enfrentamiento con enemigos",
        createdAt: "2024-01-15T20:45:00Z",
        status: "Pago Pendiente de Confirmación",
        paidAt: "2024-01-22T14:20:00Z",
      }
    ];

    return {
      success: true,
      data: mockBloodMarkers,
    };
  }

  async createBloodMarker(data: CreateBloodMarkerForm): Promise<ApiResponse<BloodMarker>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 800));

    const newBloodMarker: BloodMarker = {
      id: `debt-${Date.now()}`,
      debtorId: data.debtorId,
      creditorId: data.creditorId,
      description: data.description,
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: newBloodMarker,
      message: 'Marcador de sangre creado exitosamente',
    };
  }

  async payBloodMarker(markerId: string): Promise<ApiResponse<BloodMarker>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 600));

    console.log(`Paying blood marker ${markerId}`);

    const updatedMarker: BloodMarker = {
      id: markerId,
      debtorId: "assassin-001",
      creditorId: "assassin-002",
      description: "Favor marcado como pagado",
      status: "Pago Pendiente de Confirmación",
      createdAt: "2024-01-20T16:20:00Z",
      paidAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedMarker,
      message: 'Marcador marcado como pagado. Esperando confirmación del acreedor.',
    };
  }

  async confirmBloodMarkerPayment(markerId: string): Promise<ApiResponse<BloodMarker>> {
    // Mock implementation for now
    await new Promise(resolve => setTimeout(resolve, 600));

    console.log(`Confirming blood marker payment ${markerId}`);

    const confirmedMarker: BloodMarker = {
      id: markerId,
      debtorId: "assassin-001",
      creditorId: "assassin-002",
      description: "Favor confirmado y saldado",
      status: "Saldado",
      createdAt: "2024-01-20T16:20:00Z",
      paidAt: "2024-01-22T14:20:00Z",
      confirmedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: confirmedMarker,
      message: 'Pago confirmado. El marcador de sangre ha sido saldado.',
    };
  }

  // Profile Management
  async getProfile(): Promise<ApiResponse<User | Assassin>> {
    return this.request('/profile');
  }

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
