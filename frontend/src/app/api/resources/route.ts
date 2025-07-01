import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    // Call backend API to get resources
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    let url = `${backendUrl}/api/v1/resources`
    
    if (tag) {
      url += `?tag=${encodeURIComponent(tag)}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Pass Clerk user ID as token
      },
    })

    if (!response.ok) {
      // If backend is not available, return empty array
      console.warn('Backend not available, returning empty resources')
      return NextResponse.json([])
    }

    const resources = await response.json()
    return NextResponse.json(resources)

  } catch (error) {
    console.error('Error fetching resources:', error)
    
    // Return empty array on error
    return NextResponse.json([])
  }
} 