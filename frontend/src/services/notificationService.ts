
import { Task } from '../types';

class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, number> = new Map();

  private constructor() {
    this.requestPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  scheduleTaskReminder(task: Task): void {
    if (!task.reminderTime) return;

    // Clear existing notification for this task
    this.clearTaskReminder(task.id);

    const now = new Date();
    const [hours, minutes] = task.reminderTime.split(':').map(Number);
    
    // Create reminder time for today
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    const delay = reminderDate.getTime() - now.getTime();

    const timeoutId = window.setTimeout(() => {
      this.showNotification(task);
      // Reschedule for next occurrence based on frequency
      this.rescheduleBasedOnFrequency(task);
    }, delay);

    this.scheduledNotifications.set(task.id, timeoutId);
    console.log(`Scheduled reminder for "${task.name}" at ${task.reminderTime}`);
  }

  private rescheduleBasedOnFrequency(task: Task): void {
    const now = new Date();
    const [hours, minutes] = task.reminderTime!.split(':').map(Number);
    let nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);

    switch (task.frequency) {
      case 'daily':
        nextReminder.setDate(nextReminder.getDate() + 1);
        break;
      case 'weekly':
        nextReminder.setDate(nextReminder.getDate() + 7);
        break;
      case 'mon-wed-fri':
        // Find next Monday, Wednesday, or Friday
        const dayOfWeek = nextReminder.getDay();
        let daysToAdd = 1;
        
        if (dayOfWeek === 1) daysToAdd = 2; // Monday -> Wednesday
        else if (dayOfWeek === 3) daysToAdd = 2; // Wednesday -> Friday
        else if (dayOfWeek === 5) daysToAdd = 3; // Friday -> Monday
        else {
          // Find next Monday, Wednesday, or Friday
          const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
          const daysUntilWednesday = (10 - dayOfWeek) % 7 || 7;
          const daysUntilFriday = (12 - dayOfWeek) % 7 || 7;
          daysToAdd = Math.min(daysUntilMonday, daysUntilWednesday, daysUntilFriday);
        }
        
        nextReminder.setDate(nextReminder.getDate() + daysToAdd);
        break;
      case 'every-3-hours':
        nextReminder.setHours(nextReminder.getHours() + 3);
        break;
    }

    const delay = nextReminder.getTime() - now.getTime();
    
    const timeoutId = window.setTimeout(() => {
      this.showNotification(task);
      this.rescheduleBasedOnFrequency(task);
    }, delay);

    this.scheduledNotifications.set(task.id, timeoutId);
  }

  clearTaskReminder(taskId: string): void {
    const timeoutId = this.scheduledNotifications.get(taskId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      this.scheduledNotifications.delete(taskId);
    }
  }

  private async showNotification(task: Task): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    // Browser notification
    const notification = new Notification(`Task Reminder: ${task.name}`, {
      body: `It's time for your ${task.frequency} task!`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: task.id,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // In-app notification using custom event
    window.dispatchEvent(new CustomEvent('taskReminder', {
      detail: { task }
    }));
  }

  scheduleAllTaskReminders(tasks: Task[]): void {
    tasks.forEach(task => {
      if (task.reminderTime && !task.isCompleted) {
        this.scheduleTaskReminder(task);
      }
    });
  }

  clearAllReminders(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }
}

export default NotificationService;
