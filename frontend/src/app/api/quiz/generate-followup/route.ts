import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[QUIZ_GENERATE_FOLLOWUP] Request received');
    
    const { initial_answers } = await request.json();

    if (!initial_answers || typeof initial_answers !== 'object') {
      console.error('[QUIZ_GENERATE_FOLLOWUP] Invalid initial answers provided:', initial_answers);
      return NextResponse.json(
        { error: 'Invalid initial answers provided' },
        { status: 400 }
      );
    }

    console.log('[QUIZ_GENERATE_FOLLOWUP] Generating followup questions for answers:', Object.keys(initial_answers));

    // Call backend to generate followup questions
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    console.log('[QUIZ_GENERATE_FOLLOWUP] Calling backend at:', backendUrl);
    
    const backendResponse = await fetch(`${backendUrl}/api/v1/quiz/generate-followup-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initial_answers,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[QUIZ_GENERATE_FOLLOWUP] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      });
      throw new Error(`Backend error: ${backendResponse.status} - ${backendResponse.statusText}`);
    }

    const followupQuestions = await backendResponse.json();
    console.log('[QUIZ_GENERATE_FOLLOWUP] Successfully generated followup questions from backend');

    return NextResponse.json(followupQuestions);
  } catch (error) {
    console.error('[QUIZ_GENERATE_FOLLOWUP] Error generating followup questions:', error);
    
    // Return fallback questions if backend fails
    const fallbackQuestions = [
      {
        id: "f1",
        text: "How deeply have you researched the subjects you're considering for VCE?",
        type: "multiple_choice",
        options: [
          "I've done extensive research",
          "I've done some research",
          "I've done minimal research",
          "I haven't researched yet"
        ]
      },
      {
        id: "f2",
        text: "Rate your confidence in making career decisions (1-10)",
        type: "slider",
        min_value: 1,
        max_value: 10
      },
      {
        id: "f3",
        text: "What is your biggest concern about choosing a career path?",
        type: "text_input",
        placeholder: "Describe your main concern..."
      },
      {
        id: "f4",
        text: "Rank these factors by importance for your career choice",
        type: "ranking",
        items: [
          "Job security",
          "High salary",
          "Work-life balance",
          "Making a difference"
        ]
      },
      {
        id: "f5",
        text: "Have you done any work experience or part-time work?",
        type: "multiple_choice",
        options: [
          "Yes, in a field I'm interested in",
          "Yes, but not in my field of interest",
          "No, but I plan to",
          "No, and I don't plan to"
        ]
      },
      {
        id: "f6",
        text: "Describe your ideal work environment in 2-3 sentences",
        type: "text_input",
        placeholder: "What would your perfect workplace look like?"
      },
      {
        id: "f7",
        text: "How important is it for you to work with cutting-edge technology?",
        type: "slider",
        min_value: 1,
        max_value: 10
      }
    ];
    
    return NextResponse.json(fallbackQuestions);
  }
} 