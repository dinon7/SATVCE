import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase, getOrCreateUserIdWithAuth } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { selected, rejected, timestamp } = await request.json();

    if (!selected || !Array.isArray(selected)) {
      return NextResponse.json(
        { error: 'Selected careers are required' },
        { status: 400 }
      );
    }

    const userId = await getOrCreateUserIdWithAuth();

    // Save career selections to database
    const { data: result, error } = await supabase
      .from('career_selections')
      .insert([
        {
          user_id: userId,
          selected_careers: selected,
          rejected_careers: rejected || [],
          created_at: timestamp || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[CAREER_SELECTIONS_POST]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[CAREER_SELECTIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = await getOrCreateUserIdWithAuth();

    const { data: selections, error } = await supabase
      .from('career_selections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CAREER_SELECTIONS_GET]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(selections);
  } catch (error) {
    console.error('[CAREER_SELECTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 