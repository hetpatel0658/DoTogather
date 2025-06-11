
import React from 'react';
import { Home, CheckSquare, Compass, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'profile', icon: UserCircle, label: 'Profile' }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-16 bg-app-darkblue border-t border-gray-800 flex justify-around items-center px-1 sm:px-6 z-50 safe-area-inset-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}
    >
      {navItems.map(item => (
        <motion.button 
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg ${
            activeTab === item.id ? 'text-app-teal' : 'text-gray-500'
          }`}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            animate={{ 
              scale: activeTab === item.id ? 1.1 : 1,
              y: activeTab === item.id ? -2 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <item.icon size={20} />
          </motion.div>
          <motion.span 
            className={`text-xs mt-1 ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}
            animate={{ 
              scale: activeTab === item.id ? 1 : 0.9
            }}
          >
            {item.label}
          </motion.span>
          {activeTab === item.id && (
            <motion.div
              className="absolute bottom-0 w-1.5 h-1.5 bg-app-teal rounded-full"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Navigation;
