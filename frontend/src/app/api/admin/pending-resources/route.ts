import { NextResponse } from 'next/server';
import { 
    verifyClerkToken, 
    checkAdminStatus, 
    getPendingResources, 
    updateResourceStatus,
    logAdminActivity 
} from '@/lib/supabase-admin';

export async function GET(request: Request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the Clerk token
        const token = authHeader.split('Bearer ')[1];
        const session = await verifyClerkToken(token);
        
        // Check if user is admin
        const isAdmin = await checkAdminStatus(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Fetch pending resources from Supabase
        const resources = await getPendingResources();

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching pending resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the Clerk token
        const token = authHeader.split('Bearer ')[1];
        const session = await verifyClerkToken(token);
        
        // Check if user is admin
        const isAdmin = await checkAdminStatus(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Get the request body
        const body = await request.json();
        const { resourceId, action } = body;

        if (!resourceId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        // Update the resource status
        const updatedResource = await updateResourceStatus(
            resourceId, 
            action as 'approved' | 'rejected', 
            session.user.id
        );

        // Log admin activity
        await logAdminActivity(session.user.id, `resource_${action}`, {
            resourceId,
            action,
            resourceTitle: updatedResource.title
        });

        return NextResponse.json({ 
            success: true, 
            resource: updatedResource 
        });
    } catch (error) {
        console.error('Error updating resource status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 