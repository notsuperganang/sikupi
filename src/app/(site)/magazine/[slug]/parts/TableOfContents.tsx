'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { List, ChevronRight, ChevronDown, BookOpen } from 'lucide-react'

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const extractHeadings = () => {
      const lines = content.split('\n')
      const headings: TocItem[] = []
      
      lines.forEach((line) => {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('#')) {
          const level = (trimmedLine.match(/^#+/) || [''])[0].length
          const title = trimmedLine.replace(/^#+\s*/, '')
          const id = title.toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-')
          
          if (level <= 3) {
            headings.push({ id, title, level })
          }
        }
      })
      
      setTocItems(headings)
    }

    extractHeadings()
  }, [content])

  useEffect(() => {
    const handleScroll = () => {
      const headings = tocItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      })).filter(item => item.element)

      let currentActiveId = ''
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i]
        if (heading.element) {
          const rect = heading.element.getBoundingClientRect()
          if (rect.top <= 120) {
            currentActiveId = heading.id
            break
          }
        }
      }

      setActiveId(currentActiveId)

      // Calculate reading progress based on article content
      const articleContent = document.querySelector('.markdown-content') as HTMLElement
      if (articleContent) {
        const articleRect = articleContent.getBoundingClientRect()
        const articleTop = articleRect.top + window.pageYOffset
        const articleHeight = articleContent.offsetHeight
        const viewportHeight = window.innerHeight
        const scrollTop = window.pageYOffset

        // Start tracking when article comes into view
        const readingStart = articleTop - viewportHeight * 0.3
        // End tracking when article is fully read
        const readingEnd = articleTop + articleHeight - viewportHeight * 0.7

        if (scrollTop < readingStart) {
          setReadingProgress(0)
        } else if (scrollTop > readingEnd) {
          setReadingProgress(100)
        } else {
          const progress = ((scrollTop - readingStart) / (readingEnd - readingStart)) * 100
          setReadingProgress(Math.min(Math.max(progress, 0), 100))
        }
      } else {
        // Fallback to document-based calculation if article not found
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollTop = window.pageYOffset
        const progress = (scrollTop / documentHeight) * 100
        setReadingProgress(Math.min(Math.max(progress, 0), 100))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-28 space-y-4"
    >
      {/* Reading Progress */}
      <Card className="border-yellow-800/20 bg-white/95 backdrop-blur-sm shadow-sm p-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-yellow-700 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Progress Baca</span>
              <span className="text-xs text-gray-600">{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Table of Contents */}
      <Card className="border-yellow-800/20 bg-white/95 backdrop-blur-sm shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-800/10">
          <Button
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between gap-2 hover:bg-yellow-100/50 p-2"
          >
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-yellow-700" />
              <span className="font-semibold text-gray-900">Daftar Isi</span>
            </div>
            {isCollapsed ? 
              <ChevronRight className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <nav className="p-2">
                <ul className="space-y-1">
                  {tocItems.map((item, index) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      style={{ marginLeft: `${(item.level - 1) * 12}px` }}
                    >
                      <button
                        onClick={() => scrollToHeading(item.id)}
                        className={`
                          w-full text-left p-2 rounded-lg text-sm transition-all duration-200 relative
                          ${activeId === item.id 
                            ? 'bg-yellow-100 text-yellow-800 font-medium shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        {activeId === item.id && (
                          <motion.div
                            layoutId="active-toc-indicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-600 rounded-r-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        <span className="block pl-3 leading-tight">
                          {item.title}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="px-4 py-3 bg-gray-50/50 border-t border-yellow-800/10">
          <p className="text-xs text-gray-500 text-center">
            {tocItems.length} bagian dalam artikel
          </p>
        </div>
      </Card>
    </motion.div>
  )
}