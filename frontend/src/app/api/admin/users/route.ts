import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
    verifyClerkToken, 
    checkAdminStatus, 
    getAllUsers,
    getUserByClerkId,
    logAdminActivity,
    supabaseAdmin 
} from '@/lib/supabase-admin';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Fallback users data for when backend is unavailable
function getFallbackUsers() {
    return {
        users: [],
        fallback: true,
        message: 'Using fallback data - backend unavailable',
        total: 0
    };
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${userId}`,
                    'Content-Type': 'application/json',
                },
            });

            if (backendResponse.ok) {
                const data = await backendResponse.json();
                return NextResponse.json(data);
            } else if (backendResponse.status === 403) {
                return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
            } else if (backendResponse.status === 401) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        } catch (backendError) {
            console.warn('Backend unavailable, using fallback users data:', backendError);
        }

        // Fallback: Return empty users list
        const fallbackData = getFallbackUsers();
        return NextResponse.json(fallbackData);

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
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
        const { uid, ...data } = body;

        // Update user in Supabase
        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update(data)
            .eq('clerk_user_id', uid)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        // Log admin activity
        await logAdminActivity(session.user.id, 'user_update', {
            targetUserId: uid,
            updatedFields: Object.keys(data)
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 