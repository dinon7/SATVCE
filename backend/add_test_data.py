#!/usr/bin/env python3
"""
Script to add sample test data to Supabase tables for endpoint testing.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from .app.services.supabase_service import supabase_service

async def add_test_data():
    """Add sample test data to Supabase tables"""
    print("🚀 Adding Test Data to Supabase...")
    print("="*50)
    
    try:
        # Add sample careers
        print("1. Adding sample careers...")
        careers_data = [
            {
                "title": "Software Engineer",
                "description": "Develop software applications and systems",
                "requirements": ["Programming", "Problem Solving", "Teamwork"],
                "salary_range": "$60,000 - $120,000",
                "job_outlook": "Excellent",
                "related_subjects": [],
                "is_active": True
            },
            {
                "title": "Data Scientist",
                "description": "Analyze and interpret complex data",
                "requirements": ["Statistics", "Programming", "Critical Thinking"],
                "salary_range": "$70,000 - $130,000",
                "job_outlook": "Excellent",
                "related_subjects": [],
                "is_active": True
            },
            {
                "title": "Teacher",
                "description": "Educate students in various subjects",
                "requirements": ["Communication", "Patience", "Subject Knowledge"],
                "salary_range": "$50,000 - $80,000",
                "job_outlook": "Good",
                "related_subjects": [],
                "is_active": True
            }
        ]
        
        for career in careers_data:
            await supabase_service._post("careers", career)
        print(f"✅ Added {len(careers_data)} careers")
        
        # Add sample subjects
        print("\n2. Adding sample subjects...")
        subjects_data = [
            {
                "name": "Mathematics",
                "description": "Advanced mathematics including calculus and statistics",
                "scaling": 0.8,
                "difficulty": 4,
                "prerequisites": [],
                "is_active": True
            },
            {
                "name": "Physics",
                "description": "Study of matter, energy, and their interactions",
                "scaling": 0.9,
                "difficulty": 5,
                "prerequisites": ["Mathematics"],
                "is_active": True
            },
            {
                "name": "English",
                "description": "Advanced English literature and composition",
                "scaling": 0.7,
                "difficulty": 3,
                "prerequisites": [],
                "is_active": True
            }
        ]
        
        for subject in subjects_data:
            await supabase_service._post("subjects", subject)
        print(f"✅ Added {len(subjects_data)} subjects")
        
        # Add sample resources
        print("\n3. Adding sample resources...")
        resources_data = [
            {
                "title": "VCE Study Guide",
                "description": "Comprehensive guide for VCE students",
                "url": "https://example.com/study-guide",
                "type": "Article",
                "tags": ["study", "vce", "guide"],
                "status": "approved",
                "is_active": True
            },
            {
                "title": "Career Planning Video",
                "description": "Video guide for career planning",
                "url": "https://example.com/career-video",
                "type": "Video",
                "tags": ["career", "planning", "video"],
                "status": "approved",
                "is_active": True
            }
        ]
        
        for resource in resources_data:
            await supabase_service._post("resources", resource)
        print(f"✅ Added {len(resources_data)} resources")
        
        # Add sample career pathways
        print("\n4. Adding sample career pathways...")
        pathways_data = [
            {
                "title": "Technology Pathway",
                "description": "Pathway for technology and software careers",
                "related_career_ids": [],
                "recommended_subjects": [],
                "education_level": "Bachelor",
                "is_active": True
            },
            {
                "title": "Education Pathway",
                "description": "Pathway for teaching and education careers",
                "related_career_ids": [],
                "recommended_subjects": [],
                "education_level": "Bachelor",
                "is_active": True
            }
        ]
        
        for pathway in pathways_data:
            await supabase_service._post("career_pathways", pathway)
        print(f"✅ Added {len(pathways_data)} career pathways")
        
        print("\n" + "="*50)
        print("✅ Test data added successfully!")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error adding test data: {e}")
        return False
    
    return True

async def main():
    """Main function"""
    success = await add_test_data()
    
    if success:
        print("\n🎉 You can now test the endpoints with real data!")
    else:
        print("\n❌ Failed to add test data")

if __name__ == "__main__":
    asyncio.run(main()) 