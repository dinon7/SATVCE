import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[QUIZ_INITIAL] Request received');
    
    const { strStudentID, arrAnswers } = await request.json();

    if (!strStudentID || !arrAnswers || typeof arrAnswers !== 'object') {
      console.error('[QUIZ_INITIAL] Invalid request data:', { strStudentID, arrAnswers });
      return NextResponse.json(
        { error: 'Invalid request data provided' },
        { status: 400 }
      );
    }

    console.log('[QUIZ_INITIAL] Processing initial answers for student:', strStudentID);

    // Call backend to get followup questions
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    console.log('[QUIZ_INITIAL] Calling backend at:', backendUrl);
    
    const backendResponse = await fetch(`${backendUrl}/api/v1/quiz/initial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        strStudentID,
        arrAnswers,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[QUIZ_INITIAL] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      });
      throw new Error(`Backend error: ${backendResponse.status} - ${backendResponse.statusText}`);
    }

    const followupQuestions = await backendResponse.json();
    console.log('[QUIZ_INITIAL] Successfully received followup questions from backend');

    return NextResponse.json(followupQuestions);
  } catch (error) {
    console.error('[QUIZ_INITIAL] Error getting followup questions:', error);
    
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
        text: "Have you done any work experience or part-time work?",
        type: "multiple_choice",
        options: [
          "Yes, in a field I'm interested in",
          "Yes, but not in my field of interest",
          "No, but I plan to",
          "No, and I don't plan to"
        ]
      }
    ];
    
    return NextResponse.json(fallbackQuestions);
  }
} 