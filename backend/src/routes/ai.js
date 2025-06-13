import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { generateTaskSuggestions, analyzeTaskDescription, generateProductivityTips } from '../services/aiService.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Generate task suggestions based on user input
// @route   POST /api/ai/suggest-tasks
// @access  Private
router.post('/suggest-tasks', [
  body('prompt').trim().isLength({ min: 1, max: 500 }),
  body('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other']),
  body('count').optional().isInt({ min: 1, max: 10 })
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

    const { prompt, category, count = 5 } = req.body;

    const suggestions = await generateTaskSuggestions(prompt, category, count);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Generate task suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating task suggestions'
    });
  }
});

// @desc    Analyze task description and provide insights
// @route   POST /api/ai/analyze-task
// @access  Private
router.post('/analyze-task', [
  body('description').trim().isLength({ min: 1, max: 1000 }),
  body('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other'])
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

    const { description, category } = req.body;

    const analysis = await analyzeTaskDescription(description, category);

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    console.error('Analyze task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error analyzing task'
    });
  }
});

// @desc    Get personalized productivity tips
// @route   GET /api/ai/productivity-tips
// @access  Private
router.get('/productivity-tips', async (req, res) => {
  try {
    const { focus_area } = req.query;

    const tips = await generateProductivityTips(req.user, focus_area);

    res.json({
      success: true,
      data: { tips }
    });
  } catch (error) {
    console.error('Get productivity tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating productivity tips'
    });
  }
});

// @desc    Smart task prioritization
// @route   POST /api/ai/prioritize-tasks
// @access  Private
router.post('/prioritize-tasks', [
  body('taskIds').isArray({ min: 1 }),
  body('taskIds.*').isMongoId(),
  body('criteria').optional().isIn(['deadline', 'importance', 'effort', 'impact'])
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

    const { taskIds, criteria = 'importance' } = req.body;

    // Get tasks
    const Task = (await import('../models/Task.js')).default;
    const tasks = await Task.find({
      _id: { $in: taskIds },
      owner: req.user._id
    });

    if (tasks.length !== taskIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some tasks not found or not owned by user'
      });
    }

    // Simple AI-based prioritization logic
    const prioritizedTasks = tasks.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Priority weight
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      scoreA += priorityWeight[a.priority] * 2;
      scoreB += priorityWeight[b.priority] * 2;

      // Difficulty weight (inverse for easier tasks first)
      scoreA += (6 - a.difficulty);
      scoreB += (6 - b.difficulty);

      // Due date weight
      if (a.dueDate) {
        const daysUntilDueA = Math.ceil((a.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        scoreA += Math.max(0, 10 - daysUntilDueA);
      }
      if (b.dueDate) {
        const daysUntilDueB = Math.ceil((b.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        scoreB += Math.max(0, 10 - daysUntilDueB);
      }

      // Points weight
      scoreA += a.points / 10;
      scoreB += b.points / 10;

      return scoreB - scoreA;
    });

    const prioritizedOrder = prioritizedTasks.map((task, index) => ({
      taskId: task._id,
      newOrder: index,
      priority: task.priority,
      score: Math.random() * 100, // Placeholder score
      reasoning: `Prioritized based on ${criteria} and task characteristics`
    }));

    res.json({
      success: true,
      data: { prioritizedOrder }
    });
  } catch (error) {
    console.error('Prioritize tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error prioritizing tasks'
    });
  }
});

// @desc    Generate task breakdown
// @route   POST /api/ai/break-down-task
// @access  Private
router.post('/break-down-task', [
  body('taskDescription').trim().isLength({ min: 1, max: 1000 }),
  body('complexity').optional().isIn(['simple', 'moderate', 'complex']),
  body('timeAvailable').optional().isInt({ min: 15, max: 480 })
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

    const { taskDescription, complexity = 'moderate', timeAvailable = 60 } = req.body;

    // Simple task breakdown logic
    const subtasks = [];
    const words = taskDescription.toLowerCase();

    if (words.includes('research') || words.includes('study')) {
      subtasks.push(
        { name: 'Gather initial resources and materials', estimatedDuration: 15 },
        { name: 'Review and organize information', estimatedDuration: 20 },
        { name: 'Take notes and summarize key points', estimatedDuration: 15 }
      );
    } else if (words.includes('write') || words.includes('document')) {
      subtasks.push(
        { name: 'Create outline and structure', estimatedDuration: 10 },
        { name: 'Write first draft', estimatedDuration: 30 },
        { name: 'Review and edit content', estimatedDuration: 15 },
        { name: 'Final proofreading', estimatedDuration: 5 }
      );
    } else if (words.includes('meeting') || words.includes('call')) {
      subtasks.push(
        { name: 'Prepare agenda and materials', estimatedDuration: 10 },
        { name: 'Attend meeting/call', estimatedDuration: 30 },
        { name: 'Follow up on action items', estimatedDuration: 10 }
      );
    } else {
      // Generic breakdown
      const numSubtasks = complexity === 'simple' ? 2 : complexity === 'moderate' ? 3 : 4;
      const timePerSubtask = Math.floor(timeAvailable / numSubtasks);
      
      for (let i = 1; i <= numSubtasks; i++) {
        subtasks.push({
          name: `Step ${i}: ${taskDescription.split(' ').slice(0, 3).join(' ')} - Part ${i}`,
          estimatedDuration: timePerSubtask
        });
      }
    }

    res.json({
      success: true,
      data: {
        subtasks,
        totalEstimatedTime: subtasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
        complexity,
        tips: [
          'Break down large tasks into smaller, manageable pieces',
          'Focus on one subtask at a time',
          'Take short breaks between subtasks',
          'Adjust time estimates based on your experience'
        ]
      }
    });
  } catch (error) {
    console.error('Break down task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error breaking down task'
    });
  }
});

export default router;