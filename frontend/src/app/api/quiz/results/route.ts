import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { dbUtils } from '@/utils/db';

export const GET = withAuth(async (request: Request, decodedToken: any) => {
    const results = await dbUtils.query(
        'quizResults',
        [{ field: 'userId', operator: '==', value: decodedToken.uid }],
        { field: 'createdAt', direction: 'desc' },
        5
    );

    return NextResponse.json(results);
}); 