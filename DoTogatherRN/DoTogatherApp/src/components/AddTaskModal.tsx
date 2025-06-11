import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  editTask?: Task;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  editTask,
}) => {
  const { addTask, updateTask } = useAppContext();
  
  const [name, setName] = useState(editTask?.name || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    editTask?.priority || 'medium'
  );
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'learning' | 'social' | 'other'>(
    editTask?.category || 'other'
  );
  const [points, setPoints] = useState(editTask?.points?.toString() || '10');
  const [difficulty, setDifficulty] = useState(editTask?.difficulty || 1);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriority('medium');
    setCategory('other');
    setPoints('10');
    setDifficulty(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    const pointsValue = parseInt(points) || 10;
    if (pointsValue < 1 || pointsValue > 100) {
      Alert.alert('Error', 'Points must be between 1 and 100');
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        points: pointsValue,
        difficulty,
        isCompleted: false,
      };

      if (editTask) {
        await updateTask(editTask.id, taskData);
      } else {
        await addTask(taskData);
      }

      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#FF5722' },
  ] as const;

  const categories = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'other', label: 'Other', icon: '📝' },
  ] as const;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editTask ? 'Edit Task' : 'Add New Task'}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
            <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Task Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter task name"
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionsRow}>
              {priorities.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    priority === option.value && {
                      backgroundColor: option.color,
                    },
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      priority === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryButton,
                    category === option.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(option.value)}
                >
                  <Text style={styles.categoryIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      category === option.value && styles.categoryTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Points (1-100)</Text>
            <TextInput
              style={styles.input}
              value={points}
              onChangeText={setPoints}
              placeholder="10"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.difficultyRow}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty >= level && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      difficulty >= level && styles.difficultyTextActive,
                    ]}
                  >
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#CCC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  difficultyButton: {
    padding: 8,
    marginRight: 8,
  },
  difficultyButtonActive: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 20,
    opacity: 0.3,
  },
  difficultyTextActive: {
    opacity: 1,
  },
});

export default AddTaskModal;