import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client for storage operations
export const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage structure configuration
export const STORAGE_STRUCTURE = {
  USERS: 'users',
  TASKS: 'tasks', 
  BADGES: 'badges',
  AVATARS: 'avatars',
  ATTACHMENTS: 'attachments',
  EXPORTS: 'exports'
};

// Initialize storage buckets and folder structure
const initializeStorage = async () => {
  try {
    console.log('🔄 Initializing Supabase storage structure...');
    
    // Create storage buckets if they don't exist
    const buckets = [
      { name: 'user-data', public: false },
      { name: 'avatars', public: true },
      { name: 'attachments', public: false },
      { name: 'exports', public: false }
    ];
    
    for (const bucket of buckets) {
      const { data: existingBucket } = await supabaseStorage.storage.getBucket(bucket.name);
      
      if (!existingBucket) {
        const { error } = await supabaseStorage.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.name === 'avatars' 
            ? ['image/jpeg', 'image/png', 'image/webp']
            : undefined,
          fileSizeLimit: bucket.name === 'avatars' ? 5242880 : 52428800 // 5MB for avatars, 50MB for others
        });
        
        if (error) {
          console.error(`Error creating bucket ${bucket.name}:`, error);
        } else {
          console.log(`✅ Created storage bucket: ${bucket.name}`);
        }
      }
    }
    
    // Initialize default badge data
    await initializeDefaultBadges();
    
    console.log('✅ Supabase storage initialized successfully');
  } catch (error) {
    console.error('❌ Supabase storage initialization error:', error.message);
  }
};

// Initialize default badges in storage
const initializeDefaultBadges = async () => {
  const defaultBadges = [
    {
      id: uuidv4(),
      name: 'First Task',
      description: 'Complete your first task',
      icon: '🎯',
      category: 'completion',
      criteria: { type: 'tasks_completed', value: 1 },
      rarity: 'common',
      pointsReward: 10,
      isActive: true
    },
    {
      id: uuidv4(),
      name: 'Task Master',
      description: 'Complete 10 tasks',
      icon: '🏆',
      category: 'completion',
      criteria: { type: 'tasks_completed', value: 10 },
      rarity: 'rare',
      pointsReward: 50,
      isActive: true
    },
    {
      id: uuidv4(),
      name: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      category: 'streak',
      criteria: { type: 'streak_days', value: 3 },
      rarity: 'common',
      pointsReward: 25,
      isActive: true
    },
    {
      id: uuidv4(),
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⚡',
      category: 'streak',
      criteria: { type: 'streak_days', value: 7 },
      rarity: 'rare',
      pointsReward: 75,
      isActive: true
    },
    {
      id: uuidv4(),
      name: 'Point Collector',
      description: 'Earn 100 points',
      icon: '💎',
      category: 'points',
      criteria: { type: 'points_earned', value: 100 },
      rarity: 'common',
      pointsReward: 20,
      isActive: true
    },
    {
      id: uuidv4(),
      name: 'High Achiever',
      description: 'Earn 1000 points',
      icon: '👑',
      category: 'points',
      criteria: { type: 'points_earned', value: 1000 },
      rarity: 'epic',
      pointsReward: 100,
      isActive: true
    }
  ];

  try {
    // Check if badges already exist
    const { data: existingBadges } = await supabaseStorage.storage
      .from('user-data')
      .download('system/badges.json');
    
    if (!existingBadges) {
      // Upload default badges
      const { error } = await supabaseStorage.storage
        .from('user-data')
        .upload('system/badges.json', JSON.stringify(defaultBadges, null, 2), {
          contentType: 'application/json'
        });
      
      if (error) {
        console.error('Error uploading default badges:', error);
      } else {
        console.log('✅ Default badges initialized');
      }
    }
  } catch (error) {
    console.error('Error initializing badges:', error);
  }
};

// Test storage connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabaseStorage.storage.listBuckets();
    if (error) throw error;
    console.log('✅ Supabase storage connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase storage connection test failed:', error.message);
    return false;
  }
};

export default initializeStorage;