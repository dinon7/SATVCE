import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase, getUserId } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = await getUserId(clerkUserId);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TASKS_GET]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = await getUserId(clerkUserId);
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return new NextResponse('Title is required', { status: 400 });
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          user_id: userId,
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[TASKS_POST]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 