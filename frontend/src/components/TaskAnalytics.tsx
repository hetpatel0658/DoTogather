
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Task } from '@/types';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';

interface TaskAnalyticsProps {
  tasks: Task[];
  completedTasksPercentage: number;
  currentStreak: number;
}

const TaskAnalytics = ({ tasks, completedTasksPercentage, currentStreak }: TaskAnalyticsProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;

  const frequencyData = [
    { name: 'Daily', value: tasks.filter(t => t.frequency === 'daily').length },
    { name: 'Weekly', value: tasks.filter(t => t.frequency === 'weekly').length },
    { name: 'Mon-Wed-Fri', value: tasks.filter(t => t.frequency === 'mon-wed-fri').length },
    { name: 'Every 3 Hours', value: tasks.filter(t => t.frequency === 'every-3-hours').length },
  ].filter(item => item.value > 0);

  const completionData = [
    { name: 'Completed', value: completedTasks, color: '#00d4aa' },
    { name: 'Pending', value: pendingTasks, color: '#6366f1' },
  ];

  const COLORS = ['#00d4aa', '#6366f1', '#f59e0b', '#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Target size={16} className="text-app-teal mr-2" />
            <span className="text-gray-300 text-sm">Total Tasks</span>
          </div>
          <p className="text-white font-bold text-xl">{totalTasks}</p>
        </div>
        
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp size={16} className="text-green-400 mr-2" />
            <span className="text-gray-300 text-sm">Completed</span>
          </div>
          <p className="text-white font-bold text-xl">{completedTasks}</p>
        </div>
        
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock size={16} className="text-yellow-400 mr-2" />
            <span className="text-gray-300 text-sm">Pending</span>
          </div>
          <p className="text-white font-bold text-xl">{pendingTasks}</p>
        </div>
        
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Calendar size={16} className="text-app-purple mr-2" />
            <span className="text-gray-300 text-sm">Streak</span>
          </div>
          <p className="text-white font-bold text-xl">{currentStreak}</p>
        </div>
      </div>

      {/* Charts */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Chart */}
          <div className="bg-app-lightblue p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Task Completion</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Frequency Chart */}
          {frequencyData.length > 0 && (
            <div className="bg-app-lightblue p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Task Frequency</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a2e', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="value" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TaskAnalytics;
