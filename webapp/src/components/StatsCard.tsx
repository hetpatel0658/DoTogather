import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

const StatsCard = ({ title, value, icon, color, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      className={`bg-app-lightblue rounded-xl p-4 flex items-center`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs">{title}</p>
        <p className="text-white font-bold text-xl">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;