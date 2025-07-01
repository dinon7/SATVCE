#!/usr/bin/env python3
"""
Simple test script to check Supabase connection and table existence.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from backend.app.services.supabase_service import supabase_service

async def test_supabase_connection():
    """Test Supabase connection and basic operations"""
    print("🔍 Testing Supabase Connection...")
    
    try:
        # Test basic connection by getting users
        print("1. Testing basic connection...")
        try:
            users = await supabase_service._get("users", {"select": "*", "limit": 1})
            print(f"✅ Connection successful! Found {len(users) if users else 0} users")
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
        
        # Test careers table
        print("\n2. Testing careers table...")
        try:
            careers = await supabase_service._get("careers", {"select": "*", "limit": 1})
            print(f"✅ Careers table exists! Found {len(careers) if careers else 0} records")
        except Exception as e:
            print(f"❌ Careers table error: {e}")
        
        # Test subjects table
        print("\n3. Testing subjects table...")
        try:
            subjects = await supabase_service._get("subjects", {"select": "*", "limit": 1})
            print(f"✅ Subjects table exists! Found {len(subjects) if subjects else 0} records")
        except Exception as e:
            print(f"❌ Subjects table error: {e}")
        
        # Test resources table
        print("\n4. Testing resources table...")
        try:
            resources = await supabase_service._get("resources", {"select": "*", "limit": 1})
            print(f"✅ Resources table exists! Found {len(resources) if resources else 0} records")
        except Exception as e:
            print(f"❌ Resources table error: {e}")
        
        # Test career_pathways table
        print("\n5. Testing career_pathways table...")
        try:
            pathways = await supabase_service._get("career_pathways", {"select": "*", "limit": 1})
            print(f"✅ Career pathways table exists! Found {len(pathways) if pathways else 0} records")
        except Exception as e:
            print(f"❌ Career pathways table error: {e}")
        
        # Test health check
        print("\n6. Testing health check...")
        try:
            health = await supabase_service.health_check()
            print(f"✅ Health check successful: {health}")
        except Exception as e:
            print(f"❌ Health check error: {e}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    return True

async def main():
    """Main test function"""
    print("🚀 Starting Supabase Connection Test")
    print("="*50)
    
    success = await test_supabase_connection()
    
    print("\n" + "="*50)
    if success:
        print("✅ Supabase connection test completed successfully!")
    else:
        print("❌ Supabase connection test failed!")
    
    print("="*50)

if __name__ == "__main__":
    asyncio.run(main()) 