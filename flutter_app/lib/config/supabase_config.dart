import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String url = 'https://yqociffktetsduzlojqw.supabase.co';
  static const String anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxb2NpZmZrdGV0c2R1emxvanF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MjY0MDAsImV4cCI6MjA0OTUwMjQwMH0.example'; // You'll need to provide the actual anon key
  
  // Storage configuration
  static const String storageEndpoint = 'https://yqociffktetsduzlojqw.supabase.co/storage/v1/s3';
  static const String accessKeyId = 'e4311b251a1f0ab8784ef1470cc04515';
  static const String secretAccessKey = '0dc20179a517d1dabc5f84c10e7d458f3a80cd82c8a8fb1a9af91ec1fe1f3c76';
  static const String region = 'ap-south-1';
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
      debug: true,
    );
  }
  
  static SupabaseClient get client => Supabase.instance.client;
  static GoTrueClient get auth => client.auth;
  static SupabaseStorageClient get storage => client.storage;
}