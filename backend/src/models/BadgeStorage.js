import { supabaseStorage } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Badge {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description;
    this.icon = data.icon;
    this.color = data.color || '#3B82F6';
    this.category = data.category;
    this.criteria = data.criteria;
    this.rarity = data.rarity || 'common';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.pointsReward = data.pointsReward || 0;
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate badge data
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Badge name is required');
    }
    
    if (!this.description || this.description.trim().length === 0) {
      errors.push('Badge description is required');
    }
    
    if (!this.icon || this.icon.trim().length === 0) {
      errors.push('Badge icon is required');
    }
    
    if (!['streak', 'completion', 'points', 'special', 'time'].includes(this.category)) {
      errors.push('Invalid badge category');
    }
    
    if (!['common', 'rare', 'epic', 'legendary'].includes(this.rarity)) {
      errors.push('Invalid badge rarity');
    }
    
    if (!this.criteria || typeof this.criteria !== 'object') {
      errors.push('Badge criteria is required and must be an object');
    }
    
    return errors;
  }

  // Check if user meets badge criteria
  checkCriteria(userStats) {
    if (!this.criteria || !userStats) return false;
    
    const { type, value } = this.criteria;
    
    switch (type) {
      case 'tasks_completed':
        return userStats.tasksCompleted >= value;
      
      case 'streak_days':
        return userStats.currentStreak >= value;
      
      case 'points_earned':
        return userStats.totalPoints >= value;
      
      case 'early_completion':
        // Check if user completed a task before specified hour
        return userStats.hasEarlyCompletion && userStats.earliestCompletionHour <= value;
      
      case 'late_completion':
        // Check if user completed a task after specified hour
        return userStats.hasLateCompletion && userStats.latestCompletionHour >= value;
      
      case 'category_master':
        // Check if user completed specified number of tasks in a category
        const categoryCount = userStats.categoryCounts?.[this.criteria.category] || 0;
        return categoryCount >= value;
      
      case 'perfect_week':
        // Check if user completed tasks every day for a week
        return userStats.perfectWeeks >= value;
      
      case 'speed_demon':
        // Check if user completed tasks faster than estimated
        return userStats.speedCompletions >= value;
      
      default:
        return false;
    }
  }

  // Save badge to storage
  async save() {
    try {
      const errors = this.validate();
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      
      this.updatedAt = new Date().toISOString();
      
      // Get existing badges
      const badges = await Badge.getAllBadges();
      
      // Update or add this badge
      const existingIndex = badges.findIndex(b => b.id === this.id);
      if (existingIndex !== -1) {
        badges[existingIndex] = this;
      } else {
        badges.push(this);
      }
      
      // Save back to storage
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload('system/badges.json', JSON.stringify(badges, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      if (error) throw error;
      return this;
    } catch (error) {
      throw new Error(`Failed to save badge: ${error.message}`);
    }
  }

  // Static methods for database operations
  static async getAllBadges() {
    try {
      const { data, error } = await supabaseStorage.storage
        .from('user-data')
        .download('system/badges.json');

      if (error) return [];
      
      const text = await data.text();
      const badgesData = JSON.parse(text);
      return badgesData.map(badgeData => new Badge(badgeData));
    } catch (error) {
      return [];
    }
  }

  static async findById(id) {
    try {
      const badges = await Badge.getAllBadges();
      const badgeData = badges.find(b => b.id === id);
      return badgeData ? new Badge(badgeData) : null;
    } catch (error) {
      return null;
    }
  }

  static async findByCategory(category) {
    try {
      const badges = await Badge.getAllBadges();
      return badges.filter(b => b.category === category && b.isActive);
    } catch (error) {
      return [];
    }
  }

  static async getActiveBadges() {
    try {
      const badges = await Badge.getAllBadges();
      return badges.filter(b => b.isActive);
    } catch (error) {
      return [];
    }
  }

  // Delete badge
  async delete() {
    try {
      const badges = await Badge.getAllBadges();
      const filteredBadges = badges.filter(b => b.id !== this.id);
      
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload('system/badges.json', JSON.stringify(filteredBadges, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete badge: ${error.message}`);
    }
  }
}

class UserBadge {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.badgeId = data.badgeId;
    this.earnedAt = data.earnedAt || new Date().toISOString();
  }

  // Save user badge to storage
  async save() {
    try {
      if (!this.userId || !this.badgeId) {
        throw new Error('User ID and Badge ID are required');
      }
      
      // Get existing user badges
      const userBadges = await UserBadge.findByUserId(this.userId);
      
      // Check if badge already earned
      const existingBadge = userBadges.find(ub => ub.badgeId === this.badgeId);
      if (existingBadge) {
        return existingBadge; // Already earned
      }
      
      // Add new badge
      userBadges.push(this);
      
      // Save back to storage
      const filePath = `users/${this.userId}/badges.json`;
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload(filePath, JSON.stringify(userBadges, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      if (error) throw error;
      return this;
    } catch (error) {
      throw new Error(`Failed to save user badge: ${error.message}`);
    }
  }

  // Static methods for user badge operations
  static async findByUserId(userId) {
    try {
      const filePath = `users/${userId}/badges.json`;
      const { data, error } = await supabaseStorage.storage
        .from('user-data')
        .download(filePath);

      if (error) return [];
      
      const text = await data.text();
      const userBadgesData = JSON.parse(text);
      return userBadgesData.map(ubData => new UserBadge(ubData));
    } catch (error) {
      return [];
    }
  }

  static async getUserBadgesWithDetails(userId) {
    try {
      const userBadges = await UserBadge.findByUserId(userId);
      const allBadges = await Badge.getAllBadges();
      
      return userBadges.map(userBadge => {
        const badge = allBadges.find(b => b.id === userBadge.badgeId);
        return {
          ...userBadge,
          badge: badge || null
        };
      }).filter(ub => ub.badge !== null);
    } catch (error) {
      return [];
    }
  }

  static async checkAndAwardBadges(userId, userStats) {
    try {
      const allBadges = await Badge.getActiveBadges();
      const userBadges = await UserBadge.findByUserId(userId);
      const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
      
      const newlyEarnedBadges = [];
      
      for (const badge of allBadges) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badge.id)) continue;
        
        // Check if criteria is met
        if (badge.checkCriteria(userStats)) {
          const userBadge = new UserBadge({
            userId,
            badgeId: badge.id
          });
          
          await userBadge.save();
          newlyEarnedBadges.push({
            ...userBadge,
            badge
          });
        }
      }
      
      return newlyEarnedBadges;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return [];
    }
  }

  // Remove user badge
  static async removeBadge(userId, badgeId) {
    try {
      const userBadges = await UserBadge.findByUserId(userId);
      const filteredBadges = userBadges.filter(ub => ub.badgeId !== badgeId);
      
      const filePath = `users/${userId}/badges.json`;
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload(filePath, JSON.stringify(filteredBadges, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to remove user badge: ${error.message}`);
    }
  }
}

export { Badge, UserBadge };
export default Badge;