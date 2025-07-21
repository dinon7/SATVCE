import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
from ..schemas.report import SubjectRecommendation

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

def build_prompt(quiz_answers: dict) -> str:
    """Build the prompt for the Gemini AI model."""
    return f"""
    You are an expert VCE education counsellor. Based on this student's quiz answers:
    {json.dumps(quiz_answers, indent=2)}

    Recommend 3-5 VCE subjects that best match their interests, strengths, and career goals.
    For each subject, provide the following information in a structured JSON format:

    1. subjectCode: A unique identifier for the subject (e.g., "MAT01")
    2. subjectName: The official name of the subject
    3. subjectDescription: A detailed paragraph about the subject content and relevance
    4. imageUrl: A URL to an image representing the subject (use placeholder URLs for now)
    5. relatedCareers: List of 3-5 relevant career paths
    6. relatedUniversities: List of 2-3 universities offering this subject
    7. scalingScore: A float between 0.0 and 1.0 representing the subject's scaling
    8. popularityIndex: An integer between 0-100 indicating subject popularity
    9. difficultyRating: An integer between 1-5 indicating subject difficulty
    10. studyTips: List of 3-5 practical study tips
    11. jobMarketData: An object containing:
        - salaryMedian: Average salary for related careers
        - demandTrend: Current job market trend
        - industryTags: List of relevant industries
    12. prerequisites: List of required Units 1&2 subjects

    Format your response as a JSON array of objects. Each object should strictly follow this structure.
    Ensure all numerical values are within their specified ranges.
    """

async def call_gemini(prompt: str) -> List[Dict[str, Any]]:
    """Call the Gemini API and parse the response."""
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = await model.generate_content(prompt)
        
        # Extract and parse the JSON response
        content = response.text
        # Find the JSON array in the response
        start_idx = content.find('[')
        end_idx = content.rfind(']') + 1
        if start_idx == -1 or end_idx == 0:
            raise ValueError("No valid JSON array found in AI response")
        
        json_str = content[start_idx:end_idx]
        return json.loads(json_str)
    except Exception as e:
        raise Exception(f"Error calling Gemini API: {str(e)}")

def parse_response(data: List[Dict[str, Any]]) -> List[SubjectRecommendation]:
    """Parse and validate the AI response into SubjectRecommendation objects."""
    try:
        return [SubjectRecommendation(**item) for item in data]
    except Exception as e:
        raise ValueError(f"Error parsing AI response: {str(e)}") 