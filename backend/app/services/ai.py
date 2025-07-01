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
import json

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

async def generate_recommendations(all_answers: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized recommendations based on all quiz answers using Gemini API"""
    prompt = f"""
    Based on the following answers to a career guidance quiz, generate personalized recommendations 
    for VCE subject selection and potential career paths.
    
    All Answers:
    {all_answers}
    
    Generate recommendations in this exact JSON format (no additional text, just the JSON object):
    {{
        "recommended_subjects": ["Mathematics", "Physics", "Chemistry"],
        "potential_careers": [
            {{
                "title": "Software Engineer",
                "description": "Design, develop, and maintain software applications and systems. Work with programming languages, databases, and development frameworks to create innovative solutions.",
                "salary_range": "$70,000 - $150,000",
                "job_outlook": "Excellent - High demand with strong growth projected",
                "required_skills": ["Programming", "Problem Solving", "Analytical Thinking", "Team Collaboration"],
                "education_requirements": ["Bachelor's in Computer Science or related field"],
                "industry_tags": ["Technology", "Software Development", "Innovation"],
                "work_environment": "Office/Remote, Collaborative teams, Fast-paced",
                "confidence_score": 0.92,
                "vce_subjects": ["Mathematics", "Physics", "Information Technology"]
            }},
            {{
                "title": "Data Scientist",
                "description": "Analyze complex data sets to help organizations make informed decisions. Use statistical methods, machine learning, and data visualization techniques.",
                "salary_range": "$80,000 - $160,000",
                "job_outlook": "Excellent - Rapidly growing field with high demand",
                "required_skills": ["Statistics", "Programming", "Data Analysis", "Critical Thinking"],
                "education_requirements": ["Bachelor's in Statistics, Mathematics, or Computer Science"],
                "industry_tags": ["Technology", "Analytics", "Research"],
                "work_environment": "Office/Remote, Data-driven, Collaborative",
                "confidence_score": 0.88,
                "vce_subjects": ["Mathematics", "Physics", "Chemistry"]
            }}
        ],
        "study_resources": ["Khan Academy", "MIT OpenCourseWare", "Coursera"],
        "confidence_score": 0.85,
        "reasoning": "Based on your strong interest in problem-solving and analytical thinking, these subjects and careers align well with your preferences."
    }}
    
    The 'reasoning' field should be a concise, student-friendly paragraph. It should synthesize insights from the user's answers into a helpful narrative. Do NOT reference the raw question IDs (e.g., "q5", "f2") in your explanation. Instead, explain the 'why' behind the recommendations in a natural way.

    Generate 8-12 detailed career recommendations that are specific, relevant, and actionable for a VCE student.
    Each career should have realistic salary ranges for Australia, accurate job outlook, and relevant VCE subjects.
    Make sure the recommendations are diverse and cover different industries and skill levels.
    """
    
    try:
        response = await call_gemini_api(prompt)
        
        # Try to parse the JSON response
        try:
            # Look for JSON object in the response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                recommendations = json.loads(json_str)
                
                # Validate the structure
                if isinstance(recommendations, dict):
                    return recommendations
                else:
                    logger.error("Response is not a dictionary")
                    return {}
            else:
                logger.error("No JSON object found in response")
                return {}
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response: {response}")
            return {}
            
    except Exception as e:
        logger.error(f"Failed to generate recommendations: {str(e)}")
        return {}

async def generate_followup_questions(initial_answers: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate exactly 7 personalized followup questions based on initial quiz answers using AI"""
    prompt = f"""
    Based on the following answers to a career guidance quiz (25 questions), generate exactly 7 personalized followup questions.
    
    Initial Quiz Answers:
    {initial_answers}
    
    Generate exactly 7 followup questions in this exact JSON format (no additional text, just the JSON array):
    [
        {{
            "id": "f1",
            "text": "Question text here",
            "type": "multiple_choice|slider|text_input|ranking",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"] // for multiple_choice
            // OR
            "min_value": 1, "max_value": 10 // for slider
            // OR
            "placeholder": "Enter your answer here" // for text_input
            // OR
            "items": ["Item 1", "Item 2", "Item 3", "Item 4"] // for ranking
        }},
        // ... 6 more questions
    ]
    
    Guidelines for generating questions:
    1. Analyze the initial answers to identify areas that need deeper exploration
    2. Create questions that dive deeper into career interests, academic strengths, and personal preferences
    3. Use varied question types: multiple_choice, slider, text_input, ranking
    4. Make questions highly personalized based on the user's specific responses
    5. Focus on gathering additional context that will improve career recommendations
    6. Ensure questions are relevant to VCE students and career planning
    7. Make questions engaging and thought-provoking
    
    Question types to use:
    - multiple_choice: For exploring specific preferences or experiences
    - slider: For rating confidence, interest levels, or preferences
    - text_input: For gathering detailed insights or personal experiences
    - ranking: For prioritizing different factors or options
    
    Generate exactly 7 questions that will provide the most valuable insights for career recommendations.
    """
    
    try:
        response = await call_gemini_api(prompt)
        
        # Try to parse the JSON response
        try:
            # Look for JSON array in the response
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                questions = json.loads(json_str)
                
                # Validate the structure and ensure exactly 7 questions
                if isinstance(questions, list) and len(questions) == 7:
                    # Validate each question has required fields
                    for i, question in enumerate(questions):
                        if not isinstance(question, dict):
                            raise ValueError(f"Question {i+1} is not a dictionary")
                        if 'id' not in question or 'text' not in question or 'type' not in question:
                            raise ValueError(f"Question {i+1} missing required fields")
                        
                        # Ensure question ID is correct
                        question['id'] = f"f{i+1}"
                    
                    return questions
                else:
                    logger.error(f"Expected 7 questions, got {len(questions) if isinstance(questions, list) else 'non-list'}")
                    return _get_fallback_followup_questions()
            else:
                logger.error("No JSON array found in response")
                return _get_fallback_followup_questions()
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response: {response}")
            return _get_fallback_followup_questions()
            
    except Exception as e:
        logger.error(f"Failed to generate followup questions: {str(e)}")
        return _get_fallback_followup_questions()

def _get_fallback_followup_questions() -> List[Dict[str, Any]]:
    """Fallback followup questions if AI generation fails"""
    return [
        {
            "id": "f1",
            "text": "How deeply have you researched the subjects you're considering for VCE?",
            "type": "multiple_choice",
            "options": [
                "I've done extensive research",
                "I've done some research",
                "I've done minimal research",
                "I haven't researched yet"
            ]
        },
        {
            "id": "f2",
            "text": "Rate your confidence in making career decisions (1-10)",
            "type": "slider",
            "min_value": 1,
            "max_value": 10
        },
        {
            "id": "f3",
            "text": "What is your biggest concern about choosing a career path?",
            "type": "text_input",
            "placeholder": "Describe your main concern..."
        },
        {
            "id": "f4",
            "text": "Rank these factors by importance for your career choice",
            "type": "ranking",
            "items": [
                "Job security",
                "High salary",
                "Work-life balance",
                "Making a difference"
            ]
        },
        {
            "id": "f5",
            "text": "Have you done any work experience or part-time work?",
            "type": "multiple_choice",
            "options": [
                "Yes, in a field I'm interested in",
                "Yes, but not in my field of interest",
                "No, but I plan to",
                "No, and I don't plan to"
            ]
        },
        {
            "id": "f6",
            "text": "Describe your ideal work environment in 2-3 sentences",
            "type": "text_input",
            "placeholder": "What would your perfect workplace look like?"
        },
        {
            "id": "f7",
            "text": "How important is it for you to work with cutting-edge technology?",
            "type": "slider",
            "min_value": 1,
            "max_value": 10
        }
    ] 