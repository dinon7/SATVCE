import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase, getOrCreateUserIdWithAuth } from '@/lib/supabase';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const { userId: clerkUserId } = auth();
    
    console.log('[QUIZ_RESULTS_GET] Request received, clerkUserId:', clerkUserId);
    
    // If no user is authenticated, return empty results instead of error
    if (!clerkUserId) {
      console.log('[QUIZ_RESULTS_GET] No authenticated user, returning empty results');
      return NextResponse.json([]);
    }

    // Try backend first
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/quiz/results`, {
        headers: {
          'Authorization': `Bearer ${clerkUserId}`,
          'Content-Type': 'application/json',
        },
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        console.log('[QUIZ_RESULTS_GET] Successfully retrieved results from backend:', data?.length || 0);
        return NextResponse.json(data || []);
      } else if (backendResponse.status === 404) {
        // No results found, return empty array
        console.log('[QUIZ_RESULTS_GET] No results found in backend');
        return NextResponse.json([]);
      }
    } catch (backendError) {
      console.warn('[QUIZ_RESULTS_GET] Backend unavailable, returning empty results:', backendError);
    }

    // Fallback: Return empty results
    console.log('[QUIZ_RESULTS_GET] Using fallback, returning empty results');
    return NextResponse.json([]);

  } catch (error) {
    console.error('[QUIZ_RESULTS_GET] General error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = auth();
    const { answers } = await request.json();

    console.log('[QUIZ_RESULTS_POST] Request received, clerkUserId:', clerkUserId);
    console.log('[QUIZ_RESULTS_POST] Processing answers for questions:', Object.keys(answers || {}));

    if (!answers || typeof answers !== 'object') {
      console.error('[QUIZ_RESULTS_POST] Invalid answers provided:', answers);
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    // Only save to database if user is authenticated
    if (clerkUserId) {
      try {
        console.log('[QUIZ_RESULTS_POST] Saving results to backend for user:', clerkUserId);
        
        // Try backend first
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/quiz/results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${clerkUserId}`,
          },
          body: JSON.stringify({ answers }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          console.log('[QUIZ_RESULTS_POST] Successfully saved results to backend');
          return NextResponse.json(data);
        } else {
          console.warn('[QUIZ_RESULTS_POST] Backend save failed, continuing without save');
        }
      } catch (saveError) {
        console.warn('[QUIZ_RESULTS_POST] Backend unavailable, continuing without save:', saveError);
      }
    } else {
      console.log('[QUIZ_RESULTS_POST] No authenticated user, skipping database save');
    }

    // Generate recommendations even if save fails
    try {
      const recommendationsResponse = await fetch(`${BACKEND_URL}/api/v1/quiz/generate-results-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          userId: clerkUserId || 'anonymous',
        }),
      });

      if (recommendationsResponse.ok) {
        const recommendations = await recommendationsResponse.json();
        console.log('[QUIZ_RESULTS_POST] Successfully generated recommendations');
        return NextResponse.json(recommendations);
      }
    } catch (recommendationsError) {
      console.warn('[QUIZ_RESULTS_POST] Recommendations generation failed:', recommendationsError);
    }

    // Fallback: Return basic success response
    return NextResponse.json({
      success: true,
      message: 'Quiz processed successfully',
      fallback: true,
      recommendations: []
    });

  } catch (error) {
    console.error('[QUIZ_RESULTS_POST] Error generating quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz results' },
      { status: 500 }
    );
  }
} 