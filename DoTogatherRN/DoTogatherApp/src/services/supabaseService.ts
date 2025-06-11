import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';

// Replace with your Supabase URL and anon key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  // File upload methods
  async uploadUserAvatar(userId: number, imageUri: string, fileExtension: string): Promise<{
    success: boolean;
    publicUrl?: string;
    error?: string;
  }> {
    try {
      // Convert image URI to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const fileName = `user_${userId}/avatar.${fileExtension}`;
      
      const { data, error } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExtension}`,
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return {
        success: true,
        publicUrl: publicUrlData.publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadTaskAttachment(
    userId: number,
    taskId: number,
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<{
    success: boolean;
    publicUrl?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const filePath = `user_${userId}/task_${taskId}/${fileName}`;
      
      const { data, error } = await this.supabase.storage
        .from('task-attachments')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      return {
        success: true,
        publicUrl: publicUrlData.publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadVoiceRecording(
    userId: number,
    audioData: string,
    timestamp: number
  ): Promise<{
    success: boolean;
    publicUrl?: string;
    error?: string;
  }> {
    try {
      // Decode base64 audio data
      const arrayBuffer = decode(audioData);
      
      const fileName = `user_${userId}/voice_recordings/${timestamp}.wav`;
      
      const { data, error } = await this.supabase.storage
        .from('voice-recordings')
        .upload(fileName, arrayBuffer, {
          contentType: 'audio/wav',
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('voice-recordings')
        .getPublicUrl(fileName);

      return {
        success: true,
        publicUrl: publicUrlData.publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async backupUserData(userId: number, userData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const timestamp = Date.now();
      const fileName = `user_${userId}/backups/backup_${timestamp}.json`;
      const jsonData = JSON.stringify(userData, null, 2);
      
      const { error } = await this.supabase.storage
        .from('user-backups')
        .upload(fileName, jsonData, {
          contentType: 'application/json',
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup failed',
      };
    }
  }

  async downloadFile(bucket: string, filePath: string): Promise<{
    success: boolean;
    data?: Blob;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  async deleteFile(bucket: string, filePath: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  async listUserFiles(userId: number, bucket: string): Promise<{
    success: boolean;
    files?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(`user_${userId}`, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, files: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'List failed',
      };
    }
  }

  async getStorageUsage(userId: number): Promise<{
    success: boolean;
    totalSizeBytes?: number;
    totalSizeMB?: number;
    fileCount?: number;
    error?: string;
  }> {
    try {
      let totalSize = 0;
      let fileCount = 0;

      // Check all buckets
      const buckets = ['avatars', 'task-attachments', 'voice-recordings', 'user-backups'];
      
      for (const bucket of buckets) {
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .list(`user_${userId}`, {
            limit: 1000,
            offset: 0,
          });

        if (!error && data) {
          for (const file of data) {
            if (file.metadata?.size) {
              totalSize += file.metadata.size;
              fileCount++;
            }
          }
        }
      }

      return {
        success: true,
        totalSizeBytes: totalSize,
        totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        fileCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Usage calculation failed',
      };
    }
  }

  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Create signed URL for private files
  async createSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600): Promise<{
    success: boolean;
    signedUrl?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, signedUrl: data.signedUrl };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signed URL creation failed',
      };
    }
  }
}

export default new SupabaseService();