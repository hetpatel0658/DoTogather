from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_key
        )
    
    async def upload_file(self, bucket_name: str, file_path: str, file_data: bytes, content_type: str = None) -> Dict[str, Any]:
        """Upload file to Supabase Storage"""
        try:
            result = self.supabase.storage.from_(bucket_name).upload(
                path=file_path,
                file=file_data,
                file_options={
                    "content-type": content_type,
                    "upsert": True
                }
            )
            
            if result.get("error"):
                raise Exception(f"Upload failed: {result['error']}")
            
            # Get public URL
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)
            
            return {
                "success": True,
                "path": file_path,
                "public_url": public_url,
                "data": result
            }
            
        except Exception as e:
            logger.error(f"Error uploading file to Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def download_file(self, bucket_name: str, file_path: str) -> Dict[str, Any]:
        """Download file from Supabase Storage"""
        try:
            result = self.supabase.storage.from_(bucket_name).download(file_path)
            
            return {
                "success": True,
                "data": result,
                "content": result
            }
            
        except Exception as e:
            logger.error(f"Error downloading file from Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_file(self, bucket_name: str, file_path: str) -> Dict[str, Any]:
        """Delete file from Supabase Storage"""
        try:
            result = self.supabase.storage.from_(bucket_name).remove([file_path])
            
            return {
                "success": True,
                "data": result
            }
            
        except Exception as e:
            logger.error(f"Error deleting file from Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def list_files(self, bucket_name: str, folder_path: str = "") -> Dict[str, Any]:
        """List files in Supabase Storage bucket"""
        try:
            result = self.supabase.storage.from_(bucket_name).list(folder_path)
            
            return {
                "success": True,
                "files": result
            }
            
        except Exception as e:
            logger.error(f"Error listing files from Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_bucket(self, bucket_name: str, public: bool = False) -> Dict[str, Any]:
        """Create a new storage bucket"""
        try:
            result = self.supabase.storage.create_bucket(
                bucket_name,
                options={"public": public}
            )
            
            return {
                "success": True,
                "data": result
            }
            
        except Exception as e:
            logger.error(f"Error creating bucket in Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_public_url(self, bucket_name: str, file_path: str) -> str:
        """Get public URL for a file"""
        try:
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)
            return public_url
            
        except Exception as e:
            logger.error(f"Error getting public URL from Supabase: {str(e)}")
            return ""
    
    async def upload_user_avatar(self, user_id: int, file_data: bytes, file_extension: str) -> Dict[str, Any]:
        """Upload user avatar to Supabase Storage"""
        bucket_name = "avatars"
        file_path = f"user_{user_id}/avatar.{file_extension}"
        
        # Determine content type
        content_type_map = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp"
        }
        content_type = content_type_map.get(file_extension.lower(), "image/jpeg")
        
        return await self.upload_file(bucket_name, file_path, file_data, content_type)
    
    async def upload_task_attachment(self, user_id: int, task_id: int, filename: str, file_data: bytes) -> Dict[str, Any]:
        """Upload task attachment to Supabase Storage"""
        bucket_name = "task-attachments"
        file_path = f"user_{user_id}/task_{task_id}/{filename}"
        
        return await self.upload_file(bucket_name, file_path, file_data)
    
    async def backup_user_data(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Backup user data as JSON to Supabase Storage"""
        import json
        
        bucket_name = "user-backups"
        file_path = f"user_{user_id}/backup_{int(time.time())}.json"
        
        # Convert data to JSON bytes
        json_data = json.dumps(data, indent=2, default=str).encode('utf-8')
        
        return await self.upload_file(bucket_name, file_path, json_data, "application/json")
    
    async def get_user_storage_usage(self, user_id: int) -> Dict[str, Any]:
        """Get storage usage statistics for a user"""
        try:
            total_size = 0
            file_count = 0
            
            # Check avatars bucket
            avatars_result = await self.list_files("avatars", f"user_{user_id}")
            if avatars_result["success"]:
                for file in avatars_result["files"]:
                    if file.get("metadata", {}).get("size"):
                        total_size += file["metadata"]["size"]
                        file_count += 1
            
            # Check task-attachments bucket
            attachments_result = await self.list_files("task-attachments", f"user_{user_id}")
            if attachments_result["success"]:
                for file in attachments_result["files"]:
                    if file.get("metadata", {}).get("size"):
                        total_size += file["metadata"]["size"]
                        file_count += 1
            
            return {
                "success": True,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "file_count": file_count
            }
            
        except Exception as e:
            logger.error(f"Error getting storage usage: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }