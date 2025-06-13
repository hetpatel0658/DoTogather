import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Task from '../models/TaskStorage.js';
import User from '../models/UserStorage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other']),
  body('estimatedDuration').optional().isInt({ min: 1, max: 1440 }),
  body('points').optional().isInt({ min: 1, max: 100 }),
  body('difficulty').optional().isInt({ min: 1, max: 5 }),
  body('dueDate').optional().isISO8601(),
  body('reminderTime').optional().isISO8601()
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

    // Get the highest order index for this user
    const maxOrderTask = await Task.findOne({ owner: req.user._id }).sort({ orderIndex: -1 });
    const orderIndex = maxOrderTask ? maxOrderTask.orderIndex + 1 : 0;

    const taskData = {
      ...req.body,
      owner: req.user._id,
      orderIndex
    };

    const task = await Task.create(taskData);
    await task.populate('owner', 'username email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
});

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
router.get('/', [
  query('completed').optional().isBoolean(),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other']),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'priority', 'orderIndex']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const {
      completed,
      priority,
      category,
      sortBy = 'orderIndex',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    // Build filter
    const filter = { owner: req.user._id };
    
    if (completed !== undefined) {
      filter.isCompleted = completed === 'true';
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (category) {
      filter.category = category;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tasks
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'username email');

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('owner', 'username email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task'
    });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('category').optional().isIn(['work', 'personal', 'health', 'learning', 'social', 'other']),
  body('estimatedDuration').optional().isInt({ min: 1, max: 1440 }),
  body('points').optional().isInt({ min: 1, max: 100 }),
  body('difficulty').optional().isInt({ min: 1, max: 5 }),
  body('isCompleted').optional().isBoolean(),
  body('dueDate').optional().isISO8601(),
  body('reminderTime').optional().isISO8601()
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

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const wasCompleted = task.isCompleted;
    const updateData = req.body;

    // Update task
    Object.assign(task, updateData);
    await task.save();

    // Handle completion logic
    if (updateData.isCompleted !== undefined) {
      const user = await User.findById(req.user._id);
      
      if (updateData.isCompleted && !wasCompleted) {
        // Task completed - add points and update streak
        const pointsEarned = task.calculatePoints();
        user.points += pointsEarned;
        user.updateStreak();
        user.calculateLevel();
        await user.save();
      } else if (!updateData.isCompleted && wasCompleted) {
        // Task uncompleted - subtract points
        const pointsLost = task.calculatePoints();
        user.points = Math.max(0, user.points - pointsLost);
        user.calculateLevel();
        await user.save();
      }
    }

    await task.populate('owner', 'username email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If task was completed, subtract points from user
    if (task.isCompleted) {
      const user = await User.findById(req.user._id);
      const pointsLost = task.calculatePoints();
      user.points = Math.max(0, user.points - pointsLost);
      user.calculateLevel();
      await user.save();
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
});

// @desc    Reorder tasks
// @route   PUT /api/tasks/reorder
// @access  Private
router.put('/reorder', [
  body('taskIds').isArray({ min: 1 }),
  body('taskIds.*').isMongoId()
], async (req, res) => {
  try {
    const { taskIds } = req.body;

    // Verify all tasks belong to the user
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

    // Update order indices
    const updatePromises = taskIds.map((taskId, index) =>
      Task.findByIdAndUpdate(taskId, { orderIndex: index })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reordering tasks'
    });
  }
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get basic counts
    const totalTasks = await Task.countDocuments({ owner: userId });
    const completedTasks = await Task.countDocuments({ owner: userId, isCompleted: true });
    const pendingTasks = await Task.countDocuments({ owner: userId, isCompleted: false });
    const overdueTasks = await Task.countDocuments({
      owner: userId,
      isCompleted: false,
      dueDate: { $lt: new Date() }
    });

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get tasks by category
    const tasksByCategory = await Task.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get completion rate by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completionByDay = await Task.aggregate([
      {
        $match: {
          owner: userId,
          completedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        tasksByPriority: tasksByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        tasksByCategory: tasksByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        completionByDay
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task statistics'
    });
  }
});

// @desc    Add subtask
// @route   POST /api/tasks/:id/subtasks
// @access  Private
router.post('/:id/subtasks', [
  body('name').trim().isLength({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const { name } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.subtasks.push({ name });
    await task.save();

    res.json({
      success: true,
      message: 'Subtask added successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding subtask'
    });
  }
});

// @desc    Update subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @access  Private
router.put('/:id/subtasks/:subtaskId', [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('isCompleted').optional().isBoolean()
], async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    if (req.body.name !== undefined) {
      subtask.name = req.body.name;
    }

    if (req.body.isCompleted !== undefined) {
      subtask.isCompleted = req.body.isCompleted;
      subtask.completedAt = req.body.isCompleted ? new Date() : null;
    }

    await task.save();

    res.json({
      success: true,
      message: 'Subtask updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subtask'
    });
  }
});

// @desc    Delete subtask
// @route   DELETE /api/tasks/:id/subtasks/:subtaskId
// @access  Private
router.delete('/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    subtask.deleteOne();
    await task.save();

    res.json({
      success: true,
      message: 'Subtask deleted successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting subtask'
    });
  }
});

export default router;