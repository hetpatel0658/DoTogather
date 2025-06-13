import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/UserStorage.js';
import Task from '../models/TaskStorage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('badges')
      .select('-password');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatar').optional().isURL(),
  body('preferences.theme').optional().isIn(['light', 'dark', 'system']),
  body('preferences.notifications.email').optional().isBoolean(),
  body('preferences.notifications.push').optional().isBoolean(),
  body('preferences.notifications.reminders').optional().isBoolean(),
  body('preferences.privacy.profileVisible').optional().isBoolean(),
  body('preferences.privacy.statsVisible').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, bio, avatar, preferences } = req.body;

    // Check if username is taken (if provided and different from current)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('badges').select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get task statistics
    const totalTasks = await Task.countDocuments({ owner: userId });
    const completedTasks = await Task.countDocuments({ owner: userId, isCompleted: true });
    const pendingTasks = await Task.countDocuments({ owner: userId, isCompleted: false });

    // Get points and level info
    const user = await User.findById(userId).select('points level currentStreak longestStreak');

    // Calculate next level points requirement
    const currentLevel = user.level;
    const nextLevelPoints = Math.pow(currentLevel, 2) * 100;
    const pointsToNextLevel = nextLevelPoints - user.points;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Task.aggregate([
      {
        $match: {
          owner: userId,
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          tasksCompleted: { $sum: 1 },
          pointsEarned: { $sum: '$points' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category breakdown
    const categoryStats = await Task.aggregate([
      { $match: { owner: userId, isCompleted: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          points: user.points,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          pointsToNextLevel: Math.max(0, pointsToNextLevel)
        },
        recentActivity,
        categoryStats: categoryStats.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalPoints: item.totalPoints
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', [
  body('password').exists()
], async (req, res) => {
  try {
    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete all user's tasks
    await Task.deleteMany({ owner: req.user._id });

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'all_time', limit = 10 } = req.query;

    let matchStage = {};
    
    if (timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchStage.lastActiveDate = { $gte: weekAgo };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchStage.lastActiveDate = { $gte: monthAgo };
    }

    const leaderboard = await User.aggregate([
      { $match: { ...matchStage, 'preferences.privacy.statsVisible': true } },
      {
        $project: {
          username: 1,
          points: 1,
          level: 1,
          currentStreak: 1,
          avatar: 1
        }
      },
      { $sort: { points: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Find current user's rank
    const userRank = await User.aggregate([
      { $match: matchStage },
      { $sort: { points: -1 } },
      { $group: { _id: null, users: { $push: '$_id' } } },
      { $unwind: { path: '$users', includeArrayIndex: 'rank' } },
      { $match: { users: req.user._id } },
      { $project: { rank: { $add: ['$rank', 1] } } }
    ]);

    res.json({
      success: true,
      data: {
        leaderboard,
        userRank: userRank.length > 0 ? userRank[0].rank : null
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
});

export default router;