
import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskReminderNotificationProps {
  onMarkComplete?: (taskId: string) => void;
}

const TaskReminderNotification = ({ onMarkComplete }: TaskReminderNotificationProps) => {
  const [reminder, setReminder] = useState<{ task: Task; id: number } | null>(null);

  useEffect(() => {
    const handleTaskReminder = (event: CustomEvent) => {
      const { task } = event.detail;
      setReminder({ task, id: Date.now() });
    };

    window.addEventListener('taskReminder', handleTaskReminder as EventListener);

    return () => {
      window.removeEventListener('taskReminder', handleTaskReminder as EventListener);
    };
  }, []);

  const handleClose = () => {
    setReminder(null);
  };

  const handleMarkComplete = () => {
    if (reminder && onMarkComplete) {
      onMarkComplete(reminder.task.id);
    }
    setReminder(null);
  };

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        >
          <div className="bg-app-lightblue border border-app-teal rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Bell className="h-6 w-6 text-app-teal animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm">Task Reminder</h4>
                <p className="text-gray-300 text-sm mt-1 truncate">
                  {reminder.task.name}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  It's time for your {reminder.task.frequency} task!
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 text-gray-400 hover:text-white flex-shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleMarkComplete}
                className="flex-1 bg-app-teal hover:bg-app-teal/90 text-black text-xs h-8"
              >
                Mark Complete
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="flex-1 text-gray-300 hover:text-white text-xs h-8"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskReminderNotification;
