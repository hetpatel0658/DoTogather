import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Task } from '../types';
import { useAppContext } from '../context/AppContext';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onComplete,
  onDelete,
}) => {
  const { completeTask, uncompleteTask, deleteTask } = useAppContext();

  const handleToggleComplete = async () => {
    try {
      if (task.isCompleted) {
        await uncompleteTask(task.id);
      } else {
        await completeTask(task.id);
      }
      onComplete?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              onDelete?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF5722';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return '💼';
      case 'personal':
        return '👤';
      case 'health':
        return '🏥';
      case 'learning':
        return '📚';
      case 'social':
        return '👥';
      default:
        return '📝';
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    return `Due in ${diffDays} days`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.isCompleted && styles.completedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            task.isCompleted && styles.checkedBox,
          ]}
          onPress={handleToggleComplete}
        >
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.taskInfo}>
          <View style={styles.taskHeader}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(task.category)}
            </Text>
            <Text
              style={[
                styles.taskName,
                task.isCompleted && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.name}
            </Text>
          </View>

          {task.description && (
            <Text
              style={[
                styles.taskDescription,
                task.isCompleted && styles.completedText,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          <View style={styles.taskMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {task.priority.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.points}>+{task.points} pts</Text>

            {task.dueDate && (
              <Text
                style={[
                  styles.dueDate,
                  new Date(task.dueDate) < new Date() && !task.isCompleted && styles.overdue,
                ]}
              >
                {formatDueDate(task.dueDate)}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  taskName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 8,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  overdue: {
    color: '#FF5722',
    fontWeight: '600',
  },
  deleteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
});

export default TaskItem;