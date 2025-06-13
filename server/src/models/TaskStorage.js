import { supabaseStorage } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Task {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description || '';
    this.isCompleted = data.isCompleted || false;
    this.priority = data.priority || 'medium';
    this.category = data.category || 'other';
    
    // Time management
    this.estimatedDuration = data.estimatedDuration; // in minutes
    this.actualDuration = data.actualDuration; // in minutes
    this.dueDate = data.dueDate;
    this.reminderTime = data.reminderTime;
    
    // Gamification
    this.points = data.points || 10;
    this.difficulty = data.difficulty || 1;
    
    // Organization
    this.orderIndex = data.orderIndex || 0;
    this.tags = data.tags || [];
    
    // Relationships
    this.ownerId = data.ownerId;
    
    // Subtasks
    this.subtasks = data.subtasks || [];
    
    // Recurring task settings
    this.recurring = data.recurring || {
      enabled: false,
      frequency: 'daily',
      interval: 1
    };
    
    // AI-generated suggestions
    this.aiSuggestions = data.aiSuggestions || {};
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt;
  }

  // Validate task data
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Task name is required');
    }
    
    if (this.name && this.name.length > 200) {
      errors.push('Task name must be less than 200 characters');
    }
    
    if (!['low', 'medium', 'high'].includes(this.priority)) {
      errors.push('Priority must be low, medium, or high');
    }
    
    if (!['work', 'personal', 'health', 'learning', 'social', 'other'].includes(this.category)) {
      errors.push('Invalid category');
    }
    
    if (this.points < 1 || this.points > 100) {
      errors.push('Points must be between 1 and 100');
    }
    
    if (this.difficulty < 1 || this.difficulty > 5) {
      errors.push('Difficulty must be between 1 and 5');
    }
    
    if (!this.ownerId) {
      errors.push('Owner ID is required');
    }
    
    return errors;
  }

  // Mark task as completed
  markCompleted() {
    this.isCompleted = true;
    this.completedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Mark task as incomplete
  markIncomplete() {
    this.isCompleted = false;
    this.completedAt = null;
    this.updatedAt = new Date().toISOString();
  }

  // Add subtask
  addSubtask(name) {
    const subtask = {
      id: uuidv4(),
      name,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    this.subtasks.push(subtask);
    this.updatedAt = new Date().toISOString();
    return subtask;
  }

  // Update subtask
  updateSubtask(subtaskId, updates) {
    const subtaskIndex = this.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex !== -1) {
      this.subtasks[subtaskIndex] = { ...this.subtasks[subtaskIndex], ...updates };
      if (updates.isCompleted) {
        this.subtasks[subtaskIndex].completedAt = new Date().toISOString();
      }
      this.updatedAt = new Date().toISOString();
      return this.subtasks[subtaskIndex];
    }
    return null;
  }

  // Remove subtask
  removeSubtask(subtaskId) {
    const initialLength = this.subtasks.length;
    this.subtasks = this.subtasks.filter(st => st.id !== subtaskId);
    if (this.subtasks.length < initialLength) {
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Calculate completion percentage
  getCompletionPercentage() {
    if (this.subtasks.length === 0) {
      return this.isCompleted ? 100 : 0;
    }
    
    const completedSubtasks = this.subtasks.filter(st => st.isCompleted).length;
    const subtaskPercentage = (completedSubtasks / this.subtasks.length) * 80; // 80% for subtasks
    const mainTaskPercentage = this.isCompleted ? 20 : 0; // 20% for main task
    
    return Math.round(subtaskPercentage + mainTaskPercentage);
  }

  // Save task to storage
  async save() {
    try {
      const errors = this.validate();
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      
      this.updatedAt = new Date().toISOString();
      
      const filePath = `users/${this.ownerId}/tasks/${this.id}.json`;
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload(filePath, JSON.stringify(this, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      if (error) throw error;
      return this;
    } catch (error) {
      throw new Error(`Failed to save task: ${error.message}`);
    }
  }

  // Static methods for database operations
  static async findById(taskId, ownerId) {
    try {
      const filePath = `users/${ownerId}/tasks/${taskId}.json`;
      const { data, error } = await supabaseStorage.storage
        .from('user-data')
        .download(filePath);

      if (error) return null;
      
      const text = await data.text();
      const taskData = JSON.parse(text);
      return new Task(taskData);
    } catch (error) {
      return null;
    }
  }

  static async findByOwnerId(ownerId, options = {}) {
    try {
      const { data: taskFiles, error } = await supabaseStorage.storage
        .from('user-data')
        .list(`users/${ownerId}/tasks`);

      if (error) return [];

      const tasks = [];
      
      for (const file of taskFiles) {
        if (file.name === '.emptyFolderPlaceholder') continue;
        
        const taskId = file.name.replace('.json', '');
        const task = await Task.findById(taskId, ownerId);
        if (task) {
          tasks.push(task);
        }
      }
      
      // Apply filters
      let filteredTasks = tasks;
      
      if (options.isCompleted !== undefined) {
        filteredTasks = filteredTasks.filter(task => task.isCompleted === options.isCompleted);
      }
      
      if (options.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === options.priority);
      }
      
      if (options.category) {
        filteredTasks = filteredTasks.filter(task => task.category === options.category);
      }
      
      if (options.dueDate) {
        const targetDate = new Date(options.dueDate);
        filteredTasks = filteredTasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate.toDateString() === targetDate.toDateString();
        });
      }
      
      // Sort tasks
      const sortBy = options.sortBy || 'orderIndex';
      const sortOrder = options.sortOrder || 'asc';
      
      filteredTasks.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dueDate') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Apply pagination
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      
      return filteredTasks.slice(offset, offset + limit);
    } catch (error) {
      return [];
    }
  }

  static async getTaskStats(ownerId) {
    try {
      const tasks = await Task.findByOwnerId(ownerId);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.isCompleted).length,
        pending: tasks.filter(t => !t.isCompleted).length,
        overdue: 0,
        totalPoints: tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + t.points, 0),
        byPriority: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        byCategory: {}
      };
      
      // Calculate overdue tasks
      const now = new Date();
      stats.overdue = tasks.filter(t => {
        if (!t.dueDate || t.isCompleted) return false;
        return new Date(t.dueDate) < now;
      }).length;
      
      // Calculate category stats
      const categories = ['work', 'personal', 'health', 'learning', 'social', 'other'];
      categories.forEach(category => {
        stats.byCategory[category] = tasks.filter(t => t.category === category).length;
      });
      
      return stats;
    } catch (error) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        totalPoints: 0,
        byPriority: { high: 0, medium: 0, low: 0 },
        byCategory: { work: 0, personal: 0, health: 0, learning: 0, social: 0, other: 0 }
      };
    }
  }

  // Delete task
  async delete() {
    try {
      const filePath = `users/${this.ownerId}/tasks/${this.id}.json`;
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  // Bulk operations
  static async reorderTasks(ownerId, taskOrders) {
    try {
      const tasks = await Task.findByOwnerId(ownerId);
      
      for (const { taskId, orderIndex } of taskOrders) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.orderIndex = orderIndex;
          await task.save();
        }
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to reorder tasks: ${error.message}`);
    }
  }
}

export default Task;