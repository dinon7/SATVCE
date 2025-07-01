import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Fallback activity data for when backend is unavailable
function getFallbackActivity() {
    return {
        activities: [],
        fallback: true,
        message: 'Using fallback data - backend unavailable',
        total: 0
    };
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get limit from query params
        const url = new URL(request.url);
        const limit = url.searchParams.get('limit') || '20';

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/admin/activity?limit=${limit}`, {
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
            console.warn('Backend unavailable, using fallback activity data:', backendError);
        }

        // Fallback: Return empty activity list
        const fallbackData = getFallbackActivity();
        return NextResponse.json(fallbackData);

    } catch (error) {
        console.error('Error fetching admin activity:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 