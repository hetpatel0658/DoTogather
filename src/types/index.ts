
export interface Task {
  id: string;
  name: string;
  title?: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'mon-wed-fri' | 'every-3-hours';
  reminderTime?: string;
  isCompleted: boolean;
  createdAt: Date;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  points: number;
  currentStreak: number;
  isPublicProfile?: boolean;
  onboardingComplete?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  points: number;
  currentStreak: number;
  badges: Badge[];
  isPublicProfile: boolean;
}
