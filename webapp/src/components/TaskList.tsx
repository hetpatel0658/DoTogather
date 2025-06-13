
import React, { useMemo, useCallback, useState } from 'react';
import TaskReorderableList from './TaskReorderableList';
import TaskFilters from './TaskFilters';
import TaskAnalytics from './TaskAnalytics';
import ReportsPage from './ReportsPage';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Plus, BarChart3, FileText, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TaskList = () => {
  const { tasks, user, currentStreak, completedTasksPercentage, setActiveTab } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'completed':
          return matchesSearch && task.isCompleted;
        case 'pending':
          return matchesSearch && !task.isCompleted;
        case 'daily':
          return matchesSearch && task.frequency === 'daily';
        case 'weekly':
          return matchesSearch && task.frequency === 'weekly';
        default:
          return matchesSearch;
      }
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'frequency':
          comparison = a.frequency.localeCompare(b.frequency);
          break;
        case 'status':
          comparison = a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, searchTerm, filterBy, sortBy, sortOrder]);

  const handleAddTaskClick = useCallback(() => {
    setActiveTab('add');
  }, [setActiveTab]);

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-pink-400 text-xl sm:text-2xl mr-2">🔥</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Today</h2>
        </div>
        <div className="text-app-purple text-base sm:text-lg font-bold flex items-center">
          <span className="hidden sm:inline">Streak: </span>
          <span className="inline sm:hidden">🔄 </span>
          <span className="ml-1">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
        </div>
      </div>

      <Button 
        className="w-full bg-app-teal hover:bg-app-teal/90 text-black font-medium mb-5 sm:mb-6 rounded-xl h-12 sm:h-14 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleAddTaskClick}
      >
        <Plus className="mr-2" size={18} /> Add Task
      </Button>

      <Tabs defaultValue="tasks" className="flex-1">
        <TabsList className="grid w-full grid-cols-3 bg-app-lightblue">
          <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-app-teal data-[state=active]:text-black">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-app-teal data-[state=active]:text-black">
            <BarChart3 size={16} className="mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-white data-[state=active]:bg-app-teal data-[state=active]:text-black">
            <FileText size={16} className="mr-1" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 mt-4">
          <TaskFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          <div className="flex-1 overflow-hidden pb-20">
            {filteredAndSortedTasks.length > 0 ? (
              <TaskReorderableList tasks={filteredAndSortedTasks} />
            ) : (
              <div className="text-center text-gray-400 mt-10 p-4">
                <p className="text-sm sm:text-base">
                  {searchTerm || filterBy !== 'all' 
                    ? 'No tasks match your filters.' 
                    : 'No tasks yet. Add a new task to get started!'
                  }
                </p>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  {searchTerm || filterBy !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Complete tasks daily to build your streak and earn points.'
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <TaskAnalytics 
            tasks={tasks}
            completedTasksPercentage={completedTasksPercentage}
            currentStreak={currentStreak}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <ReportsPage />
        </TabsContent>
      </Tabs>

      {user && (
        <div className="mt-auto pt-4 pb-2 text-center bg-app-darkblue bg-opacity-80 backdrop-blur-sm rounded-lg">
          <div className="flex items-center justify-center">
            <span className="text-pink-400 text-lg sm:text-xl mr-1">🏆</span> 
            <span className="text-white text-sm sm:text-base font-medium">{user.points} Points</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="text-app-teal text-lg sm:text-xl mr-1">🔥</span>
            <span className="text-white text-sm sm:text-base font-medium">{currentStreak}-Day Streak</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
