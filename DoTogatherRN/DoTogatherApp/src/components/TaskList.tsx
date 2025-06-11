import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  showCompleted?: boolean;
  maxItems?: number;
  onTaskPress?: (task: Task) => void;
  onTaskComplete?: (taskId: number) => void;
  onTaskDelete?: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  showCompleted = true,
  maxItems,
  onTaskPress,
  onTaskComplete,
  onTaskDelete,
}) => {
  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => !task.isCompleted);

  const displayTasks = maxItems 
    ? filteredTasks.slice(0, maxItems)
    : filteredTasks;

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => onTaskPress?.(item)}
      onComplete={() => onTaskComplete?.(item.id)}
      onDelete={() => onTaskDelete?.(item.id)}
    />
  );

  if (displayTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {showCompleted ? 'No tasks yet' : 'No pending tasks'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
      
      {maxItems && filteredTasks.length > maxItems && (
        <TouchableOpacity style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>
            Show {filteredTasks.length - maxItems} more tasks
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  showMoreButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  showMoreText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TaskList;