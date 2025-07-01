import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[QUIZ_SUBMIT_COMPLETE] Request received');
    
    const { initial_answers, followup_answers } = await request.json();

    if (!initial_answers || !followup_answers || typeof initial_answers !== 'object' || typeof followup_answers !== 'object') {
      console.error('[QUIZ_SUBMIT_COMPLETE] Invalid answers provided:', { initial_answers, followup_answers });
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    console.log('[QUIZ_SUBMIT_COMPLETE] Processing complete quiz answers');

    // Call backend to submit complete quiz
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    console.log('[QUIZ_SUBMIT_COMPLETE] Calling backend at:', backendUrl);
    
    const backendResponse = await fetch(`${backendUrl}/api/v1/quiz/submit-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initial_answers,
        followup_answers,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[QUIZ_SUBMIT_COMPLETE] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      });
      throw new Error(`Backend error: ${backendResponse.status} - ${backendResponse.statusText}`);
    }

    const results = await backendResponse.json();
    console.log('[QUIZ_SUBMIT_COMPLETE] Successfully received results from backend');

    return NextResponse.json(results);
  } catch (error) {
    console.error('[QUIZ_SUBMIT_COMPLETE] Error processing complete quiz:', error);
    return NextResponse.json(
      { error: 'Failed to process complete quiz' },
      { status: 500 }
    );
  }
} 