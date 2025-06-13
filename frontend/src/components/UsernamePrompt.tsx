import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface UsernamePromptProps {
  onComplete: () => void;
}

const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onComplete }) => {
  const { user, updateUsername } = useAppContext();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUsername(username);
      toast({
        title: "Username updated",
        description: "Your profile has been updated successfully"
      });
      onComplete();
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: "Failed to update username. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-app-darkblue p-6 rounded-xl w-11/12 max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Welcome to Daily Micro-Task Planner!</h2>
        <p className="text-gray-300 mb-6">Choose a username for your profile</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-app-lightblue border-gray-700 text-white"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="w-full bg-app-teal hover:bg-app-teal/80 text-black font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UsernamePrompt;
