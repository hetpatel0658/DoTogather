import 'dart:io';
import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:logger/logger.dart';
import '../config/supabase_config.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final Logger _logger = Logger();
  late final SupabaseStorageClient _storage;

  void initialize() {
    _storage = SupabaseConfig.storage;
  }

  // Upload file to Supabase storage
  Future<String?> uploadFile({
    required String bucketName,
    required String fileName,
    required File file,
    String? folder,
  }) async {
    try {
      final String filePath = folder != null ? '$folder/$fileName' : fileName;
      
      final response = await _storage
          .from(bucketName)
          .upload(filePath, file);

      _logger.i('File uploaded successfully: $filePath');
      return filePath;
    } catch (e) {
      _logger.e('Failed to upload file: $e');
      return null;
    }
  }

  // Upload bytes to Supabase storage
  Future<String?> uploadBytes({
    required String bucketName,
    required String fileName,
    required Uint8List bytes,
    String? folder,
    String? contentType,
  }) async {
    try {
      final String filePath = folder != null ? '$folder/$fileName' : fileName;
      
      final response = await _storage
          .from(bucketName)
          .uploadBinary(
            filePath, 
            bytes,
            fileOptions: FileOptions(
              contentType: contentType,
            ),
          );

      _logger.i('Bytes uploaded successfully: $filePath');
      return filePath;
    } catch (e) {
      _logger.e('Failed to upload bytes: $e');
      return null;
    }
  }

  // Download file from Supabase storage
  Future<Uint8List?> downloadFile({
    required String bucketName,
    required String filePath,
  }) async {
    try {
      final response = await _storage
          .from(bucketName)
          .download(filePath);

      _logger.i('File downloaded successfully: $filePath');
      return response;
    } catch (e) {
      _logger.e('Failed to download file: $e');
      return null;
    }
  }

  // Get public URL for a file
  String getPublicUrl({
    required String bucketName,
    required String filePath,
  }) {
    return _storage
        .from(bucketName)
        .getPublicUrl(filePath);
  }

  // Get signed URL for private files
  Future<String?> getSignedUrl({
    required String bucketName,
    required String filePath,
    int expiresInSeconds = 3600, // 1 hour default
  }) async {
    try {
      final response = await _storage
          .from(bucketName)
          .createSignedUrl(filePath, expiresInSeconds);

      _logger.i('Signed URL created for: $filePath');
      return response;
    } catch (e) {
      _logger.e('Failed to create signed URL: $e');
      return null;
    }
  }

  // Delete file from Supabase storage
  Future<bool> deleteFile({
    required String bucketName,
    required String filePath,
  }) async {
    try {
      await _storage
          .from(bucketName)
          .remove([filePath]);

      _logger.i('File deleted successfully: $filePath');
      return true;
    } catch (e) {
      _logger.e('Failed to delete file: $e');
      return false;
    }
  }

  // List files in a bucket/folder
  Future<List<FileObject>?> listFiles({
    required String bucketName,
    String? folder,
    int limit = 100,
    int offset = 0,
  }) async {
    try {
      final response = await _storage
          .from(bucketName)
          .list(
            path: folder,
            searchOptions: SearchOptions(
              limit: limit,
              offset: offset,
            ),
          );

      _logger.i('Files listed successfully from: ${folder ?? 'root'}');
      return response;
    } catch (e) {
      _logger.e('Failed to list files: $e');
      return null;
    }
  }

  // Upload user profile image
  Future<String?> uploadProfileImage({
    required String userId,
    required File imageFile,
  }) async {
    final fileName = 'profile_$userId.jpg';
    return await uploadFile(
      bucketName: SupabaseConfig.bucketName,
      fileName: fileName,
      file: imageFile,
      folder: 'profiles',
    );
  }

  // Upload task attachment
  Future<String?> uploadTaskAttachment({
    required String taskId,
    required File file,
    required String originalFileName,
  }) async {
    final extension = originalFileName.split('.').last;
    final fileName = 'task_${taskId}_${DateTime.now().millisecondsSinceEpoch}.$extension';
    
    return await uploadFile(
      bucketName: SupabaseConfig.bucketName,
      fileName: fileName,
      file: file,
      folder: 'task_attachments',
    );
  }

  // Get profile image URL
  String? getProfileImageUrl(String userId) {
    final filePath = 'profiles/profile_$userId.jpg';
    return getPublicUrl(
      bucketName: SupabaseConfig.bucketName,
      filePath: filePath,
    );
  }

  // Create bucket if it doesn't exist
  Future<bool> createBucket(String bucketName, {bool isPublic = false}) async {
    try {
      await _storage.createBucket(
        bucketName,
        BucketOptions(public: isPublic),
      );
      
      _logger.i('Bucket created successfully: $bucketName');
      return true;
    } catch (e) {
      _logger.e('Failed to create bucket: $e');
      return false;
    }
  }
}