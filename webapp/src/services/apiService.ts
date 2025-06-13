import { API_BASE_URL, getAuthHeaders, ApiResponse } from '@/config/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();
export default apiService;