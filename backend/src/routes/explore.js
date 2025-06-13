import express from 'express';
import { query, validationResult } from 'express-validator';
import Task from '../models/TaskStorage.js';
import User from '../models/UserStorage.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get public task templates
// @route   GET /api/explore/templates
// @access  Public
router.get('/templates', [
  query('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other']),
  query('difficulty').optional().isInt({ min: 1, max: 5 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const {
      category,
      difficulty,
      page = 1,
      limit = 20
    } = req.query;

    // Predefined task templates
    const templates = [
      {
        id: 'morning-routine',
        name: 'Morning Routine',
        description: 'Start your day with a productive morning routine',
        category: 'personal',
        difficulty: 2,
        estimatedDuration: 60,
        points: 20,
        tags: ['routine', 'morning', 'productivity'],
        subtasks: [
          { name: 'Wake up at consistent time', estimatedDuration: 5 },
          { name: 'Drink a glass of water', estimatedDuration: 2 },
          { name: 'Light exercise or stretching', estimatedDuration: 15 },
          { name: 'Healthy breakfast', estimatedDuration: 20 },
          { name: 'Review daily goals', estimatedDuration: 10 }
        ]
      },
      {
        id: 'deep-work-session',
        name: 'Deep Work Session',
        description: 'Focused work session without distractions',
        category: 'work',
        difficulty: 3,
        estimatedDuration: 90,
        points: 30,
        tags: ['focus', 'productivity', 'work'],
        subtasks: [
          { name: 'Clear workspace and eliminate distractions', estimatedDuration: 10 },
          { name: 'Set specific goals for the session', estimatedDuration: 5 },
          { name: 'Work for 45 minutes (Pomodoro 1)', estimatedDuration: 45 },
          { name: 'Take 5-minute break', estimatedDuration: 5 },
          { name: 'Work for 45 minutes (Pomodoro 2)', estimatedDuration: 45 }
        ]
      },
      {
        id: 'weekly-planning',
        name: 'Weekly Planning Session',
        description: 'Plan and organize your upcoming week',
        category: 'personal',
        difficulty: 2,
        estimatedDuration: 45,
        points: 25,
        tags: ['planning', 'organization', 'weekly'],
        subtasks: [
          { name: 'Review previous week accomplishments', estimatedDuration: 10 },
          { name: 'Set 3-5 main goals for the week', estimatedDuration: 15 },
          { name: 'Schedule important tasks and appointments', estimatedDuration: 15 },
          { name: 'Prepare for upcoming challenges', estimatedDuration: 5 }
        ]
      },
      {
        id: 'learn-new-skill',
        name: 'Learn New Skill',
        description: 'Dedicate time to learning something new',
        category: 'learning',
        difficulty: 3,
        estimatedDuration: 120,
        points: 35,
        tags: ['learning', 'skill', 'development'],
        subtasks: [
          { name: 'Choose specific skill to focus on', estimatedDuration: 10 },
          { name: 'Find quality learning resources', estimatedDuration: 20 },
          { name: 'Study/practice for 60 minutes', estimatedDuration: 60 },
          { name: 'Take notes and summarize learnings', estimatedDuration: 15 },
          { name: 'Plan next learning session', estimatedDuration: 15 }
        ]
      },
      {
        id: 'exercise-routine',
        name: 'Exercise Routine',
        description: 'Complete a balanced workout session',
        category: 'health',
        difficulty: 3,
        estimatedDuration: 60,
        points: 30,
        tags: ['exercise', 'health', 'fitness'],
        subtasks: [
          { name: 'Warm-up exercises', estimatedDuration: 10 },
          { name: 'Cardio workout', estimatedDuration: 20 },
          { name: 'Strength training', estimatedDuration: 20 },
          { name: 'Cool-down and stretching', estimatedDuration: 10 }
        ]
      },
      {
        id: 'social-connection',
        name: 'Social Connection',
        description: 'Reach out and connect with friends or family',
        category: 'social',
        difficulty: 1,
        estimatedDuration: 30,
        points: 15,
        tags: ['social', 'relationships', 'connection'],
        subtasks: [
          { name: 'Choose someone to connect with', estimatedDuration: 5 },
          { name: 'Send a thoughtful message or call', estimatedDuration: 20 },
          { name: 'Plan future meetup if appropriate', estimatedDuration: 5 }
        ]
      }
    ];

    // Filter templates
    let filteredTemplates = templates;
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === parseInt(difficulty));
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        templates: paginatedTemplates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredTemplates.length,
          pages: Math.ceil(filteredTemplates.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching templates'
    });
  }
});

// @desc    Get popular tasks (most used templates)
// @route   GET /api/explore/popular
// @access  Public
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    // Get most common task names and categories
    const popularTasks = await Task.aggregate([
      {
        $group: {
          _id: {
            name: '$name',
            category: '$category'
          },
          count: { $sum: 1 },
          avgPoints: { $avg: '$points' },
          avgDuration: { $avg: '$estimatedDuration' },
          avgDifficulty: { $avg: '$difficulty' }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // At least 2 users have created similar tasks
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          name: '$_id.name',
          category: '$_id.category',
          popularity: '$count',
          avgPoints: { $round: ['$avgPoints', 0] },
          avgDuration: { $round: ['$avgDuration', 0] },
          avgDifficulty: { $round: ['$avgDifficulty', 1] },
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: { popularTasks }
    });
  } catch (error) {
    console.error('Get popular tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching popular tasks'
    });
  }
});

// @desc    Get trending categories
// @route   GET /api/explore/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;

    let dateFilter = new Date();
    if (timeframe === 'week') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeframe === 'month') {
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    } else {
      dateFilter.setDate(dateFilter.getDate() - 1); // day
    }

    const trendingCategories = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: '$category',
          taskCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $project: {
          category: '$_id',
          taskCount: 1,
          completedCount: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completedCount', '$taskCount'] }, 100] },
              1
            ]
          },
          totalPoints: 1,
          _id: 0
        }
      },
      {
        $sort: { taskCount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        trendingCategories,
        timeframe
      }
    });
  } catch (error) {
    console.error('Get trending categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trending categories'
    });
  }
});

// @desc    Get community insights
// @route   GET /api/explore/insights
// @access  Public
router.get('/insights', async (req, res) => {
  try {
    // Get various community insights
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ isCompleted: true });
    
    // Get average completion time by category
    const avgCompletionByCategory = await Task.aggregate([
      {
        $match: {
          isCompleted: true,
          estimatedDuration: { $exists: true },
          actualDuration: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$category',
          avgEstimated: { $avg: '$estimatedDuration' },
          avgActual: { $avg: '$actualDuration' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          avgEstimated: { $round: ['$avgEstimated', 0] },
          avgActual: { $round: ['$avgActual', 0] },
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$avgActual', '$avgEstimated'] }, 100] },
              1
            ]
          },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get most productive hours
    const productiveHours = await Task.aggregate([
      {
        $match: {
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          hour: { $hour: '$completedAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          hour: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalTasks,
          completedTasks,
          globalCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        avgCompletionByCategory,
        productiveHours
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community insights'
    });
  }
});

// @desc    Search tasks and templates
// @route   GET /api/explore/search
// @access  Public
router.get('/search', [
  query('q').trim().isLength({ min: 1, max: 100 }),
  query('type').optional().isIn(['tasks', 'templates', 'all']),
  query('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const {
      q: query,
      type = 'all',
      category,
      page = 1,
      limit = 20
    } = req.query;

    const results = {
      tasks: [],
      templates: []
    };

    if (type === 'tasks' || type === 'all') {
      // Search in actual tasks (anonymized)
      const searchFilter = {
        $text: { $search: query }
      };

      if (category) {
        searchFilter.category = category;
      }

      const tasks = await Task.aggregate([
        { $match: searchFilter },
        {
          $group: {
            _id: {
              name: '$name',
              category: '$category'
            },
            count: { $sum: 1 },
            avgPoints: { $avg: '$points' },
            avgDuration: { $avg: '$estimatedDuration' },
            avgDifficulty: { $avg: '$difficulty' }
          }
        },
        {
          $project: {
            name: '$_id.name',
            category: '$_id.category',
            popularity: '$count',
            avgPoints: { $round: ['$avgPoints', 0] },
            avgDuration: { $round: ['$avgDuration', 0] },
            avgDifficulty: { $round: ['$avgDifficulty', 1] },
            type: 'task',
            _id: 0
          }
        },
        { $sort: { popularity: -1 } },
        { $limit: parseInt(limit) }
      ]);

      results.tasks = tasks;
    }

    // Note: Template search would be implemented here
    // For now, returning empty array for templates

    res.json({
      success: true,
      data: {
        results,
        query,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error performing search'
    });
  }
});

export default router;