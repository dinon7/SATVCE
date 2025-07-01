import { NextRequest, NextResponse } from 'next/server';
import { 
    verifyClerkToken, 
    checkAdminStatus, 
    logAdminActivity,
    supabaseAdmin 
} from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
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

        // Get query parameters
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const type = url.searchParams.get('type');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        // Build query
        let query = supabaseAdmin
            .from('resources')
            .select(`
                *,
                users:submitted_by (
                    clerk_user_id,
                    email,
                    first_name,
                    last_name
                )
            `)
            .order('submitted_at', { ascending: false })
            .limit(limit);

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (type) {
            query = query.eq('type', type);
        }

        const { data: resources, error } = await query;

        if (error) {
            console.error('Error fetching resources:', error);
            return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
        }

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        // Validate required fields
        const requiredFields = ['title', 'description', 'type', 'url'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        // Create resource in Supabase
        const { data: newResource, error } = await supabaseAdmin
            .from('resources')
            .insert({
                ...body,
                status: 'approved',
                submitted_by: session.user.id,
                submitted_at: new Date().toISOString(),
                approved_at: new Date().toISOString(),
                approved_by: session.user.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating resource:', error);
            return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
        }

        // Log admin activity
        await logAdminActivity(session.user.id, 'resource_create', {
            resourceId: newResource.id,
            resourceTitle: newResource.title
        });

        return NextResponse.json(newResource, { status: 201 });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 