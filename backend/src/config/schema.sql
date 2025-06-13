-- DoTogather Database Schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    
    -- Gamification fields
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    
    -- Profile information
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{
        "theme": "system",
        "notifications": {
            "email": true,
            "push": true,
            "reminders": true
        },
        "privacy": {
            "profileVisible": true,
            "statsVisible": true
        }
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(20) DEFAULT 'other' CHECK (category IN ('work', 'personal', 'health', 'learning', 'social', 'other')),
    
    -- Time management
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    due_date TIMESTAMP WITH TIME ZONE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    
    -- Gamification
    points INTEGER DEFAULT 10 CHECK (points >= 1 AND points <= 100),
    difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    
    -- Organization
    order_index INTEGER DEFAULT 0,
    tags TEXT[],
    
    -- Relationships
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subtasks (stored as JSONB)
    subtasks JSONB DEFAULT '[]'::jsonb,
    
    -- Recurring task settings
    recurring JSONB DEFAULT '{
        "enabled": false,
        "frequency": "daily",
        "interval": 1
    }'::jsonb,
    
    -- AI-generated suggestions
    ai_suggestions JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    category VARCHAR(20) NOT NULL CHECK (category IN ('streak', 'completion', 'points', 'special', 'time')),
    criteria JSONB NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT TRUE,
    points_reward INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_password_token);

CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_created ON tasks(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_completed ON tasks(owner_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_due_date ON tasks(owner_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_priority ON tasks(owner_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_category ON tasks(owner_id, category);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_order ON tasks(owner_id, order_index);

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category, is_active);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = owner_id);

-- User badges policies
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges are publicly readable
CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT USING (true);

-- Insert default badges
INSERT INTO badges (name, description, icon, category, criteria, rarity, points_reward) VALUES
('First Task', 'Complete your first task', '🎯', 'completion', '{"type": "tasks_completed", "value": 1}', 'common', 10),
('Task Master', 'Complete 10 tasks', '🏆', 'completion', '{"type": "tasks_completed", "value": 10}', 'rare', 50),
('Streak Starter', 'Maintain a 3-day streak', '🔥', 'streak', '{"type": "streak_days", "value": 3}', 'common', 25),
('Week Warrior', 'Maintain a 7-day streak', '⚡', 'streak', '{"type": "streak_days", "value": 7}', 'rare', 75),
('Point Collector', 'Earn 100 points', '💎', 'points', '{"type": "points_earned", "value": 100}', 'common', 20),
('High Achiever', 'Earn 1000 points', '👑', 'points', '{"type": "points_earned", "value": 1000}', 'epic', 100),
('Early Bird', 'Complete a task before 8 AM', '🌅', 'time', '{"type": "early_completion", "value": 8}', 'rare', 30),
('Night Owl', 'Complete a task after 10 PM', '🦉', 'time', '{"type": "late_completion", "value": 22}', 'rare', 30)
ON CONFLICT (name) DO NOTHING;