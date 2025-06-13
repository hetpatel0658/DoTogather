
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { ChevronLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import taskSuggestions from '@/data/taskSuggestions.json';

interface NewTaskPageProps {
  onBack: () => void;
}

const NewTaskPage = ({ onBack }: NewTaskPageProps) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [reminderTime, setReminderTime] = useState('');
  
  const { addTask } = useAppContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a task name",
      });
      return;
    }
    
    try {
      await addTask({
        name,
        frequency: frequency as 'daily' | 'weekly' | 'mon-wed-fri' | 'every-3-hours',
        reminderTime,
        isCompleted: false,
        createdAt: new Date()
      });
      
      toast({
        title: "Task added",
        description: "Your new task has been added successfully!",
      });
      
      onBack();
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: "Failed to add task",
        description: error.message || "An error occurred while adding the task",
      });
    }
  };
  
  const handleSuggestTask = () => {
    try {
      // Use local JSON file for task suggestions
      const randomIndex = Math.floor(Math.random() * taskSuggestions.length);
      const suggestion = taskSuggestions[randomIndex];
      setName(suggestion);
      
      toast({
        title: "Task suggested",
        description: "A new task has been suggested for you!",
      });
    } catch (error) {
      console.error('Error suggesting task:', error);
      toast({
        title: "Suggestion failed",
        description: "Failed to get task suggestion. Please try again.",
      });
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-app-teal"
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-white ml-2">New Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-gray-400 mb-2">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Call Mom"
            className="h-14 bg-app-lightblue border-none text-white rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Frequency</label>
          <div className="relative">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="h-14 w-full bg-app-lightblue border-none text-white rounded-lg px-3 appearance-none"
            >
              <option value="daily">Daily</option>
              <option value="mon-wed-fri">Monday, Wednesday, Friday</option>
              <option value="every-3-hours">Every 3 hours</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ChevronLeft size={20} className="rotate-180 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Reminder Time</label>
          <div className="relative">
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="h-14 bg-app-lightblue border-none text-white rounded-lg pr-12"
            />
            <Clock size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-14 mt-4 rounded-lg bg-indigo-600 text-white"
          onClick={handleSuggestTask}
        >
          Suggest Task
        </Button>

        <div className="mt-auto">
          <div className="py-6">
            <h3 className="text-xl font-bold text-white">Small steps,</h3>
            <h3 className="text-xl font-bold text-white">big results.</h3>
          </div>

          <Button 
            type="submit"
            className="w-full bg-app-teal hover:bg-app-teal/90 text-black font-medium rounded-lg h-14"
          >
            Add Task
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTaskPage;
