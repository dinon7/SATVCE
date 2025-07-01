from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class QuestionType(str, Enum):
    SHORT_ANSWER = "short_answer"
    LIKERT_SCALE = "likert_scale"
    RANKING = "ranking"
    MULTIPLE_SELECT = "multiple_select"
    SINGLE_SELECT = "single_select"
    SPECTRUM = "spectrum"

class QuizQuestion(BaseModel):
    """Schema for a quiz question"""
    id: str
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    allow_other: bool = False
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    required: bool = True
    order: int

class QuizAnswer(BaseModel):
    question_id: str
    answer: Any
    other_text: Optional[str] = None

class QuizResult(BaseModel):
    student_id: str
    answers: Dict[str, Any]
    completed: bool = False
    started_at: datetime
    completed_at: Optional[datetime] = None

# Initial Quiz Questions
INITIAL_QUESTIONS = [
    QuizQuestion(
        id="q1",
        question_text="What subjects do you currently enjoy the most and why?",
        question_type=QuestionType.SHORT_ANSWER,
        order=1
    ),
    QuizQuestion(
        id="q2",
        question_text="How confident are you about what you want to do after school?",
        question_type=QuestionType.LIKERT_SCALE,
        min_value=1,
        max_value=5,
        order=2
    ),
    QuizQuestion(
        id="q3",
        question_text="Rank the following in order of importance to you in a career (1 = most important, 5 = least important):",
        question_type=QuestionType.RANKING,
        options=[
            "Salary",
            "Flexibility",
            "Job Security",
            "Passion",
            "Work-Life Balance"
        ],
        order=3
    ),
    QuizQuestion(
        id="q4",
        question_text="Which of the following tasks do you enjoy?",
        question_type=QuestionType.MULTIPLE_SELECT,
        options=[
            "Solving puzzles and logical problems",
            "Helping others or providing support",
            "Designing, drawing, or creating things",
            "Writing, reading, or storytelling",
            "Working with numbers or spreadsheets",
            "Organising events or managing tasks",
            "Building or fixing mechanical things",
            "Using or making technology"
        ],
        allow_other=True,
        order=4
    ),
    QuizQuestion(
        id="q5",
        question_text="What motivates you most when planning your future?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "Passion",
            "Stability",
            "Salary",
            "Freedom"
        ],
        allow_other=True,
        order=5
    ),
    QuizQuestion(
        id="q6",
        question_text="When are you most focused or productive?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "Morning",
            "Midday",
            "Afternoon",
            "Evening",
            "Late Night"
        ],
        order=6
    ),
    QuizQuestion(
        id="q7",
        question_text="What is your ideal work environment?",
        question_type=QuestionType.MULTIPLE_SELECT,
        options=[
            "Office",
            "Outdoors",
            "Scientific lab",
            "Remote/work from home",
            "Physical/manual settings",
            "Creative studio"
        ],
        allow_other=True,
        order=7
    ),
    QuizQuestion(
        id="q8",
        question_text="How important is job stability to you?",
        question_type=QuestionType.SPECTRUM,
        min_value=0,
        max_value=10,
        order=8
    ),
    QuizQuestion(
        id="q9",
        question_text="Describe your ideal career in one sentence.",
        question_type=QuestionType.SHORT_ANSWER,
        order=9
    ),
    QuizQuestion(
        id="q10",
        question_text="What are your strongest academic areas?",
        question_type=QuestionType.MULTIPLE_SELECT,
        options=[
            "English",
            "Mathematics",
            "Science",
            "History / Humanities",
            "Languages",
            "Technology",
            "Business / Commerce",
            "Physical Education"
        ],
        allow_other=True,
        order=10
    ),
    QuizQuestion(
        id="q11",
        question_text="Do you prefer working alone or in teams?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "Independently",
            "In a team",
            "Depends on the task"
        ],
        order=11
    ),
    QuizQuestion(
        id="q12",
        question_text="Which of these best reflects your attitude towards your future?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "I want to do what I love, no matter the risk",
            "I want something stable with a good income",
            "I want flexibility and work-life balance"
        ],
        order=12
    ),
    QuizQuestion(
        id="q13",
        question_text="What is your dream job (if any)?",
        question_type=QuestionType.SHORT_ANSWER,
        order=13
    ),
    QuizQuestion(
        id="q14",
        question_text="Are there any careers or industries you're sure you don't want to explore?",
        question_type=QuestionType.SHORT_ANSWER,
        order=14
    ),
    QuizQuestion(
        id="q15",
        question_text="Which subjects are you currently considering for VCE?",
        question_type=QuestionType.MULTIPLE_SELECT,
        options=[
            "English",
            "English Language",
            "Literature",
            "Mathematics",
            "Further Mathematics",
            "Mathematical Methods",
            "Specialist Mathematics",
            "Biology",
            "Chemistry",
            "Physics",
            "Psychology",
            "Legal Studies",
            "Business Management",
            "Accounting",
            "Economics",
            "History",
            "Geography",
            "Languages",
            "Art",
            "Studio Arts",
            "Media",
            "Music",
            "Physical Education",
            "Health and Human Development"
        ],
        allow_other=True,
        order=15
    ),
    QuizQuestion(
        id="q16",
        question_text="Who influences your subject/career decisions the most?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "Parents",
            "Teachers",
            "Peers",
            "Career Advisor",
            "Online Resources",
            "Social Media / Influencers",
            "Yourself"
        ],
        order=16
    ),
    QuizQuestion(
        id="q17",
        question_text="How much do you know about university prerequisites or job requirements?",
        question_type=QuestionType.SPECTRUM,
        min_value=0,
        max_value=10,
        order=17
    ),
    QuizQuestion(
        id="q18",
        question_text="How comfortable are you with uncertainty about your future career?",
        question_type=QuestionType.SPECTRUM,
        min_value=0,
        max_value=10,
        order=18
    ),
    QuizQuestion(
        id="q19",
        question_text="If you could solve one global or local problem, what would it be?",
        question_type=QuestionType.SHORT_ANSWER,
        order=19
    ),
    QuizQuestion(
        id="q20",
        question_text="What three words would your friends use to describe you?",
        question_type=QuestionType.SHORT_ANSWER,
        order=20
    ),
    QuizQuestion(
        id="q21",
        question_text="What are your main hobbies, extracurriculars or part-time jobs?",
        question_type=QuestionType.SHORT_ANSWER,
        order=21
    ),
    QuizQuestion(
        id="q22",
        question_text="Do you see yourself starting a business or freelancing someday?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "Yes",
            "No",
            "Maybe"
        ],
        order=22
    ),
    QuizQuestion(
        id="q23",
        question_text="Are there specific industries that fascinate you?",
        question_type=QuestionType.MULTIPLE_SELECT,
        options=[
            "Tech",
            "Healthcare",
            "Education",
            "Business/Finance",
            "Arts & Media",
            "Construction/Trades",
            "Science & Research"
        ],
        allow_other=True,
        order=23
    ),
    QuizQuestion(
        id="q24",
        question_text="What is your preferred method of learning?",
        question_type=QuestionType.SINGLE_SELECT,
        options=[
            "Visual (images, diagrams)",
            "Auditory (lectures, audio)",
            "Reading/writing",
            "Kinesthetic (hands-on)"
        ],
        order=24
    ),
    QuizQuestion(
        id="q25",
        question_text="Do you care more about doing what you love or earning a high salary?",
        question_type=QuestionType.SPECTRUM,
        min_value=0,
        max_value=10,
        order=25
    )
]

class QuizInitialRequestModel(BaseModel):
    """Schema for initial quiz answers"""
    strStudentID: str = Field(..., description="Student's unique identifier")
    arrAnswers: Dict[str, Any] = Field(..., description="Dictionary of question IDs and their answers")
    dtmSubmitted: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of submission")

class RecommendationModel(BaseModel):
    """Schema for AI-generated recommendations"""
    strStudentID: str = Field(..., description="Student's unique identifier")
    arrRecommendedSubjects: List[str] = Field(..., description="List of recommended VCE subjects")
    arrRecommendedCareers: List[str] = Field(..., description="List of recommended careers")
    arrStudyResources: List[str] = Field(..., description="List of recommended study resources")
    dictSalaryInsights: Dict[str, Any] = Field(..., description="Salary information for recommended careers")
    fltConfidenceScore: float = Field(..., ge=0.0, le=1.0, description="AI confidence score for recommendations")
    dtmGenerated: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of generation")

class QuizResultModel(BaseModel):
    """Schema for complete quiz results"""
    strStudentID: str = Field(..., description="Student's unique identifier")
    dictInitialAnswers: Dict[str, Any] = Field(..., description="Initial stage answers")
    dictFollowUpAnswers: Dict[str, Any] = Field(..., description="Follow-up stage answers")
    objRecommendations: RecommendationModel = Field(..., description="AI-generated recommendations")
    boolQuizCompleted: bool = Field(default=False, description="Whether the quiz is fully completed")
    dtmStarted: datetime = Field(..., description="Timestamp when quiz was started")
    dtmCompleted: Optional[datetime] = Field(None, description="Timestamp when quiz was completed") 