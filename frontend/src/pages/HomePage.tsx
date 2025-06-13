import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mic, MicOff, Plus, BarChart2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/StatsCard';
import TaskList from '@/components/TaskList';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const {
    user,
    tasks,
    currentStreak,
    completedTasksPercentage,
    setActiveTab,
  } = useAppContext();
  
  const { toast } = useToast();
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter today's tasks
  const today = new Date().toDateString();
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt || Date.now()).toDateString();
    return taskDate === today;
  });

  const completedToday = todayTasks.filter(task => task.isCompleted).length;
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Data has been updated",
      });
    }, 1000);
  };

  const toggleVoiceListening = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      toast({
        title: "Voice stopped",
        description: "Voice listening has been stopped",
      });
    } else {
      setIsVoiceListening(true);
      toast({
        title: "Voice started",
        description: "Listening for voice commands...",
      });
      // Simulate voice listening timeout
      setTimeout(() => {
        setIsVoiceListening(false);
      }, 5000);
    }
  };

  const toggleWakeWord = () => {
    setWakeWordEnabled(!wakeWordEnabled);
    toast({
      title: wakeWordEnabled ? "Wake word disabled" : "Wake word enabled",
      description: wakeWordEnabled 
        ? "Wake word detection has been turned off" 
        : "Say 'Hey DoTogather' to activate voice commands",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="p-6 pt-12">
          {/* Welcome section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold">
                {user?.username || user?.email?.split('@')[0] || 'User'}!
              </h1>
            </div>
            
            {/* Wake word indicator */}
            <motion.button
              onClick={toggleWakeWord}
              className={`p-2 rounded-full ${
                wakeWordEnabled ? 'bg-green-500' : 'bg-gray-500'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={16} />
            </motion.button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatsCard
              title="Today's Tasks"
              value={`${completedToday}/${todayTasks.length}`}
              icon={<BarChart2 size={16} />}
              color="bg-blue-500/20"
            />
            <StatsCard
              title="Current Streak"
              value={currentStreak.toString()}
              icon={<Award size={16} />}
              color="bg-green-500/20"
            />
            <StatsCard
              title="Total Points"
              value={user?.points?.toString() || '0'}
              icon={<Award size={16} />}
              color="bg-orange-500/20"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Refresh button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Tasks</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        {/* Today's tasks */}
        <div className="mb-6">
          {todayTasks.length > 0 ? (
            <TaskList tasks={todayTasks.slice(0, 5)} />
          ) : (
            <div className="bg-white rounded-lg p-6 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">No tasks for today. Add some tasks to get started!</p>
              <Button onClick={() => setActiveTab('tasks')} className="flex items-center gap-2">
                <Plus size={16} />
                Add Task
              </Button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={() => setActiveTab('tasks')}
              className="bg-white rounded-lg p-4 text-center shadow-sm border"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm font-medium text-gray-700">Add Task</p>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('profile')}
              className="bg-white rounded-lg p-4 text-center shadow-sm border"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-700">View Reports</p>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('profile')}
              className="bg-white rounded-lg p-4 text-center shadow-sm border"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-sm font-medium text-gray-700">View Badges</p>
            </motion.button>
          </div>
        </div>

        {/* All pending tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              All Pending Tasks ({pendingTasks.length})
            </h3>
            <TaskList tasks={pendingTasks.slice(0, 10)} />
          </div>
        )}
      </div>

      {/* Voice button */}
      <motion.button
        onClick={toggleVoiceListening}
        className={`fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 ${
          isVoiceListening 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isVoiceListening ? (
          <MicOff size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default HomePage;