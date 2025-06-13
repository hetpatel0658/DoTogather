import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { sendTaskReminder, sendWeeklyReport, sendCustomEmail } from '../services/emailService.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Send task reminder email
// @route   POST /api/email/task-reminder
// @access  Private
router.post('/task-reminder', [
  body('taskId').isMongoId(),
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

    const { taskId, reminderTime } = req.body;

    // Get task
    const Task = (await import('../models/Task.js')).default;
    const task = await Task.findOne({
      _id: taskId,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Send reminder email
    await sendTaskReminder(req.user.email, task, reminderTime);

    res.json({
      success: true,
      message: 'Task reminder email sent successfully'
    });
  } catch (error) {
    console.error('Send task reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending task reminder'
    });
  }
});

// @desc    Send weekly report email
// @route   POST /api/email/weekly-report
// @access  Private
router.post('/weekly-report', async (req, res) => {
  try {
    // Generate weekly report data
    const Task = (await import('../models/Task.js')).default;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyStats = await Task.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          totalPoints: {
            $sum: { $cond: ['$isCompleted', '$points', 0] }
          },
          categories: {
            $push: {
              $cond: ['$isCompleted', '$category', null]
            }
          }
        }
      }
    ]);

    const reportData = weeklyStats.length > 0 ? weeklyStats[0] : {
      totalTasks: 0,
      completedTasks: 0,
      totalPoints: 0,
      categories: []
    };

    // Send weekly report email
    await sendWeeklyReport(req.user.email, req.user.username, reportData);

    res.json({
      success: true,
      message: 'Weekly report email sent successfully'
    });
  } catch (error) {
    console.error('Send weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending weekly report'
    });
  }
});

// @desc    Update email preferences
// @route   PUT /api/email/preferences
// @access  Private
router.put('/preferences', [
  body('emailNotifications').isBoolean(),
  body('taskReminders').isBoolean(),
  body('weeklyReports').isBoolean(),
  body('marketingEmails').optional().isBoolean()
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

    const { emailNotifications, taskReminders, weeklyReports, marketingEmails } = req.body;

    // Update user preferences
    const User = (await import('../models/User.js')).default;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'preferences.notifications.email': emailNotifications,
        'preferences.notifications.reminders': taskReminders,
        'preferences.notifications.weeklyReports': weeklyReports,
        ...(marketingEmails !== undefined && {
          'preferences.notifications.marketing': marketingEmails
        })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Email preferences updated successfully',
      data: {
        preferences: user.preferences.notifications
      }
    });
  } catch (error) {
    console.error('Update email preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating email preferences'
    });
  }
});

// @desc    Test email configuration
// @route   POST /api/email/test
// @access  Private
router.post('/test', async (req, res) => {
  try {
    // Send test email
    await sendCustomEmail(
      req.user.email,
      'DoTogather Email Test',
      `
      <h2>Email Configuration Test</h2>
      <p>Hello ${req.user.username || 'User'},</p>
      <p>This is a test email to verify that your email configuration is working correctly.</p>
      <p>If you received this email, everything is set up properly!</p>
      <br>
      <p>Best regards,<br>The DoTogather Team</p>
      `,
      `
      Email Configuration Test
      
      Hello ${req.user.username || 'User'},
      
      This is a test email to verify that your email configuration is working correctly.
      If you received this email, everything is set up properly!
      
      Best regards,
      The DoTogather Team
      `
    );

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending test email'
    });
  }
});

export default router;