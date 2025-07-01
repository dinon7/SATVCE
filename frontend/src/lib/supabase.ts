import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get user ID from Clerk user
export const getUserId = async (clerkUserId: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }

  return user.id;
};

// Helper function to get or create user ID with Clerk authentication
export const getOrCreateUserIdWithAuth = async () => {
  const { userId: clerkUserId } = auth();
  
  if (!clerkUserId) {
    throw new Error('Unauthorized - No Clerk user ID');
  }

  // Try to get existing user
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // If user doesn't exist, create a new one
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([
      {
        clerk_user_id: clerkUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ])
    .select('id')
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    throw new Error('Failed to create user');
  }

  return newUser.id;
}; 