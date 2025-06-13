import { supabaseStorage } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class User {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.isVerified = data.isVerified || false;
    this.verificationToken = data.verificationToken;
    this.resetPasswordToken = data.resetPasswordToken;
    this.resetPasswordExpires = data.resetPasswordExpires;
    
    // Gamification fields
    this.points = data.points || 0;
    this.level = data.level || 1;
    this.currentStreak = data.currentStreak || 0;
    this.longestStreak = data.longestStreak || 0;
    this.lastActiveDate = data.lastActiveDate;
    
    // Profile information
    this.avatar = data.avatar;
    this.bio = data.bio;
    this.preferences = data.preferences || {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        reminders: true
      },
      privacy: {
        profileVisible: true,
        statsVisible: true
      }
    };
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastLogin = data.lastLogin;
  }

  // Hash password
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Get public profile
  getPublicProfile() {
    const profile = { ...this };
    delete profile.password;
    delete profile.verificationToken;
    delete profile.resetPasswordToken;
    delete profile.resetPasswordExpires;
    return profile;
  }

  // Calculate level based on points
  calculateLevel() {
    this.level = Math.floor(Math.sqrt(this.points / 100)) + 1;
    return this.level;
  }

  // Update streak
  updateStreak() {
    const today = new Date();
    const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate) : null;
    
    if (!lastActive) {
      this.currentStreak = 1;
      this.lastActiveDate = today.toISOString();
      return;
    }
    
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
    
    this.lastActiveDate = today.toISOString();
  }

  // Save user to storage
  async save() {
    try {
      this.updatedAt = new Date().toISOString();
      
      const filePath = `users/${this.id}/profile.json`;
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload(filePath, JSON.stringify(this, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      if (error) throw error;
      return this;
    } catch (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  // Static methods for database operations
  static async findById(id) {
    try {
      const filePath = `users/${id}/profile.json`;
      const { data, error } = await supabaseStorage.storage
        .from('user-data')
        .download(filePath);

      if (error) return null;
      
      const text = await data.text();
      const userData = JSON.parse(text);
      return new User(userData);
    } catch (error) {
      return null;
    }
  }

  static async findByEmail(email) {
    try {
      // List all user folders
      const { data: userFolders, error } = await supabaseStorage.storage
        .from('user-data')
        .list('users');

      if (error) throw error;

      // Search through user profiles
      for (const folder of userFolders) {
        if (folder.name === '.emptyFolderPlaceholder') continue;
        
        const user = await User.findById(folder.name);
        if (user && user.email === email) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static async findByUsername(username) {
    try {
      // List all user folders
      const { data: userFolders, error } = await supabaseStorage.storage
        .from('user-data')
        .list('users');

      if (error) throw error;

      // Search through user profiles
      for (const folder of userFolders) {
        if (folder.name === '.emptyFolderPlaceholder') continue;
        
        const user = await User.findById(folder.name);
        if (user && user.username === username) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static async findByVerificationToken(token) {
    try {
      // List all user folders
      const { data: userFolders, error } = await supabaseStorage.storage
        .from('user-data')
        .list('users');

      if (error) throw error;

      // Search through user profiles
      for (const folder of userFolders) {
        if (folder.name === '.emptyFolderPlaceholder') continue;
        
        const user = await User.findById(folder.name);
        if (user && user.verificationToken === token) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static async findByResetToken(token) {
    try {
      // List all user folders
      const { data: userFolders, error } = await supabaseStorage.storage
        .from('user-data')
        .list('users');

      if (error) throw error;

      // Search through user profiles
      for (const folder of userFolders) {
        if (folder.name === '.emptyFolderPlaceholder') continue;
        
        const user = await User.findById(folder.name);
        if (user && user.resetPasswordToken === token) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static async getAllUsers(limit = 50) {
    try {
      const { data: userFolders, error } = await supabaseStorage.storage
        .from('user-data')
        .list('users');

      if (error) throw error;

      const users = [];
      let count = 0;
      
      for (const folder of userFolders) {
        if (folder.name === '.emptyFolderPlaceholder') continue;
        if (count >= limit) break;
        
        const user = await User.findById(folder.name);
        if (user) {
          users.push(user.getPublicProfile());
          count++;
        }
      }
      
      return users;
    } catch (error) {
      return [];
    }
  }

  // Delete user
  async delete() {
    try {
      // Delete user folder and all contents
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .remove([`users/${this.id}`]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export default User;