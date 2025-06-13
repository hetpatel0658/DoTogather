import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'learning', 'social', 'other'],
    default: 'other'
  },
  
  // Time management
  estimatedDuration: {
    type: Number, // in minutes
    min: 1,
    max: 1440 // 24 hours
  },
  actualDuration: {
    type: Number, // in minutes
    min: 0
  },
  dueDate: {
    type: Date
  },
  reminderTime: {
    type: Date
  },
  
  // Gamification
  points: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  difficulty: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  
  // Organization
  orderIndex: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Timestamps
  completedAt: {
    type: Date
  },
  
  // Relationships
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Subtasks
  subtasks: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  
  // Recurring task settings
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: {
      type: Date
    }
  },
  
  // AI-generated suggestions
  aiSuggestions: {
    estimatedDuration: Number,
    suggestedCategory: String,
    suggestedPriority: String,
    tips: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, isCompleted: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ owner: 1, priority: 1 });
taskSchema.index({ owner: 1, category: 1 });
taskSchema.index({ owner: 1, orderIndex: 1 });

// Pre-save middleware to handle completion
taskSchema.pre('save', function(next) {
  if (this.isModified('isCompleted')) {
    if (this.isCompleted && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.isCompleted) {
      this.completedAt = null;
    }
  }
  next();
});

// Virtual for completion percentage of subtasks
taskSchema.virtual('subtaskCompletionPercentage').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.isCompleted).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Method to calculate points based on difficulty and completion time
taskSchema.methods.calculatePoints = function() {
  let basePoints = this.points;
  
  // Bonus for difficulty
  const difficultyMultiplier = 1 + (this.difficulty - 1) * 0.2;
  basePoints *= difficultyMultiplier;
  
  // Bonus for completing before due date
  if (this.dueDate && this.completedAt && this.completedAt <= this.dueDate) {
    basePoints *= 1.1; // 10% bonus
  }
  
  // Bonus for completing subtasks
  if (this.subtasks && this.subtasks.length > 0) {
    const completionPercentage = this.subtaskCompletionPercentage;
    if (completionPercentage === 100) {
      basePoints *= 1.2; // 20% bonus for completing all subtasks
    }
  }
  
  return Math.round(basePoints);
};

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  return this.dueDate && !this.isCompleted && new Date() > this.dueDate;
};

// Method to get time until due
taskSchema.methods.getTimeUntilDue = function() {
  if (!this.dueDate) return null;
  
  const now = new Date();
  const timeDiff = this.dueDate - now;
  
  if (timeDiff <= 0) return { overdue: true, value: Math.abs(timeDiff) };
  
  return { overdue: false, value: timeDiff };
};

// Static method to get tasks by priority
taskSchema.statics.getTasksByPriority = function(userId, priority) {
  return this.find({ owner: userId, priority, isCompleted: false })
    .sort({ orderIndex: 1, createdAt: 1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function(userId) {
  return this.find({
    owner: userId,
    isCompleted: false,
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;