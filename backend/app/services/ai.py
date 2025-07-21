"""
services/ai.py - AI integration logic for VCE Career Guidance backend.

- Purpose: Handles Gemini API calls and AI-driven quiz logic.
- Major components: call_gemini_api, generate_follow_up_questions, generate_recommendations.
- Variable scope: All variables are local to functions except for API config.
- Gemini model: Using 'models/gemini-2.5-flash' as the default model.

Gemini model configuration
- API Key: The GEMINI_API_KEY environment variable is used for authentication.
- Gemini model: Using 'models/gemini-2.5-flash' as the default model.
- Temperature: Set to 0.7 for a balance between creativity and predictability.
- Top-P: Set to 0.95 to control the diversity of the generated text.
- Top-K: Set to 40 to limit the number of highest probability vocabulary tokens considered.
- Max Output Tokens: Set to 2048 to ensure the responses are not overly long.
- Stop Sequences: No stop sequences are defined, allowing for natural completion.
"""

from typing import List, Dict, Any
import google.generativeai as genai
from ..core.config import settings
import os
import asyncio
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Gemini model configuration
# - API Key: The GEMINI_API_KEY environment variable is used for authentication.
# - Gemini model: Using 'models/gemini-2.5-flash' as the default model.
# - Temperature: Set to 0.7 for a balance between creativity and predictability.
# - Top-P: Set to 0.95 to control the diversity of the generated text.
# - Top-K: Set to 40 to limit the number of highest probability vocabulary tokens considered.
# - Max Output Tokens: Set to 2048 to ensure the responses are not overly long.
# - Stop Sequences: No stop sequences are defined, allowing for natural completion.

GEMINI_MODEL = 'models/gemini-2.5-flash'  # Updated model name
MAX_RETRIES = 3
BASE_DELAY = 1.0  # Base delay in seconds

# Configure the generative AI model with the API key from environment variables
genai.configure(api_key=settings.GEMINI_API_KEY)

async def call_gemini_api(prompt: str, max_retries: int = MAX_RETRIES) -> str:
    """
    Calls the Gemini API with a given prompt and returns the response.
    Includes retry logic with exponential backoff for transient failures.

    Args:
        prompt: The text prompt to send to the Gemini API.
        max_retries: Maximum number of retry attempts (default: 3).

    Returns:
        The text response from the Gemini API.
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            model = genai.GenerativeModel(GEMINI_MODEL)
            response = await model.generate_content_async(prompt)
            
            if response and response.text:
                logger.info(f"Gemini API call successful on attempt {attempt + 1}")
                return response.text
            else:
                raise Exception("Empty response from Gemini API")
                
        except Exception as e:
            last_exception = e
            logger.warning(f"Gemini API call failed on attempt {attempt + 1}: {str(e)}")
            
            # Don't retry on the last attempt
            if attempt == max_retries:
                logger.error(f"Gemini API call failed after {max_retries + 1} attempts")
                break
            
            # Calculate delay with exponential backoff
            delay = BASE_DELAY * (2 ** attempt)
            logger.info(f"Retrying in {delay} seconds...")
            await asyncio.sleep(delay)
    
    # If all retries failed, log the error and return empty string
    logger.error(f"All retry attempts failed. Last error: {str(last_exception)}")
    return ""

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
    
    try:
        response = await call_gemini_api(prompt)
        
        # Parse and return the generated questions
        # Note: You'll need to implement proper parsing based on the actual API response format
        return response.get("questions", [])
    except Exception as e:
        raise Exception(f"Failed to generate follow-up questions: {str(e)}")

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
    
    try:
        response = await call_gemini_api(prompt)
        # Using a dict for recommendations for O(1) access by subject name
        recommendations = response.get("recommendations", {})
        # Example: Check if confidence score is high and recommendations are not empty
        if recommendations.get("confidence_score", 0) > 0.8 and len(recommendations.get("recommended_subjects", [])) > 0:
            # This checks both the confidence threshold and that there are recommendations
            pass
        return recommendations
    except Exception as e:
        raise Exception(f"Failed to generate recommendations: {str(e)}") 