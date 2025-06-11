import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { LogOut, Flame, CheckCircle, Award, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';

const Dashboard = () => {
  const { currentStreak, badges, completedTasksPercentage, user, logout } = useAppContext();
  const { toast } = useToast();

  // Mock weekly data - in a real app, this would come from Firestore
  const weeklyData = [
    { day: 'M', height: 40 },
    { day: 'T', height: 60 },
    { day: 'W', height: 45 },
    { day: 'T', height: 80 },
    { day: 'F', height: 50 },
    { day: 'S', height: 85 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-gray-400 hover:text-white"
        >
          <LogOut size={18} />
        </Button>
      </motion.div>

      {user && (
        <motion.div 
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <StatsCard 
            title="Current Streak" 
            value={`${currentStreak} days`} 
            icon={<Flame size={20} className="text-white" />} 
            color="bg-pink-500/20" 
            delay={0.1}
          />
          <StatsCard 
            title="Completion Rate" 
            value={`${completedTasksPercentage}%`} 
            icon={<CheckCircle size={20} className="text-white" />} 
            color="bg-app-teal/20" 
            delay={0.2}
          />
          <StatsCard 
            title="Total Points" 
            value={user.points} 
            icon={<Award size={20} className="text-white" />} 
            color="bg-app-purple/20" 
            delay={0.3}
          />
          <StatsCard 
            title="Badges Earned" 
            value={badges.filter(b => b.earned).length} 
            icon={<Award size={20} className="text-white" />} 
            color="bg-yellow-500/20" 
            delay={0.4}
          />
        </motion.div>
      )}

      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
          <BarChart2 size={18} className="mr-2 text-app-teal" />
          Weekly Activity
        </h3>
        <div className="bg-app-lightblue rounded-xl p-4">
          <div className="flex justify-between items-end h-44 mb-2">
            {weeklyData.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              >
                <motion.div 
                  className="w-8 sm:w-10 rounded-t-md" 
                  style={{ 
                    height: `${item.height}%`,
                    backgroundColor: index === 3 ? '#06D6D6' : (index === 5 ? '#06D6D6' : '#5B5FC7') 
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${item.height}%` }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                ></motion.div>
                <div className="text-gray-400 mt-2 text-sm">{item.day}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
          <Award size={18} className="mr-2 text-app-purple" />
          Badges
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, index) => (
            <motion.div 
              key={badge.id} 
              className={`bg-app-lightblue rounded-lg p-3 flex flex-col items-center ${
                badge.earned ? '' : 'opacity-50'
              }`}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            >
              <div className="text-2xl sm:text-3xl mb-1">{badge.icon}</div>
              <div className="text-xs text-center text-white">{badge.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
