import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Fallback admin stats for when backend is unavailable
function getFallbackAdminStats() {
    return {
        totalUsers: 0,
        totalQuizzes: 0,
        totalReports: 0,
        activeUsers: 0,
        totalCourses: 0,
        totalResources: 0,
        fallback: true,
        message: 'Using fallback data - backend unavailable'
    };
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try backend first
        try {
            const backendResponse = await fetch(`${BACKEND_URL}/api/v1/admin/stats`, {
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
            console.warn('Backend unavailable, using fallback admin stats:', backendError);
        }

        // Fallback: Return basic admin stats
        const fallbackStats = getFallbackAdminStats();
        return NextResponse.json(fallbackStats);

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 