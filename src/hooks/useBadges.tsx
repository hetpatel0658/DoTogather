
import { useState } from 'react';
import { Badge } from '../types';
import { evaluateTaskForBadge } from '../services/badgeEvaluationService';

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'First Steps', icon: '👟', description: 'Complete your first task', earned: false },
    { id: '2', name: 'Streak Starter', icon: '🔥', description: 'Maintain a 3-day streak', earned: false },
    { id: '3', name: 'Consistency King', icon: '👑', description: 'Complete all tasks for a full week', earned: false },
  ]);

  const updateBadges = (newStreak: number) => {
    const updatedBadges = [...badges];
    
    // First Steps badge
    if (newStreak >= 1 && !badges[0].earned) {
      updatedBadges[0] = { ...updatedBadges[0], earned: true };
    }
    
    // Streak Starter badge
    if (newStreak >= 3 && !badges[1].earned) {
      updatedBadges[1] = { ...updatedBadges[1], earned: true };
    }
    
    // Consistency King badge
    if (newStreak >= 7 && !badges[2].earned) {
      updatedBadges[2] = { ...updatedBadges[2], earned: true };
    }
    
    setBadges(updatedBadges);
  };

  const evaluateAndAwardSpecialBadge = async (taskName: string, userStats: {
    completedTasks: number;
    currentStreak: number;
    points: number;
  }) => {
    try {
      const evaluation = await evaluateTaskForBadge(taskName, userStats);
      
      if (evaluation.shouldAwardBadge && evaluation.badgeData) {
        // Check if badge already exists
        const existingBadge = badges.find(badge => badge.name === evaluation.badgeData!.name);
        
        if (!existingBadge) {
          const newBadge: Badge = {
            id: `special-${Date.now()}`,
            name: evaluation.badgeData.name,
            icon: evaluation.badgeData.icon,
            description: evaluation.badgeData.description,
            earned: true
          };
          
          setBadges(prev => [...prev, newBadge]);
          return newBadge;
        }
      }
    } catch (error) {
      console.error('Error evaluating special badge:', error);
    }
    
    return null;
  };

  return {
    badges,
    updateBadges,
    evaluateAndAwardSpecialBadge
  };
};
