from typing import List, Dict, Any
import httpx
from app.config import settings
import os
import google.generativeai as genai

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_follow_up_questions(initial_answers: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate follow-up questions based on initial answers using Gemini API"""
    prompt = f"""
    Based on the following initial answers to a career guidance quiz, generate 3-5 follow-up questions 
    that will help better understand the student's interests and career aspirations.
    
    Initial Answers:
    {initial_answers}
    
    Generate follow-up questions in this format:
    {{
        "id": "f1",
        "text": "Question text",
        "type": "multiple_choice",
        "options": ["Option 1", "Option 2", "Option 3"]
    }}
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.AI_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.AI_API_KEY}"
            },
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
        )
        
        if response.status_code != 200:
            raise Exception("Failed to generate follow-up questions")
        
        result = response.json()
        # Parse and return the generated questions
        # Note: You'll need to implement proper parsing based on the actual API response format
        return result.get("questions", [])

async def generate_recommendations(all_answers: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized recommendations based on all quiz answers using Gemini API"""
    prompt = f"""
    Based on the following answers to a career guidance quiz, generate personalized recommendations 
    for VCE subject selection and potential career paths.
    
    All Answers:
    {all_answers}
    
    Generate recommendations in this format:
    {{
        "recommended_subjects": ["Subject 1", "Subject 2", "Subject 3"],
        "potential_careers": ["Career 1", "Career 2", "Career 3"],
        "study_resources": ["Resource 1", "Resource 2"],
        "confidence_score": 0.85,
        "reasoning": "Explanation of recommendations"
    }}
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.AI_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.AI_API_KEY}"
            },
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
        )
        
        if response.status_code != 200:
            raise Exception("Failed to generate recommendations")
        
        result = response.json()
        # Parse and return the generated recommendations
        # Note: You'll need to implement proper parsing based on the actual API response format
        return result.get("recommendations", {})

def call_gemini_api(prompt: str) -> str:
    """
    Call the Gemini API with a prompt and return the response.
    
    Args:
        prompt (str): The prompt to send to the Gemini API
        
    Returns:
        str: The response from the Gemini API
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Return the text response
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return f"Error: {str(e)}" 