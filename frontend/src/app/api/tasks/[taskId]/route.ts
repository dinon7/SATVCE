import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase, getUserId } from '@/lib/supabase';

interface RouteParams {
  params: {
    taskId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = await getUserId(clerkUserId);
    const body = await req.json();
    const { completed } = body;

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', params.taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[TASK_PATCH]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('[TASK_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = await getUserId(clerkUserId);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', params.taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('[TASK_DELETE]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TASK_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 