'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Edit, Plus, Save, X } from 'lucide-react'

interface Tag {
  id: string
  name: string
  description?: string
  usage_count?: number
}

export default function AdminTagsPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  const fetchTags = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = await getToken()
      const response = await fetch('/api/admin/tags', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }

      const data = await response.json()
      setTags(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    fetchTags()
  }, [user, fetchTags])

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAddingTag(true)
      const token = await getToken()
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          description: newTagDescription.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add tag')
      }

      const newTag = await response.json()
      setTags([...tags, newTag])
      setNewTagName('')
      setNewTagDescription('')
      setIsAddingTag(false)

      toast({
        title: "Success",
        description: "Tag added successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to add tag',
        variant: "destructive",
      })
    } finally {
      setIsAddingTag(false)
    }
  }

  const handleUpdateTag = async (tagId: string, name: string, description?: string) => {
    try {
      const token = await getToken()
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description?.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tag')
      }

      const updatedTag = await response.json()
      setTags(tags.map(tag => tag.id === tagId ? updatedTag : tag))
      setEditingTag(null)

      toast({
        title: "Success",
        description: "Tag updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update tag',
        variant: "destructive",
      })
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return
    }

    try {
      const token = await getToken()
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete tag')
      }

      setTags(tags.filter(tag => tag.id !== tagId))

      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete tag',
        variant: "destructive",
      })
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
        <p className="mt-2 text-gray-600">Manage tags for categorizing resources and content.</p>
      </div>

      {/* Add New Tag */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Tag</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Description (optional)"
              value={newTagDescription}
              onChange={(e) => setNewTagDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
          </div>
          <Button 
            onClick={handleAddTag} 
            disabled={isAddingTag || !newTagName.trim()}
            className="flex items-center gap-2"
          >
            {isAddingTag ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
            Add Tag
          </Button>
        </div>
      </div>

      {/* Tags List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Tags</h2>
        <div className="space-y-4">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg">
              {editingTag === tag.id ? (
                <div className="flex-1 flex gap-4">
                  <Input
                    value={tag.name}
                    onChange={(e) => {
                      const updatedTags = tags.map(t => 
                        t.id === tag.id ? { ...t, name: e.target.value } : t
                      )
                      setTags(updatedTags)
                    }}
                  />
                  <Input
                    placeholder="Description"
                    value={tag.description || ''}
                    onChange={(e) => {
                      const updatedTags = tags.map(t => 
                        t.id === tag.id ? { ...t, description: e.target.value } : t
                      )
                      setTags(updatedTags)
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTag(tag.id, tag.name, tag.description)}
                    className="flex items-center gap-1"
                  >
                    <Save size={14} />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTag(null)}
                    className="flex items-center gap-1"
                  >
                    <X size={14} />
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{tag.name}</h3>
                    {tag.description && (
                      <p className="text-sm text-gray-600">{tag.description}</p>
                    )}
                    {tag.usage_count !== undefined && (
                      <p className="text-xs text-gray-500">
                        Used in {tag.usage_count} resource{tag.usage_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTag(tag.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {tags.length === 0 && (
            <p className="text-gray-500 text-center py-8">No tags found. Add your first tag above.</p>
          )}
        </div>
      </div>
    </div>
  )
} 