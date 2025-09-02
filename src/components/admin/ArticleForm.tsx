'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Switch } from '@/components/ui/switch' // We'll use a simple checkbox for now
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Save,
  Upload,
  X,
  Plus,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2
} from 'lucide-react'

interface ArticleFormData {
  id?: number
  title: string
  slug: string
  summary: string
  excerpt: string
  content: string
  author_name: string
  read_time_minutes: number
  featured_image_url?: string
  featured_image_path?: string
  gallery_images: string[]
  tags: string[]
  published: boolean
  featured: boolean
}

interface ArticleFormProps {
  article?: ArticleFormData
  onSave: (article: ArticleFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ArticleForm({ article, onSave, onCancel, loading = false }: ArticleFormProps) {
  const { session, authenticatedFetch } = useAuth()
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    summary: '',
    excerpt: '',
    content: '',
    author_name: session?.user?.user_metadata?.full_name || 'Admin',
    read_time_minutes: 5,
    gallery_images: [],
    tags: [],
    published: false,
    featured: false,
    ...article
  })
  
  const [newTag, setNewTag] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.featured_image_url || null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    formData.gallery_images || []
  )
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !article?.id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, article?.id])

  // Auto-calculate reading time
  useEffect(() => {
    const wordCount = formData.content.split(/\s+/).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)) // 200 words per minute
    setFormData(prev => ({ ...prev, read_time_minutes: readingTime }))
  }, [formData.content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('Title and content are required')
      return
    }
    
    let finalFormData = { ...formData }
    
    // Upload featured image if new file selected
    if (imageFile) {
      setUploadingImage(true)
      try {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)
        uploadFormData.append('type', 'featured')

        // Note: For FormData, we must not set Content-Type - let browser handle it
        const response = await authenticatedFetch('/api/admin/magazine/upload', {
          method: 'POST',
          body: uploadFormData,
          headers: {} // Explicitly empty headers to avoid any Content-Type interference
        })

        if (!response.ok) {
          throw new Error('Failed to upload featured image')
        }

        const result = await response.json()
        finalFormData.featured_image_url = result.data.url
        finalFormData.featured_image_path = result.data.path
      } catch (error) {
        console.error('Featured image upload failed:', error)
        alert('Failed to upload featured image')
        return
      } finally {
        setUploadingImage(false)
      }
    }

    // Upload gallery images if new files selected
    if (galleryFiles.length > 0) {
      setUploadingGallery(true)
      try {
        const uploadPromises = galleryFiles.map(async (file) => {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('type', 'gallery')

          // Note: For FormData, we must not set Content-Type - let browser handle it
          const response = await authenticatedFetch('/api/admin/magazine/upload', {
            method: 'POST',
            body: uploadFormData,
            headers: {} // Explicitly empty headers to avoid any Content-Type interference
          })

          if (!response.ok) {
            throw new Error(`Failed to upload gallery image: ${file.name}`)
          }

          const result = await response.json()
          return result.data.url
        })

        const uploadedGalleryUrls = await Promise.all(uploadPromises)
        finalFormData.gallery_images = [
          ...finalFormData.gallery_images,
          ...uploadedGalleryUrls
        ]
      } catch (error) {
        console.error('Gallery images upload failed:', error)
        alert('Failed to upload gallery images')
        return
      } finally {
        setUploadingGallery(false)
      }
    }
    
    await onSave(finalFormData)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files])
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setGalleryPreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeGalleryImage = (index: number) => {
    const isExistingImage = index < formData.gallery_images.length
    
    if (isExistingImage) {
      // Remove from existing gallery images
      setFormData(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== index)
      }))
    } else {
      // Remove from new files
      const newFileIndex = index - formData.gallery_images.length
      setGalleryFiles(prev => prev.filter((_, i) => i !== newFileIndex))
    }
    
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {article?.id ? 'Edit Article' : 'New Article'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-url-slug"
                  required
                />
              </div>
            </div>

            {/* Author and Reading Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Author name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="readTime">Reading Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min="1"
                  value={formData.read_time_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImagePreview(null)
                          setImageFile(null)
                        }}
                      >
                        Remove Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Recommended: 1200x630px, JPG or PNG
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {galleryPreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Gallery ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add More Images
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Gallery Images
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add multiple images to create a gallery (Optional)
                    </p>
                  </div>
                )}
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of the article"
                rows={2}
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Article excerpt for listings and previews"
                rows={3}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
              
              {showPreview ? (
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
                  <div className="prose max-w-none">
                    {formData.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here... (Supports Markdown)"
                  rows={15}
                  required
                />
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="published">Publish Article</Label>
                    <p className="text-sm text-gray-500">Make this article visible to public</p>
                  </div>
                  <input
                    id="published"
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, published: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured">Featured Article</Label>
                    <p className="text-sm text-gray-500">Show this article in featured sections</p>
                  </div>
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploadingImage}>
                {loading || uploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingImage ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {article?.id ? 'Update Article' : 'Create Article'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
