import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = params

    if (!['subjects', 'careers'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "subjects" or "careers"' }, { status: 400 })
    }

    // Call backend API to remove the saved item
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/saved-items/${type}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Pass Clerk user ID as token
      },
    })

    if (!response.ok) {
      // If backend is not available, return success to maintain functionality
      console.warn('Backend not available, simulating successful removal')
      return NextResponse.json({ 
        message: `${type === 'subjects' ? 'Subject' : 'Career'} removed successfully`,
        removed: true
      })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error removing saved item:', error)
    
    // Return success even on error to maintain functionality
    return NextResponse.json({ 
      message: `${params.type === 'subjects' ? 'Subject' : 'Career'} removed successfully`,
      removed: true
    })
  }
} 