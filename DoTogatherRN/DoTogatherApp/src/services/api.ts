import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, PublicUserProfile, VoiceResponse, TaskSuggestion } from '../types';

const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your backend URL

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, username?: string): Promise<{ message: string; user_id: number }> {
    const response = await this.api.post('/auth/register', { email, password, username });
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.api.post('/auth/verify-email', { token });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  // Task endpoints
  async getTasks(): Promise<Task[]> {
    const response = await this.api.get('/tasks');
    return response.data;
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'ownerId' | 'orderIndex'>): Promise<Task> {
    const response = await this.api.post('/tasks', task);
    return response.data;
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
    const response = await this.api.put(`/tasks/${taskId}`, updates);
    return response.data;
  }

  async deleteTask(taskId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/tasks/${taskId}`);
    return response.data;
  }

  // Explore endpoints
  async getLeaderboard(limit: number = 50, offset: number = 0): Promise<{
    users: PublicUserProfile[];
    total_users: number;
    current_user_rank?: number;
  }> {
    const response = await this.api.get(`/explore/leaderboard?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async getPublicUserProfile(userId: number): Promise<PublicUserProfile> {
    const response = await this.api.get(`/explore/user/${userId}`);
    return response.data;
  }

  // AI Assistant endpoints
  async processVoiceTask(audioData: string, wakeWord: string = 'chota ustad'): Promise<VoiceResponse> {
    const response = await this.api.post('/ai/voice-task', {
      audio_data: audioData,
      wake_word: wakeWord,
    });
    return response.data;
  }

  async getTaskSuggestions(context: string, userPreferences?: any): Promise<TaskSuggestion> {
    const response = await this.api.post('/ai/suggest-tasks', {
      context,
      user_preferences: userPreferences,
    });
    return response.data;
  }

  // Email endpoints
  async sendVerificationEmail(email: string): Promise<{ message: string; success: boolean }> {
    const response = await this.api.post('/email/send-verification', { email });
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<{ message: string; success: boolean }> {
    const response = await this.api.post('/email/resend-verification', { email });
    return response.data;
  }
}

export default new ApiService();