
import { useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { UserProfile, Badge } from '../types';

export const useProfiles = (currentUserId?: string) => {
  const fetchPublicProfiles = async (): Promise<UserProfile[]> => {
    try {
      const db = getFirebaseFirestore();
      const usersQuery = query(
        collection(db, 'users'),
        where('isPublicProfile', '==', true)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const profiles: UserProfile[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        if (userDoc.id === currentUserId) continue;
        
        const userData = userDoc.data();
        
        if (!userData.username) continue;
        
        const badgesSnapshot = await getDocs(collection(db, 'users', userDoc.id, 'badges'));
        const userBadges: Badge[] = badgesSnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data()
        } as Badge));
        
        profiles.push({
          id: userDoc.id,
          username: userData.username,
          points: userData.points || 0,
          currentStreak: userData.currentStreak || 0,
          badges: userBadges,
          isPublicProfile: true
        });
      }
      
      return profiles;
    } catch (error) {
      console.error('Error fetching public profiles:', error);
      return [];
    }
  };

  return {
    fetchPublicProfiles
  };
};
