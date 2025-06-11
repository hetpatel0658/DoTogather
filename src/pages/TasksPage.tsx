import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskList from '@/components/TaskList';
import NewTaskPage from '@/components/NewTaskPage';
import TaskFilters from '@/components/TaskFilters';
import { Input } from '@/components/ui/input';

const TasksPage = () => {
  const { tasks } = useAppContext();
  const [showNewTask, setShowNewTask] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesCompleted = showCompleted || !task.isCompleted;

    return matchesSearch && matchesCategory && matchesPriority && matchesCompleted;
  });

  const pendingTasks = filteredTasks.filter(task => !task.isCompleted);
  const completedTasks = filteredTasks.filter(task => task.isCompleted);

  if (showNewTask) {
    return <NewTaskPage onBack={() => setShowNewTask(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pt-12">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Button
            onClick={() => setShowNewTask(true)}
            className="bg-white text-blue-600 hover:bg-gray-100"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
          />
        </div>

        {/* Filter button */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Filter size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white border-b"
        >
          <TaskFilters
            selectedCategory={selectedCategory}
            selectedPriority={selectedPriority}
            showCompleted={showCompleted}
            onCategoryChange={setSelectedCategory}
            onPriorityChange={setSelectedPriority}
            onShowCompletedChange={setShowCompleted}
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Task stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-blue-600">{tasks.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-orange-600">{pendingTasks.length}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Pending Tasks ({pendingTasks.length})
            </h2>
            <TaskList tasks={pendingTasks} />
          </div>
        )}

        {/* Completed tasks */}
        {showCompleted && completedTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Completed Tasks ({completedTasks.length})
            </h2>
            <TaskList tasks={completedTasks} />
          </div>
        )}

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started!'}
            </p>
            <Button onClick={() => setShowNewTask(true)}>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;