
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight, Target, Calendar, Award } from 'lucide-react';

const OnboardingStep = ({ 
  title, 
  description, 
  icon, 
  isActive 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  isActive: boolean;
}) => (
  <motion.div 
    className={`p-4 sm:p-6 rounded-xl ${isActive ? 'bg-app-lightblue' : 'bg-app-darkblue/50'} mb-3 sm:mb-4`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: isActive ? 1 : 0.6, 
      y: 0,
      scale: isActive ? 1 : 0.98
    }}
    transition={{ 
      duration: 0.4,
      type: isActive ? "spring" : "tween",
      stiffness: 100,
      damping: 15
    }}
  >
    <div className="flex items-start">
      <motion.div 
        className="mr-3 sm:mr-4 text-app-teal"
        initial={{ scale: 0.9 }}
        animate={{ 
          scale: isActive ? 1.1 : 1,
          rotate: isActive ? [0, -10, 10, -5, 5, 0] : 0
        }}
        transition={{ 
          duration: isActive ? 0.6 : 0.3,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          type: "spring"
        }}
      >
        {icon}
      </motion.div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-400">{description}</p>
      </div>
    </div>
  </motion.div>
);

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to Habit Streak Now!",
      description: "Track your daily habits, build streaks, and achieve your goals with our simple and effective app.",
      icon: <Target size={24} />
    },
    {
      title: "Create Micro-Tasks",
      description: "Break down your goals into small, manageable tasks that you can complete every day.",
      icon: <CheckCircle size={24} />
    },
    {
      title: "Build Streaks",
      description: "Maintain your streak by completing tasks daily. The longer your streak, the more points you earn!",
      icon: <Calendar size={24} />
    },
    {
      title: "Earn Badges",
      description: "Unlock achievements and badges as you progress. Show off your accomplishments!",
      icon: <Award size={24} />
    }
  ];
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="min-h-screen bg-app-darkblue flex flex-col p-4 sm:p-6">
      <motion.div 
        className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 sm:mb-8">
          <motion.div 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-app-lightblue rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
          >
            <div className="flex flex-col">
              <span className="h-1.5 sm:h-2 w-8 sm:w-10 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-1.5 sm:h-2 w-8 sm:w-10 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-1.5 sm:h-2 w-5 sm:w-6 bg-pink-400 rounded-full"></span>
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {steps.map((s, i) => (
            <OnboardingStep 
              key={i} 
              title={s.title} 
              description={s.description} 
              icon={s.icon}
              isActive={i === step}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-gray-400 hover:text-white text-sm sm:text-base"
          >
            Skip
          </Button>
          
          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <motion.div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-app-teal' : 'bg-gray-600'}`}
                initial={{ scale: i === step ? 0.8 : 1 }}
                animate={{ scale: i === step ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNext}
            className="bg-app-teal hover:bg-app-teal/90 text-black flex items-center text-sm sm:text-base"
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
