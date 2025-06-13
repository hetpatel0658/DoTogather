
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Award, LogOut, User, Settings, Calendar, Share2, Globe, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user, badges, currentStreak, logout, updateProfileVisibility } = useAppContext();
  const [isPublic, setIsPublic] = useState(user?.isPublicProfile || false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileVisibilityChange = async (newValue: boolean) => {
    try {
      await updateProfileVisibility(newValue);
      setIsPublic(newValue);
      toast({
        title: newValue ? 'Profile is now public' : 'Profile is now private',
        description: newValue 
          ? 'Other users can now see your profile in the Explore tab' 
          : 'Your profile is now hidden from other users',
      });
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile visibility',
      });
    }
  };

  const handleShareStreak = () => {
    // Create the text to share
    const shareText = `🔥 I'm on a ${currentStreak}-day streak with my Daily Micro-Task Planner! Join me and build better habits!`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: 'My Daily Streak',
        text: shareText,
        url: window.location.origin,
      })
      .then(() => toast({ title: 'Shared successfully!' }))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareText)
        .then(() => toast({ 
          title: 'Copied to clipboard', 
          description: 'Text copied to clipboard. You can paste it in your social media app.' 
        }))
        .catch(() => toast({ 
          title: 'Failed to copy', 
          description: 'Could not copy text to clipboard.'
        }));
    }
  };

  // Filter to show only earned badges
  const earnedBadges = badges.filter(badge => badge.earned);

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage your account and view your achievements</p>
      </motion.div>

      {user && (
        <motion.div
          className="bg-app-lightblue rounded-xl p-4 sm:p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-app-darkblue rounded-full flex items-center justify-center mr-4">
              <User size={32} className="text-app-teal" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {user.username || 'Username not set'}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-app-darkblue/50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Award size={16} className="text-app-purple mr-2" />
                <span className="text-gray-300 text-sm">Points</span>
              </div>
              <p className="text-white font-bold text-lg">{user.points}</p>
            </div>
            <div className="bg-app-darkblue/50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Calendar size={16} className="text-app-teal mr-2" />
                <span className="text-gray-300 text-sm">Current Streak</span>
              </div>
              <p className="text-white font-bold text-lg">{currentStreak} days</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-app-darkblue/30 rounded-lg mb-4">
            <div className="flex items-center">
              {isPublic ? (
                <Globe size={18} className="text-app-teal mr-2" />
              ) : (
                <Lock size={18} className="text-gray-400 mr-2" />
              )}
              <span className="text-sm text-gray-300">Public profile</span>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleProfileVisibilityChange}
              className="data-[state=checked]:bg-app-teal"
            />
          </div>

          <Button
            variant="outline"
            className="w-full mb-2 flex items-center justify-center border-app-teal/50 hover:bg-app-teal/10 text-app-teal"
            onClick={handleShareStreak}
          >
            <Share2 size={16} className="mr-2" />
            Share My Streak
          </Button>
        </motion.div>
      )}

      <motion.div
        className="bg-app-lightblue rounded-xl p-4 sm:p-6 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Award size={18} className="text-app-purple mr-2" />
          Badges ({earnedBadges.length})
        </h3>
        
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.id}
                className="p-3 rounded-lg flex flex-col items-center justify-center text-center bg-app-darkblue/70"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <h4 className="text-sm font-medium text-white">{badge.name}</h4>
                <p className="text-xs text-gray-300 mt-1">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-400">No badges earned yet</p>
            <p className="text-gray-500 text-sm mt-1">Complete challenging tasks to earn special badges!</p>
          </div>
        )}
      </motion.div>

      <motion.div
        className="mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          variant="outline"
          className="w-full flex items-center justify-center text-red-400 border-red-400/30 hover:bg-red-400/10"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
