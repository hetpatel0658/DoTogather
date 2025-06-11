#!/bin/bash

# DoTogather Flutter App Setup and Run Script

echo "🚀 Setting up DoTogather Flutter App..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    echo "Visit: https://docs.flutter.dev/get-started/install"
    exit 1
fi

# Check Flutter version
echo "📱 Checking Flutter version..."
flutter --version

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Get dependencies
echo "📦 Installing dependencies..."
flutter pub get

# Generate code (for Hive models)
echo "🔧 Generating code..."
flutter packages pub run build_runner build --delete-conflicting-outputs

# Check for any issues
echo "🔍 Running Flutter doctor..."
flutter doctor

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p assets/images
mkdir -p assets/icons
mkdir -p assets/animations
mkdir -p assets/data
mkdir -p assets/fonts

# Check if we can run the app
echo "🏃 Checking available devices..."
flutter devices

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 To run the app:"
echo "   flutter run                    # Run in debug mode"
echo "   flutter run --release          # Run in release mode"
echo "   flutter run -d chrome          # Run on web"
echo "   flutter run -d android         # Run on Android"
echo ""
echo "🔧 Before running, make sure to:"
echo "   1. Set up Firebase configuration in lib/config/firebase_config.dart"
echo "   2. Add google-services.json to android/app/ (for Android)"
echo "   3. Add GoogleService-Info.plist to ios/Runner/ (for iOS)"
echo "   4. Update API base URL in lib/config/app_config.dart"
echo ""
echo "📚 For more information, see README.md"

# Optionally run the app if requested
if [ "$1" = "--run" ]; then
    echo "🚀 Starting the app..."
    flutter run
fi