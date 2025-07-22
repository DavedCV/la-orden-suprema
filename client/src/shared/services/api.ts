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
  PaginatedResponse,
  AsassinStatus,
  RespondToBloodMarkerForm,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        // If validation errors exist, include them in the error message
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(`${data.message}: ${data.errors.join(", ")}`);
        }

        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);

      // Re-throw the error with proper structure
      throw {
        success: false,
        message:
          error instanceof Error ? error.message : "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async requestPaginated<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);

      // Re-throw the error with proper structure
      throw {
        success: false,
        message:
          error instanceof Error ? error.message : "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Authentication
  async login(
    credentials: LoginForm
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async validateToken(): Promise<ApiResponse<User>> {
    return this.request("/auth/validate");
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  // Dashboard
  async getAssassinDashboard(): Promise<ApiResponse<AssassinDashboard>> {
    return this.request("/dashboard/assassin");
  }

  async getAdminDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return this.request("/dashboard/admin");
  }

  // Assassins Management (Admin only)
  async getAssassins(
    page = 1,
    limit = 10,
    filters?: {
      status?: AsassinStatus;
      search?: string;
    }
  ): Promise<PaginatedResponse<Assassin>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
    });

    return this.requestPaginated(`/assassins?${params.toString()}`);
  }

  async getAssassin(assassinId: string): Promise<ApiResponse<Assassin>> {
    return this.request(`/assassins/${assassinId}`);
  }

  async createAssassin(
    data: CreateAssassinForm & {
      temporaryPassword?: string;
      initialStatus?: AsassinStatus;
    }
  ): Promise<ApiResponse<Assassin>> {
    return this.request("/assassins", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAssassin(
    assassinId: string,
    data: Partial<CreateAssassinForm>
  ): Promise<ApiResponse<Assassin>> {
    return this.request(`/profile/assassin/${assassinId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updateAssassinStatus(
    assassinId: string,
    status: AsassinStatus
  ): Promise<ApiResponse<void>> {
    return this.request(`/assassins/${assassinId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async deleteAssassin(assassinId: string): Promise<ApiResponse<void>> {
    return this.request(`/assassins/${assassinId}`, {
      method: "DELETE",
    });
  }

  async searchAssassins(query: string): Promise<ApiResponse<Assassin[]>> {
    return this.request(`/assassins/search?q=${encodeURIComponent(query)}`);
  }

  // Missions
  async getMissions(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      priority?: string;
      assignedTo?: string;
    }
  ): Promise<PaginatedResponse<Mission>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
    });

    return this.requestPaginated(`/missions?${params.toString()}`);
  }

  async getMission(missionId: string): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${missionId}`);
  }

  async getAvailableMissions(): Promise<ApiResponse<Mission[]>> {
    return this.request("/missions/available");
  }

  async getAssassinMissions(): Promise<ApiResponse<Mission[]>> {
    return this.request("/missions/my-missions");
  }

  async createMission(data: CreateMissionForm): Promise<ApiResponse<Mission>> {
    return this.request("/missions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMission(
    missionId: string,
    data: Partial<CreateMissionForm>
  ): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${missionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async assignMission(
    missionId: string,
    assassinId: string
  ): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${missionId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assassinId }),
    });
  }

  async updateMissionStatus(
    missionId: string,
    status: string
  ): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${missionId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async deleteMission(missionId: string): Promise<ApiResponse<void>> {
    return this.request(`/missions/${missionId}`, {
      method: "DELETE",
    });
  }

  async applyToMission(missionId: string): Promise<ApiResponse<void>> {
    return this.request(`/missions/${missionId}/apply`, {
      method: "POST",
    });
  }

  // Blood Markers (Debts)
  async getBloodMarkers(filters?: {
    status?: string;
    type?: "owed" | "owing" | "all";
  }): Promise<ApiResponse<BloodMarker[]>> {
    const params = new URLSearchParams({
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
    });

    const queryString = params.toString();
    return this.request(
      `/blood-markers${queryString ? `?${queryString}` : ""}`
    );
  }

  async getBloodMarker(markerId: string): Promise<ApiResponse<BloodMarker>> {
    return this.request(`/blood-markers/${markerId}`);
  }

  async createBloodMarker(
    data: CreateBloodMarkerForm
  ): Promise<ApiResponse<BloodMarker>> {
    return this.request("/blood-markers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async respondToBloodMarkerRequest(
    data: RespondToBloodMarkerForm
  ): Promise<ApiResponse<BloodMarker>> {
    return this.request(`/blood-markers/${data.markerId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({
        accepted: data.accepted,
        rejectionReason: data.rejectionReason,
      }),
    });
  }

  async payBloodMarker(markerId: string): Promise<ApiResponse<BloodMarker>> {
    return this.request(`/blood-markers/${markerId}/pay`, {
      method: "PATCH",
    });
  }

  async confirmBloodMarkerPayment(
    markerId: string
  ): Promise<ApiResponse<BloodMarker>> {
    return this.request(`/blood-markers/${markerId}/confirm`, {
      method: "PATCH",
    });
  }

  async getBloodMarkersByUser(userId: string): Promise<ApiResponse<{
    all: BloodMarker[];
    categorized: {
      debtsOwed: BloodMarker[];
      debtsOwing: BloodMarker[];
      pendingRequests: BloodMarker[];
      sentRequests: BloodMarker[];
      settledDebts: BloodMarker[];
      rejectedRequests: BloodMarker[];
    };
  }>> {
    return this.request(`/blood-markers/user/${userId}`);
  }

  // Profile Management
  async getProfile(): Promise<ApiResponse<User | Assassin>> {
    return this.request("/profile");
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.request<User>("/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      console.log("Profile update response:", response);
      return response;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return this.request("/profile/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateSkills(skills: string[]): Promise<ApiResponse<User>> {
    return this.request("/profile/skills", {
      method: "PATCH",
      body: JSON.stringify({ skills }),
    });
  }

  async updateLocation(location: string): Promise<ApiResponse<User>> {
    return this.request("/profile/location", {
      method: "PATCH",
      body: JSON.stringify({ location }),
    });
  }
}

export const apiService = new ApiService();
