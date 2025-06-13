
import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { Task, User } from '../types';

export const useTasks = (user: User | null, isLoggedIn: boolean) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasksPercentage, setCompletedTasksPercentage] = useState(0);

  useEffect(() => {
    if (user && isLoggedIn) {
      fetchUserTasks(user.id);
    } else {
      setTasks([]);
    }
  }, [user, isLoggedIn]);

  const fetchUserTasks = async (uid: string) => {
    try {
      const db = getFirebaseFirestore();
      const tasksCollectionRef = collection(db, 'users', uid, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const tasksList: Task[] = [];
      
      tasksSnapshot.forEach((doc) => {
        tasksList.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      setTasks(tasksList);
      
      if (tasksList.length > 0) {
        const completedCount = tasksList.filter(task => task.isCompleted).length;
        const percentage = (completedCount / tasksList.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
      } else {
        setCompletedTasksPercentage(0);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const tasksCollectionRef = collection(db, 'users', uid, 'tasks');
      const newTaskRef = doc(tasksCollectionRef);
      
      const newTask = {
        ...task,
        id: newTaskRef.id,
      };
      
      await setDoc(newTaskRef, newTask);
      setTasks(prev => [...prev, newTask as Task]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const completeTask = async (id: string, onUpdateUser: (points: number, streak: number) => void) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const taskDocRef = doc(db, 'users', uid, 'tasks', id);
      
      await updateDoc(taskDocRef, { isCompleted: true });
      
      setTasks(prev => {
        const updatedTasks = prev.map(task => 
          task.id === id ? { ...task, isCompleted: true } : task
        );
        
        // Calculate percentage
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = (completedCount / updatedTasks.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
        
        return updatedTasks;
      });
      
      // Add points for completing task
      if (user) {
        const userDocRef = doc(db, 'users', uid);
        const newPoints = (user.points || 0) + 10;
        await updateDoc(userDocRef, { points: newPoints });
        onUpdateUser(newPoints, user.currentStreak);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const uncompleteTask = async (id: string) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const taskDocRef = doc(db, 'users', uid, 'tasks', id);
      
      await updateDoc(taskDocRef, { isCompleted: false });
      
      setTasks(prev => {
        const updatedTasks = prev.map(task => 
          task.id === id ? { ...task, isCompleted: false } : task
        );
        
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = updatedTasks.length > 0 ? (completedCount / updatedTasks.length) * 100 : 0;
        setCompletedTasksPercentage(Math.round(percentage));
        
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error uncompleting task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return;
    
    try {
      const db = getFirebaseFirestore();
      const uid = auth.currentUser.uid;
      const taskDocRef = doc(db, 'users', uid, 'tasks', id);
      
      await deleteDoc(taskDocRef);
      
      setTasks(prev => {
        const updatedTasks = prev.filter(task => task.id !== id);
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = updatedTasks.length > 0 ? (completedCount / updatedTasks.length) * 100 : 0;
        setCompletedTasksPercentage(Math.round(percentage));
        
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const reorderTasks = (sourceIndex: number, destinationIndex: number) => {
    setTasks(prev => {
      const newTasks = Array.from(prev);
      const [reorderedItem] = newTasks.splice(sourceIndex, 1);
      newTasks.splice(destinationIndex, 0, reorderedItem);
      return newTasks;
    });
  };

  return {
    tasks,
    completedTasksPercentage,
    addTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    reorderTasks
  };
};
