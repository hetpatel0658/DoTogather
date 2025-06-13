
import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TaskFiltersProps {
  selectedCategory: string;
  selectedPriority: string;
  showCompleted: boolean;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onShowCompletedChange: (value: boolean) => void;
}

const TaskFilters = ({
  selectedCategory,
  selectedPriority,
  showCompleted,
  onCategoryChange,
  onPriorityChange,
  onShowCompletedChange,
}: TaskFiltersProps) => {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Priority</Label>
          <Select value={selectedPriority} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-completed"
          checked={showCompleted}
          onCheckedChange={onShowCompletedChange}
        />
        <Label htmlFor="show-completed" className="text-sm font-medium text-gray-700">
          Show completed tasks
        </Label>
      </div>
    </div>
  );
};

export default TaskFilters;
