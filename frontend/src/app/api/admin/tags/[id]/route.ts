import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

// Import the sample tags data (in a real app, this would be a database)
// For now, we'll recreate it here - in production, use a shared database
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Find the tag to update
    const tagIndex = sampleTags.findIndex(tag => tag.id === id)
    
    if (tagIndex === -1) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if the new name conflicts with another tag
    const existingTag = sampleTags.find(tag => 
      tag.id !== id && tag.name.toLowerCase() === name.trim().toLowerCase()
    )

    if (existingTag) {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 })
    }

    // Update the tag
    const updatedTag = {
      ...sampleTags[tagIndex],
      name: name.trim(),
      description: description?.trim() || undefined
    }

    sampleTags[tagIndex] = updatedTag

    return NextResponse.json(updatedTag)

  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Find the tag to delete
    const tagIndex = sampleTags.findIndex(tag => tag.id === id)
    
    if (tagIndex === -1) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if tag is being used
    const tag = sampleTags[tagIndex]
    if (tag.usage_count && tag.usage_count > 0) {
      return NextResponse.json({ 
        error: `Cannot delete tag "${tag.name}" as it is used in ${tag.usage_count} resource(s)` 
      }, { status: 400 })
    }

    // Remove the tag
    sampleTags.splice(tagIndex, 1)

    return NextResponse.json({ message: 'Tag deleted successfully' })

  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 