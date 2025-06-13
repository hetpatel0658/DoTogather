// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/account',
    LEADERBOARD: '/users/leaderboard',
  },
  
  // Tasks
  TASKS: {
    BASE: '/tasks',
    STATS: '/tasks/stats',
    REORDER: '/tasks/reorder',
    SUBTASKS: (taskId: string) => `/tasks/${taskId}/subtasks`,
    SUBTASK: (taskId: string, subtaskId: string) => `/tasks/${taskId}/subtasks/${subtaskId}`,
  },
  
  // AI
  AI: {
    SUGGEST_TASKS: '/ai/suggest-tasks',
    ANALYZE_TASK: '/ai/analyze-task',
    PRODUCTIVITY_TIPS: '/ai/productivity-tips',
    PRIORITIZE_TASKS: '/ai/prioritize-tasks',
    BREAK_DOWN_TASK: '/ai/break-down-task',
  },
  
  // Explore
  EXPLORE: {
    TEMPLATES: '/explore/templates',
    POPULAR: '/explore/popular',
    TRENDING: '/explore/trending',
    INSIGHTS: '/explore/insights',
    SEARCH: '/explore/search',
  },
  
  // Email
  EMAIL: {
    TASK_REMINDER: '/email/task-reminder',
    WEEKLY_REPORT: '/email/weekly-report',
    PREFERENCES: '/email/preferences',
    TEST: '/email/test',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Request headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationResponse<T = any> extends ApiResponse<T> {
  data: {
    items?: T[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}