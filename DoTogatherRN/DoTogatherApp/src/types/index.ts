export interface User {
  id: number;
  email: string;
  username?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic: boolean;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'health' | 'learning' | 'social' | 'other';
  estimatedDuration?: number;
  actualDuration?: number;
  dueDate?: string;
  reminderTime?: string;
  points: number;
  difficulty: number;
  orderIndex: number;
  createdAt: string;
  completedAt?: string;
  ownerId: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string;
  badgeType: 'streak' | 'completion' | 'special' | 'achievement';
  requiredValue?: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  badge: Badge;
}

export interface PublicUserProfile {
  id: number;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  rank: number;
}

export interface VoiceTaskRequest {
  audioData: string;
  wakeWord?: string;
}

export interface VoiceResponse {
  transcribedText: string;
  extractedTask?: string;
  responseMessage: string;
  taskCreated: boolean;
}

export interface TaskSuggestion {
  tasks: string[];
  reasoning: string;
}

export interface ProductivityAnalysis {
  productivityScore: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  insights: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AppState {
  tasks: Task[];
  badges: UserBadge[];
  currentStreak: number;
  completedTasksPercentage: number;
  activeTab: string;
  showOnboarding: boolean;
  showUsernamePrompt: boolean;
  isVoiceListening: boolean;
  wakeWordEnabled: boolean;
}