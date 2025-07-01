import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[QUIZ_ANSWERS_SIMPLE] Request received');
    
    const { answers } = await request.json();

    if (!answers || typeof answers !== 'object') {
      console.error('[QUIZ_ANSWERS_SIMPLE] Invalid answers provided:', answers);
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    console.log('[QUIZ_ANSWERS_SIMPLE] Processing answers for questions:', Object.keys(answers));

    // Call backend to generate results
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    console.log('[QUIZ_ANSWERS_SIMPLE] Calling backend at:', backendUrl);
    
    const backendResponse = await fetch(`${backendUrl}/api/v1/quiz/generate-results-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
        userId: 'anonymous',
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[QUIZ_ANSWERS_SIMPLE] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      });
      throw new Error(`Backend error: ${backendResponse.status} - ${backendResponse.statusText}`);
    }

    const results = await backendResponse.json();
    console.log('[QUIZ_ANSWERS_SIMPLE] Successfully received results from backend');

    return NextResponse.json(results);
  } catch (error) {
    console.error('[QUIZ_ANSWERS_SIMPLE] Error processing quiz answers:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz answers' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
  console.log('[QUIZ_ANSWERS_SIMPLE] OPTIONS request received');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 