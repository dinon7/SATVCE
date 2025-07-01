import { NextRequest, NextResponse } from 'next/server';
import { 
    verifyClerkToken, 
    checkAdminStatus, 
    getUserByClerkId,
    logAdminActivity,
    supabaseAdmin 
} from '@/lib/supabase-admin';

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the Clerk token
        const session = await verifyClerkToken(token);
        
        // Check if user is admin
        const isAdmin = await checkAdminStatus(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Get target user by Clerk ID
        const targetUser = await getUserByClerkId(params.uid);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(targetUser);
  } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the Clerk token
        const session = await verifyClerkToken(token);
        
        // Check if user is admin
        const isAdmin = await checkAdminStatus(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const body = await request.json();

        // Update user in Supabase
        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update(body)
            .eq('clerk_user_id', params.uid)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        // Log admin activity
        await logAdminActivity(session.user.id, 'user_update', {
            targetUserId: params.uid,
            updatedFields: Object.keys(body)
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the Clerk token
        const session = await verifyClerkToken(token);
        
        // Check if user is admin
        const isAdmin = await checkAdminStatus(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Delete user from Supabase
        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('clerk_user_id', params.uid);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        // Log admin activity
        await logAdminActivity(session.user.id, 'user_delete', {
            targetUserId: params.uid
        });

        return NextResponse.json({ success: true });
  } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 