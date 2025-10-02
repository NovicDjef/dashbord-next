import { apiClient } from '../apiClient';

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    role: string;
    image?: string;
  };
}

export const authService = {
  /**
   * Connexion admin
   */
  async loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/admin/login', credentials);
    if (response.token) {
      apiClient.setAuthTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
    }
    return response;
  },

  /**
   * Inscription admin
   */
  async registerAdmin(data: RegisterData): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/admin/signup', data);
  },

  /**
   * Connexion utilisateur
   */
  async loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/users/login', credentials);
    if (response.token) {
      apiClient.setAuthTokens({
        token: response.token,
        refreshToken: response.refreshToken,
      });
    }
    return response;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.clearAuthTokens();
    }
  },

  /**
   * Vérifier le token
   */
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(phone: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post('/users/reset', { phone });
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return await apiClient.post('/auth/change-password', data);
  },
};
