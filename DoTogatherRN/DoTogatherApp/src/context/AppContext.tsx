import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, UserBadge, AuthState, AppState } from '../types';
import ApiService from '../services/api';
import VoiceService from '../services/voiceService';
import { Alert } from 'react-native';

interface AppContextType extends AuthState, AppState {
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'ownerId' | 'orderIndex'>) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  completeTask: (taskId: number) => Promise<void>;
  uncompleteTask: (taskId: number) => Promise<void>;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  
  // User methods
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  
  // Voice methods
  startVoiceListening: () => Promise<void>;
  stopVoiceListening: () => Promise<void>;
  enableWakeWord: () => Promise<void>;
  disableWakeWord: () => Promise<void>;
  
  // UI methods
  setActiveTab: (tab: string) => void;
  setOnboardingComplete: () => void;
  setUsernamePromptComplete: () => void;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // App state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [completedTasksPercentage, setCompletedTasksPercentage] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Update completed tasks percentage when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const completedCount = tasks.filter(task => task.isCompleted).length;
      setCompletedTasksPercentage((completedCount / tasks.length) * 100);
    } else {
      setCompletedTasksPercentage(0);
    }
  }, [tasks]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored token
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        
        try {
          // Verify token and get user data
          const userData = await ApiService.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
          setCurrentStreak(userData.currentStreak);
          
          // Load user data
          await loadUserData();
        } catch (error) {
          // Token is invalid, remove it
          await AsyncStorage.removeItem('authToken');
          setToken(null);
        }
      }
      
      // Check onboarding status
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      setShowOnboarding(onboardingComplete !== 'true');
      
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [tasksData] = await Promise.all([
        ApiService.getTasks(),
        // Add other data loading here (badges, etc.)
      ]);
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Auth methods
  const login = async (email: string, password: string) => {
    try {
      const response = await ApiService.login(email, password);
      const { access_token } = response;
      
      await AsyncStorage.setItem('authToken', access_token);
      setToken(access_token);
      
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentStreak(userData.currentStreak);
      
      await loadUserData();
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, username?: string) => {
    try {
      await ApiService.register(email, password, username);
      // Note: User needs to verify email before logging in
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await VoiceService.destroy();
      
      setUser(null);
      setIsLoggedIn(false);
      setToken(null);
      setTasks([]);
      setBadges([]);
      setCurrentStreak(0);
      setWakeWordEnabled(false);
      setIsVoiceListening(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Task methods
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'ownerId' | 'orderIndex'>) => {
    try {
      const newTask = await ApiService.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      throw error;
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await ApiService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      
      // Update user points if task completion status changed
      if (updates.isCompleted !== undefined && user) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const pointsChange = updates.isCompleted ? task.points : -task.points;
          setUser(prev => prev ? { ...prev, points: prev.points + pointsChange } : null);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await ApiService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      throw error;
    }
  };

  const completeTask = async (taskId: number) => {
    await updateTask(taskId, { isCompleted: true });
  };

  const uncompleteTask = async (taskId: number) => {
    await updateTask(taskId, { isCompleted: false });
  };

  const reorderTasks = (fromIndex: number, toIndex: number) => {
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, removed);
    
    // Update order indices
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      orderIndex: index,
    }));
    
    setTasks(updatedTasks);
    
    // TODO: Send reorder request to backend
  };

  // User methods
  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await ApiService.updateUserProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  // Voice methods
  const startVoiceListening = async () => {
    try {
      setIsVoiceListening(true);
      
      await VoiceService.startVoiceCommand(
        async (result: string) => {
          try {
            // Process voice command with AI
            const response = await ApiService.processVoiceTask(result);
            
            if (response.taskCreated) {
              Alert.alert('Task Created', response.responseMessage);
              await refreshData(); // Reload tasks
            } else {
              Alert.alert('Voice Command', response.responseMessage);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to process voice command');
          } finally {
            setIsVoiceListening(false);
          }
        },
        (error: string) => {
          Alert.alert('Voice Error', error);
          setIsVoiceListening(false);
        }
      );
    } catch (error) {
      setIsVoiceListening(false);
      throw error;
    }
  };

  const stopVoiceListening = async () => {
    try {
      await VoiceService.stopListening();
      setIsVoiceListening(false);
    } catch (error) {
      console.error('Error stopping voice listening:', error);
    }
  };

  const enableWakeWord = async () => {
    try {
      setWakeWordEnabled(true);
      
      await VoiceService.startWakeWordDetection(
        async () => {
          // Wake word detected, start voice command
          await startVoiceListening();
        },
        (error: string) => {
          console.error('Wake word detection error:', error);
          setWakeWordEnabled(false);
        }
      );
    } catch (error) {
      setWakeWordEnabled(false);
      throw error;
    }
  };

  const disableWakeWord = async () => {
    try {
      await VoiceService.stopListening();
      setWakeWordEnabled(false);
    } catch (error) {
      console.error('Error disabling wake word:', error);
    }
  };

  // UI methods
  const setOnboardingComplete = () => {
    setShowOnboarding(false);
    AsyncStorage.setItem('onboardingComplete', 'true');
  };

  const setUsernamePromptComplete = () => {
    setShowUsernamePrompt(false);
  };

  const refreshData = async () => {
    if (isLoggedIn) {
      await loadUserData();
    }
  };

  const contextValue: AppContextType = {
    // Auth state
    user,
    isLoggedIn,
    isLoading,
    token,
    
    // App state
    tasks,
    badges,
    currentStreak,
    completedTasksPercentage,
    activeTab,
    showOnboarding,
    showUsernamePrompt,
    isVoiceListening,
    wakeWordEnabled,
    
    // Auth methods
    login,
    register,
    logout,
    
    // Task methods
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    reorderTasks,
    
    // User methods
    updateUserProfile,
    
    // Voice methods
    startVoiceListening,
    stopVoiceListening,
    enableWakeWord,
    disableWakeWord,
    
    // UI methods
    setActiveTab,
    setOnboardingComplete,
    setUsernamePromptComplete,
    
    // Data refresh
    refreshData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;