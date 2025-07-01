import { NextRequest, NextResponse } from 'next/server';
import { 
    verifyClerkToken, 
    checkAdminStatus, 
    getSiteSettings,
    updateSiteSettings,
    logAdminActivity 
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

        // Get site settings from Supabase
        const settings = await getSiteSettings();

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
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

        // Update site settings in Supabase
        const updatedSettings = await updateSiteSettings(session.user.id, body);

        // Log admin activity
        await logAdminActivity(session.user.id, 'settings_update', {
            updatedFields: Object.keys(body)
        });

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error('Error updating site settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 