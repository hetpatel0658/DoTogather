#!/usr/bin/env python3
"""
Test script to verify Python server integration with Flutter app
Run this script to test if your Python server is compatible with the Flutter app
"""

import requests
import json
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "username": "testuser"
}

class ServerTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        
    def test_health_check(self) -> bool:
        """Test if server is running"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            print(f"✅ Health check: {response.status_code}")
            return response.status_code == 200
        except requests.exceptions.ConnectionError:
            print("❌ Health check: Connection refused - Is the server running?")
            return False
        except Exception as e:
            print(f"❌ Health check: {e}")
            return False
    
    def test_register(self) -> bool:
        """Test user registration"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=TEST_USER
            )
            print(f"✅ Register: {response.status_code}")
            return response.status_code in [200, 201, 409]  # 409 if user exists
        except Exception as e:
            print(f"❌ Register: {e}")
            return False
    
    def test_login(self) -> bool:
        """Test user login and get auth token"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json={
                    "email": TEST_USER["email"],
                    "password": TEST_USER["password"]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    print(f"✅ Login: {response.status_code} - Token received")
                    return True
                else:
                    print(f"❌ Login: No access_token in response")
                    return False
            else:
                print(f"❌ Login: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Login: {e}")
            return False
    
    def test_get_user_profile(self) -> bool:
        """Test getting user profile"""
        try:
            response = self.session.get(f"{self.base_url}/users/me")
            print(f"✅ Get user profile: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Get user profile: {e}")
            return False
    
    def test_get_tasks(self) -> bool:
        """Test getting user tasks"""
        try:
            response = self.session.get(f"{self.base_url}/tasks")
            print(f"✅ Get tasks: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Get tasks: {e}")
            return False
    
    def test_create_task(self) -> str:
        """Test creating a task"""
        try:
            task_data = {
                "name": "Test Task",
                "description": "This is a test task",
                "category": "personal",
                "priority": "medium",
                "frequency": "once"
            }
            
            response = self.session.post(
                f"{self.base_url}/tasks",
                json=task_data
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                task_id = data.get("id")
                print(f"✅ Create task: {response.status_code} - ID: {task_id}")
                return task_id
            else:
                print(f"❌ Create task: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Create task: {e}")
            return None
    
    def test_update_task(self, task_id: str) -> bool:
        """Test updating a task"""
        if not task_id:
            return False
            
        try:
            update_data = {
                "name": "Updated Test Task",
                "description": "This task has been updated"
            }
            
            response = self.session.put(
                f"{self.base_url}/tasks/{task_id}",
                json=update_data
            )
            print(f"✅ Update task: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Update task: {e}")
            return False
    
    def test_complete_task(self, task_id: str) -> bool:
        """Test completing a task"""
        if not task_id:
            return False
            
        try:
            response = self.session.post(f"{self.base_url}/tasks/{task_id}/complete")
            print(f"✅ Complete task: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Complete task: {e}")
            return False
    
    def test_delete_task(self, task_id: str) -> bool:
        """Test deleting a task"""
        if not task_id:
            return False
            
        try:
            response = self.session.delete(f"{self.base_url}/tasks/{task_id}")
            print(f"✅ Delete task: {response.status_code}")
            return response.status_code in [200, 204]
        except Exception as e:
            print(f"❌ Delete task: {e}")
            return False
    
    def test_get_analytics(self) -> bool:
        """Test getting analytics"""
        try:
            response = self.session.get(f"{self.base_url}/analytics/tasks")
            print(f"✅ Get analytics: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Get analytics: {e}")
            return False
    
    def test_voice_command(self) -> bool:
        """Test voice command processing"""
        try:
            response = self.session.post(
                f"{self.base_url}/ai/voice-command",
                json={"command": "add task test voice command"}
            )
            print(f"✅ Voice command: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Voice command: {e}")
            return False
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 Starting Flutter-Python Server Integration Tests\n")
        
        tests_passed = 0
        total_tests = 0
        
        # Test 1: Health Check
        total_tests += 1
        if self.test_health_check():
            tests_passed += 1
        
        # Test 2: Register
        total_tests += 1
        if self.test_register():
            tests_passed += 1
        
        # Test 3: Login
        total_tests += 1
        if self.test_login():
            tests_passed += 1
        else:
            print("❌ Cannot continue without authentication")
            self.print_results(tests_passed, total_tests)
            return
        
        # Test 4: Get User Profile
        total_tests += 1
        if self.test_get_user_profile():
            tests_passed += 1
        
        # Test 5: Get Tasks
        total_tests += 1
        if self.test_get_tasks():
            tests_passed += 1
        
        # Test 6: Create Task
        total_tests += 1
        task_id = self.test_create_task()
        if task_id:
            tests_passed += 1
        
        # Test 7: Update Task
        total_tests += 1
        if self.test_update_task(task_id):
            tests_passed += 1
        
        # Test 8: Complete Task
        total_tests += 1
        if self.test_complete_task(task_id):
            tests_passed += 1
        
        # Test 9: Get Analytics
        total_tests += 1
        if self.test_get_analytics():
            tests_passed += 1
        
        # Test 10: Voice Command
        total_tests += 1
        if self.test_voice_command():
            tests_passed += 1
        
        # Test 11: Delete Task (cleanup)
        total_tests += 1
        if self.test_delete_task(task_id):
            tests_passed += 1
        
        self.print_results(tests_passed, total_tests)
    
    def print_results(self, passed: int, total: int):
        """Print test results"""
        print(f"\n📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Your Python server is compatible with the Flutter app.")
        else:
            print("⚠️  Some tests failed. Please check your server implementation.")
            print("\n📝 Common issues:")
            print("   - CORS not configured properly")
            print("   - Missing API endpoints")
            print("   - Incorrect response format")
            print("   - Authentication not working")
        
        print(f"\n🔗 Server URL: {self.base_url}")
        print("📱 Flutter app should work with this server configuration.")

def main():
    """Main function"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = BASE_URL
    
    print(f"Testing server at: {base_url}")
    
    tester = ServerTester(base_url)
    tester.run_all_tests()

if __name__ == "__main__":
    main()