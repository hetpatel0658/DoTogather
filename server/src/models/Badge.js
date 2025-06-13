import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  category: {
    type: String,
    enum: ['streak', 'completion', 'points', 'special', 'time'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['streak_days', 'tasks_completed', 'points_earned', 'special_action', 'time_saved'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    timeframe: {
      type: String,
      enum: ['all_time', 'daily', 'weekly', 'monthly'],
      default: 'all_time'
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pointsReward: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
badgeSchema.index({ category: 1, isActive: 1 });
badgeSchema.index({ 'criteria.type': 1 });

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;