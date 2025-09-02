'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  Calendar,
  Eye
} from 'lucide-react'

interface MagazineArticle {
  id: number
  title: string
  slug: string
  summary?: string
  excerpt?: string
  content?: string
  featured_image_url: string | null
  featured_image_path?: string
  gallery_images: string[]
  tags: string[]
  published: boolean
  featured: boolean
  view_count: number
  read_time_minutes: number
  author_name: string
  created_at: string
  updated_at: string
}

type ViewMode = 'list' | 'new' | 'edit'

export default function MagazinePage() {
  const { session, authenticatedFetch } = useAuth()
  const [articles, setArticles] = useState<MagazineArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<MagazineArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<MagazineArticle | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingArticle, setEditingArticle] = useState<MagazineArticle | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.access_token) {
      fetchArticles()
    }
  }, [session])

  useEffect(() => {
    // Ensure articles is always an array
    const articlesArray = Array.isArray(articles) ? articles : []
    
    // Ensure searchQuery is a string
    const query = (searchQuery || '').toLowerCase()
    
    const filtered = articlesArray.filter(article => {
      // Ensure article exists and has the required properties
      if (!article || typeof article !== 'object') return false
      
      const title = (article.title || '').toLowerCase()
      const summary = (article.summary || '').toLowerCase()
      const excerpt = (article.excerpt || '').toLowerCase()
      
      return title.includes(query) || 
             summary.includes(query) || 
             excerpt.includes(query)
    })
    setFilteredArticles(filtered)
  }, [articles, searchQuery])

  const fetchArticles = async () => {
    if (!session?.access_token) {
      setError('Authentication required')
      return
    }

    try {
      setLoading(true)
      
      const response = await authenticatedFetch('/api/admin/magazine')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Magazine API response:', data)
      
      // Handle admin API response structure: { data: { posts: [...] } }
      let articlesData = []
      if (Array.isArray(data.data?.posts)) {
        articlesData = data.data.posts
      } else if (Array.isArray(data.data?.articles)) {
        articlesData = data.data.articles
      } else if (Array.isArray(data.data)) {
        articlesData = data.data
      } else if (Array.isArray(data.posts)) {
        articlesData = data.posts
      } else if (Array.isArray(data.articles)) {
        articlesData = data.articles
      }
      
      setArticles(articlesData)
    } catch (error) {
      console.error('Failed to fetch magazine articles:', error)
      setError('Failed to load magazine articles')
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (articleId: number, currentStatus: boolean) => {
    if (!session?.access_token) return

    try {
      const response = await authenticatedFetch(`/api/admin/magazine/${articleId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          published: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update article')
      }

      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, published: !currentStatus }
          : article
      ))
    } catch (error) {
      console.error('Failed to toggle article status:', error)
    }
  }

  const saveArticle = async (articleData: any) => {
    if (!session?.access_token) {
      setError('Authentication required')
      return
    }

    try {
      setSaving(true)

      const url = articleData.id 
        ? `/api/admin/magazine/${articleData.id}`
        : '/api/admin/magazine'
      
      const method = articleData.id ? 'PUT' : 'POST'
      
      // Map frontend field names to API field names
      const apiData = {
        title: articleData.title || '',
        slug: articleData.slug || '',
        summary: articleData.summary || '',
        excerpt: articleData.excerpt || '',
        content: articleData.content || '', // Ensure content is always a string
        meta_description: (articleData.excerpt || articleData.summary || '').substring(0, 160), // Truncate to 160 chars
        featured_image_url: articleData.featured_image_url || null,
        gallery_images: Array.isArray(articleData.gallery_images) ? articleData.gallery_images : [],
        tags: Array.isArray(articleData.tags) ? articleData.tags : [],
        published: Boolean(articleData.published),
        read_time_minutes: Number(articleData.read_time_minutes) || 5
      }
      
      console.log('Sending API data:', apiData)
      
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        console.error('Full error details:', JSON.stringify(errorData, null, 2))
        
        // Show detailed validation errors
        if (errorData.error?.validation_errors) {
          console.error('Validation errors:', errorData.error.validation_errors)
        }
        
        throw new Error(`Failed to save article: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (articleData.id) {
        // Update existing article - PUT API returns { data: { post: {...} } }
        const updatedPost = data.data?.post || data.data || {}
        const updatedArticle = {
          ...updatedPost,
          content: updatedPost.content_md || updatedPost.content || '', // Map content_md back to content
        }
        setArticles(prev => prev.map(article => 
          article.id === articleData.id ? updatedArticle : article
        ))
      } else {
        // Add new article - POST API returns { data: responseData }
        const newPost = data.data || {}
        const newArticle = {
          ...newPost,
          content: newPost.content_md || newPost.content || '', // Map content_md back to content
        }
        setArticles(prev => [newArticle, ...prev])
      }

      setViewMode('list')
      setEditingArticle(null)
    } catch (error) {
      console.error('Failed to save article:', error)
      setError('Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (article: MagazineArticle) => {
    setEditingArticle(article)
    setViewMode('edit')
  }

  const handleNewArticle = () => {
    setEditingArticle(null)
    setViewMode('new')
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingArticle(null)
  }

  const convertToFormData = (article: MagazineArticle) => {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary || '',
      excerpt: article.excerpt || '',
      content: article.content || '', // Map content_md back to content if needed
      author_name: article.author_name,
      read_time_minutes: article.read_time_minutes,
      featured_image_url: article.featured_image_url || undefined,
      featured_image_path: article.featured_image_path || undefined,
      gallery_images: Array.isArray(article.gallery_images) ? article.gallery_images : [],
      tags: article.tags,
      published: article.published,
      featured: article.featured
    }
  }

  const deleteArticle = async (articleId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }

    if (!session?.access_token) return

    try {
      const response = await authenticatedFetch(`/api/admin/magazine/${articleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      // Remove from local state
      setArticles(prev => prev.filter(article => article.id !== articleId))
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('Failed to delete article')
    }
  }

  const truncateText = (text: string | undefined | null, maxLength: number) => {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Magazine</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show ArticleForm when creating or editing
  if (viewMode === 'new' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {viewMode === 'new' ? 'New Article' : 'Edit Article'}
          </h1>
          <Button variant="outline" onClick={handleCancel}>
            Back to List
          </Button>
        </div>
        
        <ArticleForm
          article={editingArticle ? convertToFormData(editingArticle) : undefined}
          onSave={saveArticle}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Magazine</h1>
        <Button onClick={handleNewArticle}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Article Management</CardTitle>
          <CardDescription>
            Manage your magazine articles and blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Articles Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reading Time</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No articles found matching your search' : 'No articles yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article, index) => (
                    <TableRow key={article.id || `article-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {article.featured_image_url ? (
                              <img 
                                src={article.featured_image_url} 
                                alt={article.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{truncateText(article.title, 50)}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {truncateText(article.excerpt || article.summary || '', 80)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              /{article.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => togglePublished(article.id, article.published)}
                          className="focus:outline-none"
                        >
                          <Badge 
                            variant={article.published ? 'default' : 'secondary'}
                            className="cursor-pointer hover:opacity-80"
                          >
                            {article.published ? 'Published' : 'Draft'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {article.read_time_minutes} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(article.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedArticle(article)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(article)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteArticle(article.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Article Preview Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription>
              Article preview and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="space-y-6">
              {/* Article Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant={selectedArticle.published ? 'default' : 'secondary'}>
                    {selectedArticle.published ? 'Published' : 'Draft'}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {selectedArticle.read_time_minutes} min read
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(selectedArticle.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {selectedArticle.featured_image_url && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedArticle.featured_image_url} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div>
                <h4 className="font-medium mb-2">Excerpt</h4>
                <p className="text-gray-700">{selectedArticle.excerpt}</p>
              </div>

              {/* Content Preview */}
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <div className="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    {(selectedArticle.content || selectedArticle.summary || '').split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Article Meta */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Article Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Slug:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                      /{selectedArticle.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2">{new Date(selectedArticle.updated_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}