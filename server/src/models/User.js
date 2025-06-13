import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // Gamification fields
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: null
  },
  
  // Profile information
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      statsVisible: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Badges and achievements
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on points
userSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  this.level = Math.floor(Math.sqrt(this.points / 100)) + 1;
  return this.level;
};

// Update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate) : null;
  
  if (!lastActive) {
    // First time user
    this.currentStreak = 1;
    this.lastActiveDate = today;
  } else {
    lastActive.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak += 1;
      this.lastActiveDate = today;
    } else if (daysDiff === 0) {
      // Same day, no change
      return this.currentStreak;
    } else {
      // Streak broken
      this.currentStreak = 1;
      this.lastActiveDate = today;
    }
  }
  
  // Update longest streak
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  return this.currentStreak;
};

// Virtual for tasks
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;