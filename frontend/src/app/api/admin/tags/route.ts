import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

// Sample tags data - in production this would come from a database
let sampleTags = [
  { id: '1', name: 'study skills', description: 'Resources for improving study techniques', usage_count: 5 },
  { id: '2', name: 'careers', description: 'Career planning and exploration resources', usage_count: 8 },
  { id: '3', name: 'exam prep', description: 'Exam preparation materials and strategies', usage_count: 12 },
  { id: '4', name: 'uni admissions', description: 'University admission information and guidance', usage_count: 6 },
  { id: '5', name: 'university', description: 'General university-related resources', usage_count: 10 },
  { id: '6', name: 'prerequisites', description: 'Subject prerequisites and requirements', usage_count: 4 },
  { id: '7', name: 'atar', description: 'ATAR calculation and information', usage_count: 7 },
  { id: '8', name: 'planning', description: 'Academic and career planning resources', usage_count: 9 },
  { id: '9', name: 'vcaa', description: 'VCAA-specific resources and guidelines', usage_count: 3 },
  { id: '10', name: 'mathematics', description: 'Mathematics subject resources', usage_count: 6 },
  { id: '11', name: 'science', description: 'Science subject resources', usage_count: 5 },
  { id: '12', name: 'english', description: 'English subject resources', usage_count: 4 },
  { id: '13', name: 'humanities', description: 'Humanities subject resources', usage_count: 3 },
  { id: '14', name: 'languages', description: 'Language learning resources', usage_count: 2 },
  { id: '15', name: 'arts', description: 'Arts and creative subject resources', usage_count: 3 },
  { id: '16', name: 'technology', description: 'Technology and computing resources', usage_count: 7 },
  { id: '17', name: 'health', description: 'Health and physical education resources', usage_count: 4 },
  { id: '18', name: 'business', description: 'Business and economics resources', usage_count: 5 }
]

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real application, you would check if the user is an admin
    // For now, we'll return the sample data
    return NextResponse.json(sampleTags)

  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Check if tag already exists
    const existingTag = sampleTags.find(tag => 
      tag.name.toLowerCase() === name.trim().toLowerCase()
    )

    if (existingTag) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
    }

    // Create new tag
    const newTag = {
      id: (sampleTags.length + 1).toString(),
      name: name.trim(),
      description: description?.trim() || undefined,
      usage_count: 0
    }

    sampleTags.push(newTag)

    return NextResponse.json(newTag, { status: 201 })

  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 