import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call backend API to get tags
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/resources/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Pass Clerk user ID as token
      },
    })

    if (!response.ok) {
      // If backend is not available, return default tags
      console.warn('Backend not available, returning default tags')
      return NextResponse.json([
        { id: '1', name: 'study skills', count: 0 },
        { id: '2', name: 'vcaa', count: 0 },
        { id: '3', name: 'planning', count: 0 },
        { id: '4', name: 'careers', count: 0 },
        { id: '5', name: 'university', count: 0 },
        { id: '6', name: 'atar', count: 0 }
      ])
    }

    const tags = await response.json()
    return NextResponse.json(tags)

  } catch (error) {
    console.error('Error fetching tags:', error)
    
    // Return default tags on error
    return NextResponse.json([
      { id: '1', name: 'study skills', count: 0 },
      { id: '2', name: 'vcaa', count: 0 },
      { id: '3', name: 'planning', count: 0 },
      { id: '4', name: 'careers', count: 0 },
      { id: '5', name: 'university', count: 0 },
      { id: '6', name: 'atar', count: 0 }
    ])
  }
} 