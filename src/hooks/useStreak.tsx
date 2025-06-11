
import { useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { Task } from '../types';

export const useStreak = (user: any, isLoggedIn: boolean) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user && isLoggedIn) {
      fetchUserStreak(user.id);
    } else {
      setCurrentStreak(0);
    }
  }, [user, isLoggedIn]);

  const fetchUserStreak = async (uid: string) => {
    try {
      const db = getFirebaseFirestore();
      const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
      const streakDoc = await getDoc(streakDocRef);
      
      if (streakDoc.exists()) {
        setCurrentStreak(streakDoc.data().currentStreak || 0);
      } else {
        await setDoc(streakDocRef, { currentStreak: 0, lastCompletedDate: new Date() });
        setCurrentStreak(0);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
      setCurrentStreak(0);
    }
  };

  const checkAndUpdateStreak = async (currentTasks: Task[]) => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser || currentTasks.length === 0) return;
    
    try {
      const allCompleted = currentTasks.every(task => task.isCompleted);
      
      if (allCompleted) {
        const db = getFirebaseFirestore();
        const uid = auth.currentUser.uid;
        const streakDocRef = doc(db, 'users', uid, 'streaks', 'current');
        const streakDoc = await getDoc(streakDocRef);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (streakDoc.exists()) {
          const lastCompletedDate = streakDoc.data().lastCompletedDate?.toDate() || new Date(0);
          lastCompletedDate.setHours(0, 0, 0, 0);
          
          const timeDiff = today.getTime() - lastCompletedDate.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          
          let newStreak = streakDoc.data().currentStreak || 0;
          
          if (daysDiff === 1) {
            newStreak += 1;
          } else if (daysDiff === 0) {
            // Same day, don't change streak
          } else {
            newStreak = 1;
          }
          
          await updateDoc(streakDocRef, {
            currentStreak: newStreak,
            lastCompletedDate: today
          });
          
          setCurrentStreak(newStreak);
          
          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
            currentStreak: newStreak
          });
          
          return newStreak;
        } else {
          await setDoc(streakDocRef, {
            currentStreak: 1,
            lastCompletedDate: today
          });
          
          setCurrentStreak(1);
          
          const userDocRef = doc(db, 'users', uid);
          await updateDoc(userDocRef, {
            currentStreak: 1
          });
          
          return 1;
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return {
    currentStreak,
    checkAndUpdateStreak,
    setCurrentStreak
  };
};
