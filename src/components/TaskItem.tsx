
import React, { memo } from 'react';
import { Task } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Check, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
}

// Use memo to prevent unnecessary re-renders
const TaskItem = memo(({ task }: TaskItemProps) => {
  const { completeTask, uncompleteTask, deleteTask } = useAppContext();

  const handleToggle = () => {
    if (task.isCompleted) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click
    if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
      deleteTask(task.id);
    }
  };

  // Format frequency for screen readers
  const getFrequencyText = () => {
    switch (task.frequency) {
      case 'every-3-hours':
        return 'every 3 hours';
      case 'mon-wed-fri':
        return 'Monday, Wednesday, Friday';
      case 'weekly':
        return 'Weekly';
      case 'daily':
        return 'Daily';
      default:
        return task.frequency;
    }
  };

  return (
    <motion.div 
      className="flex items-center p-3 sm:p-4 bg-app-lightblue rounded-lg mb-3 hover:bg-app-lightblue/90 transition-colors"
      role="listitem"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <motion.button 
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-3 border-2 ${
          task.isCompleted 
            ? 'bg-app-teal border-app-teal' 
            : 'border-gray-400 bg-transparent hover:border-app-teal'
        }`}
        onClick={handleToggle}
        aria-label={task.isCompleted ? `Mark ${task.name} as incomplete` : `Mark ${task.name} as complete`}
        aria-pressed={task.isCompleted}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {task.isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check size={16} color="black" aria-hidden="true" />
          </motion.div>
        )}
      </motion.button>
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm sm:text-base truncate ${task.isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
          {task.name}
        </h3>
        <div className="flex items-center text-xs sm:text-sm text-gray-400">
          <span aria-label={`Frequency: ${getFrequencyText()}`}>
            {getFrequencyText()}
          </span>
          {task.reminderTime && (
            <div className="flex items-center ml-2 text-gray-500" aria-label={`Reminder at ${task.reminderTime}`}>
              <Clock size={12} className="mr-1" />
              <span>{task.reminderTime}</span>
            </div>
          )}
        </div>
      </div>
      <motion.button
        onClick={handleDelete}
        className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-700/30 transition-colors ml-2"
        aria-label={`Delete task: ${task.name}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Trash2 size={16} />
      </motion.button>
    </motion.div>
  );
});

export default TaskItem;
