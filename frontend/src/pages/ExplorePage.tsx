
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, User, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { UserProfile } from '@/types';

const ExplorePage = () => {
  const { fetchPublicProfiles } = useAppContext();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const publicProfiles = await fetchPublicProfiles();
        setProfiles(publicProfiles);
      } catch (error) {
        console.error('Error fetching public profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [fetchPublicProfiles]);

  const filteredProfiles = profiles.filter(profile => 
    profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center">
          <Users className="mr-2" />
          Explore
        </h1>
        <p className="text-gray-400 text-sm">Discover other users and their achievements</p>
      </motion.div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-app-lightblue border-gray-700 text-white rounded-lg"
        />
      </div>

      {profiles.length === 0 && !isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-10 text-center"
        >
          <Users size={48} className="text-gray-500 mb-4" />
          <h3 className="text-lg text-gray-300 mb-2">No public profiles yet</h3>
          <p className="text-gray-500 text-sm mb-4 max-w-xs">
            Users need to set their profiles to public in their profile settings to appear here
          </p>
          <Badge variant="outline" className="text-app-teal border-app-teal">
            Tip: Make your profile public to connect with others!
          </Badge>
        </motion.div>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-app-teal"></div>
        </div>
      ) : (
        <motion.div
          className="space-y-3 overflow-y-auto pb-20"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredProfiles.map((profile) => (
            <motion.div
              key={profile.id}
              variants={itemVariants}
              className="bg-app-lightblue p-4 rounded-xl flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="w-12 h-12 bg-app-darkblue rounded-full flex items-center justify-center mr-4">
                <User size={20} className="text-app-teal" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{profile.username}</h3>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <Award size={14} className="text-app-purple mr-1" />
                  <span>{profile.points} points</span>
                  <span className="mx-2">•</span>
                  <span>{profile.currentStreak} day streak</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <ChevronRight size={18} />
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ExplorePage;
