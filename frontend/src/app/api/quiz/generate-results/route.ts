import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUserIdWithAuth } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const answers = await request.json();
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    // Ensure user exists in Supabase
    // const userId = await getOrCreateUserIdWithAuth();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const backendResponse = await fetch(`${backendUrl}/api/v1/quiz/generate-results-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
        userId: clerkUserId,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const results = await backendResponse.json();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error generating quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz results' },
      { status: 500 }
    );
  }
} 