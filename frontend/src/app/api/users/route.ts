import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { email, fullName } = body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          clerk_user_id: clerkUserId,
          email,
          full_name: fullName,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[USERS_POST]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('[USERS_GET]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USERS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 