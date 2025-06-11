import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportsPage = () => {
  const { tasks, user, currentStreak } = useAppContext();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');

  const generateReportData = useMemo(() => {
    const now = new Date();
    const days = reportType === 'weekly' ? 7 : 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate completion data (in real app, this would come from historical data)
      const completedCount = Math.floor(Math.random() * tasks.length);
      
      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(reportType === 'monthly' ? { year: '2-digit' } : {})
        }),
        completed: completedCount,
        total: tasks.length
      });
    }

    return data;
  }, [reportType, tasks.length]);

  const totalCompletedTasks = useMemo(() => {
    return generateReportData.reduce((sum, day) => sum + day.completed, 0);
  }, [generateReportData]);

  const averageDaily = useMemo(() => {
    return generateReportData.length > 0 
      ? Math.round(totalCompletedTasks / generateReportData.length) 
      : 0;
  }, [totalCompletedTasks, generateReportData.length]);

  const exportReport = () => {
    const reportData = {
      period: reportType,
      dateGenerated: new Date().toISOString(),
      user: user?.username || user?.email,
      summary: {
        totalTasks: tasks.length,
        totalCompleted: totalCompletedTasks,
        averageDaily,
        currentStreak
      },
      dailyData: generateReportData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Reports</h1>
          <p className="text-gray-400 text-sm">Track your progress over time</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={(value: 'weekly' | 'monthly') => setReportType(value)}>
            <SelectTrigger className="bg-app-lightblue border-gray-700 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={exportReport}
            className="bg-app-teal hover:bg-app-teal/90 text-black"
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Calendar size={16} className="text-app-teal mr-2" />
            <span className="text-gray-300 text-sm">Period</span>
          </div>
          <p className="text-white font-bold">{reportType === 'weekly' ? '7 Days' : '30 Days'}</p>
        </div>
        
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp size={16} className="text-green-400 mr-2" />
            <span className="text-gray-300 text-sm">Completed</span>
          </div>
          <p className="text-white font-bold text-xl">{totalCompletedTasks}</p>
        </div>
        
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Award size={16} className="text-app-purple mr-2" />
            <span className="text-gray-300 text-sm">Daily Avg</span>
          </div>
          <p className="text-white font-bold text-xl">{averageDaily}</p>
        </div>
        
        <div className="bg-app-lightblue p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Calendar size={16} className="text-yellow-400 mr-2" />
            <span className="text-gray-300 text-sm">Streak</span>
          </div>
          <p className="text-white font-bold text-xl">{currentStreak}</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-app-lightblue p-6 rounded-lg">
        <h3 className="text-white font-semibold mb-4">
          {reportType === 'weekly' ? 'Weekly' : 'Monthly'} Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generateReportData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a2e', 
                border: 'none', 
                borderRadius: '8px',
                color: 'white'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#00d4aa" 
              strokeWidth={3}
              dot={{ fill: '#00d4aa', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#00d4aa', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-app-lightblue p-6 rounded-lg">
        <h3 className="text-white font-semibold mb-4">Insights</h3>
        <div className="space-y-3 text-gray-300">
          <p>
            📈 You've completed an average of <span className="text-app-teal font-semibold">{averageDaily} tasks per day</span> this {reportType.slice(0, -2)}.
          </p>
          <p>
            🔥 Your current streak is <span className="text-app-purple font-semibold">{currentStreak} days</span> - keep it up!
          </p>
          <p>
            🎯 You have <span className="text-white font-semibold">{tasks.length} total tasks</span> in your list.
          </p>
          {totalCompletedTasks > averageDaily * 7 && (
            <p>
              🌟 Great job! You're completing more tasks than your daily average suggests.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;
