import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URL } from './urlApp';

// Types pour l'authentification
interface AuthTokens {
  token: string;
}

// Utility pour le storage
const storage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  },
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
  },
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = storage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    // Le backend n'expose pas de route de rafraîchissement de jeton : un 401
    // signifie que la session est terminée, on déconnecte directement.
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleLogout();
        }
        return Promise.reject(error);
      }
    );
  }

  private handleLogout(): void {
    storage.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Méthodes HTTP génériques
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Méthodes pour gérer les tokens
  setAuthTokens(tokens: AuthTokens): void {
    storage.setToken(tokens.token);
  }

  clearAuthTokens(): void {
    storage.removeToken();
  }

  // Accès direct au client axios pour cas spéciaux
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton
export const apiClient = new ApiClient();

// Export de la classe pour les cas où on a besoin d'une nouvelle instance
export default ApiClient;
