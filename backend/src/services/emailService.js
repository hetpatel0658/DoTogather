import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // Use SendGrid
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Use SMTP (for development/testing)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@dotogather.com',
    to: email,
    subject: 'Verify Your DoTogather Account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #3B82F6;">Welcome to DoTogather!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          If you didn't create an account with DoTogather, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
      Welcome to DoTogather!
      
      Thank you for signing up. Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with DoTogather, you can safely ignore this email.
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@dotogather.com',
    to: email,
    subject: 'Reset Your DoTogather Password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #3B82F6;">Password Reset Request</h2>
        <p>You requested to reset your password for your DoTogather account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
      Password Reset Request
      
      You requested to reset your password for your DoTogather account.
      
      Please visit the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you didn't request a password reset, you can safely ignore this email.
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send task reminder email
export const sendTaskReminder = async (email, task, reminderTime) => {
  const transporter = createTransporter();
  const taskUrl = `${process.env.FRONTEND_URL}/tasks/${task._id}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@dotogather.com',
    to: email,
    subject: `Reminder: ${task.name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #3B82F6;">Task Reminder</h2>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1F2937;">${task.name}</h3>
          ${task.description ? `<p style="margin: 0; color: #6B7280;">${task.description}</p>` : ''}
          <div style="margin-top: 15px;">
            <span style="background-color: #3B82F6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${task.category.toUpperCase()}
            </span>
            <span style="background-color: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">
              ${task.points} points
            </span>
          </div>
        </div>
        ${task.dueDate ? `<p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
        ${task.estimatedDuration ? `<p><strong>Estimated Duration:</strong> ${task.estimatedDuration} minutes</p>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${taskUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Task
          </a>
        </div>
      </div>
    `,
    text: `
      Task Reminder: ${task.name}
      
      ${task.description || ''}
      
      Category: ${task.category}
      Points: ${task.points}
      ${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
      ${task.estimatedDuration ? `Estimated Duration: ${task.estimatedDuration} minutes` : ''}
      
      View task: ${taskUrl}
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send weekly report email
export const sendWeeklyReport = async (email, username, reportData) => {
  const transporter = createTransporter();
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

  const completionRate = reportData.totalTasks > 0 
    ? Math.round((reportData.completedTasks / reportData.totalTasks) * 100) 
    : 0;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@dotogather.com',
    to: email,
    subject: 'Your Weekly DoTogather Report',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #3B82F6;">Weekly Report</h2>
        <p>Hello ${username || 'there'}!</p>
        <p>Here's your productivity summary for this week:</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="text-align: center;">
              <h3 style="margin: 0; color: #3B82F6; font-size: 24px;">${reportData.completedTasks}</h3>
              <p style="margin: 5px 0 0 0; color: #6B7280;">Tasks Completed</p>
            </div>
            <div style="text-align: center;">
              <h3 style="margin: 0; color: #10B981; font-size: 24px;">${reportData.totalPoints}</h3>
              <p style="margin: 5px 0 0 0; color: #6B7280;">Points Earned</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <h3 style="margin: 0; color: #8B5CF6; font-size: 24px;">${completionRate}%</h3>
            <p style="margin: 5px 0 0 0; color: #6B7280;">Completion Rate</p>
          </div>
        </div>
        
        ${reportData.completedTasks > 0 ? `
          <p>🎉 Great job this week! You completed ${reportData.completedTasks} tasks and earned ${reportData.totalPoints} points.</p>
        ` : `
          <p>📝 Don't worry if this week was slow - every small step counts! Try setting some achievable goals for next week.</p>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px;">
          Keep up the great work! Remember, consistency is key to building productive habits.
        </p>
      </div>
    `,
    text: `
      Weekly Report
      
      Hello ${username || 'there'}!
      
      Here's your productivity summary for this week:
      
      Tasks Completed: ${reportData.completedTasks}
      Points Earned: ${reportData.totalPoints}
      Completion Rate: ${completionRate}%
      
      ${reportData.completedTasks > 0 
        ? `Great job this week! You completed ${reportData.completedTasks} tasks and earned ${reportData.totalPoints} points.`
        : `Don't worry if this week was slow - every small step counts! Try setting some achievable goals for next week.`
      }
      
      View your dashboard: ${dashboardUrl}
      
      Keep up the great work! Remember, consistency is key to building productive habits.
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send custom email
export const sendCustomEmail = async (to, subject, htmlContent, textContent) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@dotogather.com',
    to,
    subject,
    html: htmlContent,
    text: textContent
  };

  await transporter.sendMail(mailOptions);
};