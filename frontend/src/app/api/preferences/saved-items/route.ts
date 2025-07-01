import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call backend API to get user's saved items
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/saved-items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Pass Clerk user ID as token
      },
    })

    if (!response.ok) {
      // If backend is not available, return empty data
      console.warn('Backend not available, returning empty saved items')
      return NextResponse.json({
        subjects: [],
        careers: []
      })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching saved items:', error)
    
    // Return empty data on error
    return NextResponse.json({
      subjects: [],
      careers: []
    })
  }
} 