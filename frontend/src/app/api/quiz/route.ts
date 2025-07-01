import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase, getUserId } from '@/lib/supabase';

// Get all quizzes
export async function GET() {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: quizzes, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        description,
        resources (
          id,
          title,
          description,
          url
        )
      `)
      .order('name');

    if (error) {
      console.error('[QUIZ_GET]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('[QUIZ_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Submit quiz answers
export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = await getUserId(clerkUserId);
    const body = await req.json();
    const { subjectId, answers, score } = body;

    if (!subjectId || !answers || typeof score !== 'number') {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const { data: quizResult, error } = await supabase
      .from('quiz_results')
      .insert([
        {
          user_id: userId,
          subject_id: subjectId,
          score,
          answers,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[QUIZ_POST]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(quizResult);
  } catch (error) {
    console.error('[QUIZ_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 