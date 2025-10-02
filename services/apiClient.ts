import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URL } from './urlApp';

// Types pour l'authentification
interface AuthTokens {
  token: string;
  refreshToken?: string;
}

// Utility pour le storage
const storage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userToken');
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userToken', token);
  },
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userToken');
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refreshToken', token);
  },
};

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

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
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si erreur 401 et pas déjà en refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Mettre en queue les requêtes en attente
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = storage.getRefreshToken();

          if (!refreshToken) {
            this.handleLogout();
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { token } = response.data;
            storage.setToken(token);

            // Résoudre toutes les requêtes en attente
            this.failedQueue.forEach((prom) => prom.resolve(token));
            this.failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError));
            this.failedQueue = [];
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
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
    if (tokens.refreshToken) {
      storage.setRefreshToken(tokens.refreshToken);
    }
  }

  clearAuthTokens(): void {
    storage.removeToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
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
