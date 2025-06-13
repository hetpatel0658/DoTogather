# 🗄️ Supabase Storage Integration Guide

This guide explains how DoTogather uses **Supabase Storage** as a file-based database to store all user data in a structured format.

## 📋 Overview

Instead of using a traditional database, DoTogather stores all data as JSON files in Supabase Storage buckets. This approach provides:

- **Simplicity**: No complex database schemas
- **Flexibility**: Easy to modify data structures
- **Portability**: Data can be easily exported/imported
- **Cost-effective**: Storage-based pricing model
- **Scalability**: Supabase handles the infrastructure

## 🏗️ Storage Structure

### **Buckets Created:**

```
📁 user-data (private)     - All user data and system files
📁 avatars (public)        - User profile pictures
📁 attachments (private)   - Task attachments and files
📁 exports (private)       - Data export files
```

### **File Organization:**

```
user-data/
├── system/
│   └── badges.json                    # Global badge definitions
│
└── users/
    └── {userId}/
        ├── profile.json               # User profile data
        ├── badges.json                # User's earned badges
        └── tasks/
            ├── {taskId1}.json         # Individual task files
            ├── {taskId2}.json
            └── ...

avatars/
└── {userId}/
    └── avatar.{ext}                   # User profile pictures

attachments/
└── {userId}/
    └── tasks/
        └── {taskId}/
            ├── attachment1.pdf
            ├── image.jpg
            └── ...

exports/
└── {userId}/
    ├── tasks_export_2024-01-15.json
    ├── full_backup_2024-01-15.zip
    └── ...
```

## 🔧 Configuration

### **Environment Variables:**

```env
# Supabase Configuration
SUPABASE_URL=https://yqociffktetsduzlojqw.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=e4311b251a1f0ab8784ef1470cc04515
```

### **Required Keys:**

1. **SUPABASE_URL**: Your project URL
2. **SUPABASE_ANON_KEY**: Public key for client-side operations
3. **SUPABASE_SERVICE_ROLE_KEY**: Private key for server-side operations (you provided this)

## 📊 Data Models

### **User Profile Structure:**

```json
{
  "id": "uuid-v4",
  "email": "user@example.com",
  "username": "john_doe",
  "password": "hashed_password",
  "isVerified": true,
  "verificationToken": null,
  "resetPasswordToken": null,
  "resetPasswordExpires": null,
  
  "points": 1250,
  "level": 5,
  "currentStreak": 7,
  "longestStreak": 15,
  "lastActiveDate": "2024-01-15T10:30:00.000Z",
  
  "avatar": "https://supabase.co/storage/v1/object/public/avatars/user-id/avatar.jpg",
  "bio": "Productivity enthusiast",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true,
      "reminders": true
    },
    "privacy": {
      "profileVisible": true,
      "statsVisible": true
    }
  },
  
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "lastLogin": "2024-01-15T10:30:00.000Z"
}
```

### **Task Structure:**

```json
{
  "id": "uuid-v4",
  "name": "Complete project proposal",
  "description": "Write and review the Q1 project proposal",
  "isCompleted": false,
  "priority": "high",
  "category": "work",
  
  "estimatedDuration": 120,
  "actualDuration": null,
  "dueDate": "2024-01-20T17:00:00.000Z",
  "reminderTime": "2024-01-20T16:00:00.000Z",
  
  "points": 25,
  "difficulty": 3,
  "orderIndex": 0,
  "tags": ["urgent", "client"],
  
  "ownerId": "user-uuid",
  
  "subtasks": [
    {
      "id": "subtask-uuid",
      "name": "Research requirements",
      "isCompleted": true,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "completedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  
  "recurring": {
    "enabled": false,
    "frequency": "daily",
    "interval": 1
  },
  
  "aiSuggestions": {
    "estimatedDuration": 120,
    "suggestedCategory": "work",
    "tips": ["Break into smaller tasks", "Set timer"]
  },
  
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "completedAt": null
}
```

### **Badge Structure:**

```json
{
  "id": "uuid-v4",
  "name": "First Task Completed",
  "description": "Complete your first task",
  "icon": "🎯",
  "color": "#3B82F6",
  "category": "completion",
  "criteria": {
    "type": "tasks_completed",
    "value": 1
  },
  "rarity": "common",
  "pointsReward": 10,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **User Badge Structure:**

```json
{
  "id": "uuid-v4",
  "userId": "user-uuid",
  "badgeId": "badge-uuid",
  "earnedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Data Operations

### **User Operations:**

```javascript
// Create user
const user = new User({ email, username, password });
await user.hashPassword();
await user.save();

// Find user
const user = await User.findByEmail(email);
const user = await User.findById(userId);

// Update user
user.points += 50;
user.calculateLevel();
await user.save();
```

### **Task Operations:**

```javascript
// Create task
const task = new Task({ name, description, ownerId });
await task.save();

// Find tasks
const tasks = await Task.findByOwnerId(userId);
const task = await Task.findById(taskId, userId);

// Update task
task.markCompleted();
await task.save();
```

### **Badge Operations:**

```javascript
// Check and award badges
const userStats = await calculateUserStats(userId);
const newBadges = await UserBadge.checkAndAwardBadges(userId, userStats);

// Get user badges
const badges = await UserBadge.getUserBadgesWithDetails(userId);
```

## 🚀 Setup Instructions

### **1. Get Supabase Anon Key:**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **anon public** key
4. Add it to your `.env` file:

```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Configure Storage Policies:**

In your Supabase dashboard, go to **Storage** → **Policies** and create these policies:

```sql
-- Allow authenticated users to manage their own data
CREATE POLICY "Users can manage own data" ON storage.objects
FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to avatars
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### **3. Test the Setup:**

```bash
cd server
npm install
npm run dev
```

Check the logs for:
```
✅ Supabase storage connection test successful
✅ Created storage bucket: user-data
✅ Created storage bucket: avatars
✅ Created storage bucket: attachments
✅ Created storage bucket: exports
✅ Default badges initialized
✅ DoTogather API initialized successfully
```

## 📈 Benefits of This Approach

### **Advantages:**

1. **Simple Setup**: No complex database configuration
2. **Easy Backup**: Files can be easily downloaded and backed up
3. **Flexible Schema**: JSON structure can be easily modified
4. **Cost Effective**: Pay only for storage used
5. **Portable**: Data can be moved between providers
6. **Debuggable**: Files can be inspected directly

### **Performance Considerations:**

1. **Caching**: Implement Redis for frequently accessed data
2. **Indexing**: Create index files for fast searches
3. **Pagination**: Limit file listings for large datasets
4. **Compression**: Use gzip for large JSON files

## 🔒 Security Features

1. **Row Level Security**: Users can only access their own data
2. **Encrypted Storage**: All data is encrypted at rest
3. **Access Control**: Service role key for server operations only
4. **File Validation**: JSON schema validation before saving
5. **Rate Limiting**: API rate limits prevent abuse

## 🛠️ Maintenance

### **Regular Tasks:**

1. **Monitor Storage Usage**: Check Supabase dashboard
2. **Clean Old Files**: Remove expired tokens and old exports
3. **Backup Critical Data**: Regular backups of system files
4. **Update Indexes**: Rebuild search indexes periodically

### **Troubleshooting:**

```bash
# Test storage connection
curl -X GET "https://yqociffktetsduzlojqw.supabase.co/storage/v1/bucket" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Check bucket contents
curl -X GET "https://yqociffktetsduzlojqw.supabase.co/storage/v1/object/list/user-data" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

---

**Your Supabase Storage is now configured and ready to store all DoTogather data! 🎉**