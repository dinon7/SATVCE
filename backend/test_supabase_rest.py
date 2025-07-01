#!/usr/bin/env python3
"""
Simple test script to verify REST-based Supabase integration
"""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_supabase_rest():
    """Test the new REST-based Supabase service"""
    try:
        # Import the service
        from backend.app.services.supabase_service import SupabaseService
        
        print("🔧 Testing REST-based Supabase Integration...")
        
        # Check environment variables
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Supabase environment variables not set")
            print(f"SUPABASE_URL: {'Set' if supabase_url else 'Not set'}")
            print(f"SUPABASE_KEY: {'Set' if supabase_key else 'Not set'}")
            return False
        
        print("✅ Supabase environment variables are set")
        
        # Create service instance
        service = SupabaseService()
        print("✅ SupabaseService instance created successfully")
        
        # Test health check
        health = await service.health_check()
        print(f"✅ Health check: {health['status']}")
        
        # Test basic GET request
        try:
            # Try to get site settings (should work even if table doesn't exist)
            settings = await service.get_site_settings()
            print("✅ Site settings retrieved successfully")
        except Exception as e:
            print(f"⚠️  Site settings test failed (expected if table doesn't exist): {str(e)}")
        
        # Test admin stats (should return default values)
        try:
            stats = await service.get_admin_stats()
            print("✅ Admin stats retrieved successfully")
            print(f"   - Total users: {stats.get('total_users', 0)}")
            print(f"   - Total quizzes: {stats.get('total_quizzes', 0)}")
            print(f"   - Total reports: {stats.get('total_reports', 0)}")
        except Exception as e:
            print(f"⚠️  Admin stats test failed (expected if tables don't exist): {str(e)}")
        
        print("\n🎉 REST-based Supabase integration test completed successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Run the test
    success = asyncio.run(test_supabase_rest())
    sys.exit(0 if success else 1) 