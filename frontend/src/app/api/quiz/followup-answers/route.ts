import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[QUIZ_FOLLOWUP_ANSWERS] Request received');
    
    const { answers } = await request.json();

    if (!answers || typeof answers !== 'object') {
      console.error('[QUIZ_FOLLOWUP_ANSWERS] Invalid answers provided:', answers);
      return NextResponse.json(
        { error: 'Invalid followup answers provided' },
        { status: 400 }
      );
    }

    console.log('[QUIZ_FOLLOWUP_ANSWERS] Processing followup answers:', Object.keys(answers));

    // Call backend to submit followup answers
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    console.log('[QUIZ_FOLLOWUP_ANSWERS] Calling backend at:', backendUrl);
    
    const backendResponse = await fetch(`${backendUrl}/api/v1/quiz/followup-answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[QUIZ_FOLLOWUP_ANSWERS] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      });
      throw new Error(`Backend error: ${backendResponse.status} - ${backendResponse.statusText}`);
    }

    const results = await backendResponse.json();
    console.log('[QUIZ_FOLLOWUP_ANSWERS] Successfully received results from backend');

    return NextResponse.json(results);
  } catch (error) {
    console.error('[QUIZ_FOLLOWUP_ANSWERS] Error processing followup answers:', error);
    return NextResponse.json(
      { error: 'Failed to process followup answers' },
      { status: 500 }
    );
  }
} 