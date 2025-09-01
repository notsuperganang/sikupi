'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import { Card } from './card'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderContent = (): ReactNode => {
    if (!content) return null

    const lines = content.split('\n')
    const elements: ReactNode[] = []
    let currentBlockType = ''
    let blockContent: string[] = []
    let listItems: string[] = []
    let blockquoteContent: string[] = []

    const flushBlock = () => {
      if (currentBlockType === 'code' && blockContent.length > 0) {
        elements.push(
          <pre key={elements.length} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-6">
            <code>{blockContent.join('\n')}</code>
          </pre>
        )
        blockContent = []
      }
      if (currentBlockType === 'list' && listItems.length > 0) {
        elements.push(
          <ul key={elements.length} className="list-disc list-inside space-y-2 ml-4 my-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed">
                {renderInlineElements(item)}
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
      if (currentBlockType === 'blockquote' && blockquoteContent.length > 0) {
        elements.push(
          <blockquote key={elements.length} className="border-l-4 border-yellow-600 bg-yellow-50 p-4 my-6 italic">
            <div className="text-gray-700 leading-relaxed">
              {blockquoteContent.map((line, idx) => (
                <p key={idx} className="mb-2 last:mb-0">
                  {renderInlineElements(line.replace(/^>\s*/, ''))}
                </p>
              ))}
            </div>
          </blockquote>
        )
        blockquoteContent = []
      }
      currentBlockType = ''
    }

    const renderInlineElements = (text: string): ReactNode => {
      if (!text) return text

      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-yellow-700 hover:text-yellow-800 underline">$1</a>')
        .split(/(<[^>]+>)/)
        .map((part, idx) => {
          if (part.startsWith('<') && part.endsWith('>')) {
            return <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />
          }
          return part
        })
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith('```')) {
        if (currentBlockType === 'code') {
          flushBlock()
        } else {
          flushBlock()
          currentBlockType = 'code'
        }
        continue
      }

      if (currentBlockType === 'code') {
        blockContent.push(line)
        continue
      }

      if (trimmedLine.startsWith('> ')) {
        if (currentBlockType !== 'blockquote') {
          flushBlock()
          currentBlockType = 'blockquote'
        }
        blockquoteContent.push(trimmedLine)
        continue
      } else if (currentBlockType === 'blockquote') {
        flushBlock()
      }

      if (trimmedLine.match(/^[-*+]\s+/)) {
        if (currentBlockType !== 'list') {
          flushBlock()
          currentBlockType = 'list'
        }
        listItems.push(trimmedLine.replace(/^[-*+]\s+/, ''))
        continue
      } else if (currentBlockType === 'list') {
        flushBlock()
      }

      if (trimmedLine.startsWith('![') && trimmedLine.includes('](')) {
        const match = trimmedLine.match(/!\[([^\]]*)\]\(([^)]+)\)/)
        if (match) {
          const [, alt, src] = match
          elements.push(
            <div key={elements.length} className="my-6">
              <Image
                src={src}
                alt={alt}
                width={800}
                height={400}
                className="w-full rounded-lg shadow-sm"
              />
              {alt && <p className="text-sm text-gray-500 text-center mt-2">{alt}</p>}
            </div>
          )
        }
        continue
      }

      if (trimmedLine.startsWith('#')) {
        flushBlock()
        const level = trimmedLine.match(/^#+/)?.[0].length || 1
        const text = trimmedLine.replace(/^#+\s*/, '')
        
        const HeadingComponent = ({ children }: { children: ReactNode }) => {
          const baseClasses = "font-bold text-gray-900 leading-tight mb-4 mt-8 first:mt-0"
          const levelClassesMap: Record<number, string> = {
            1: "text-3xl md:text-4xl",
            2: "text-2xl md:text-3xl",
            3: "text-xl md:text-2xl",
            4: "text-lg md:text-xl",
            5: "text-base md:text-lg",
            6: "text-sm md:text-base"
          }
          const levelClasses = levelClassesMap[Math.min(level, 6)] || levelClassesMap[6]
          
          return (
            <div className={`${baseClasses} ${levelClasses}`} id={text.toLowerCase().replace(/\s+/g, '-')}>
              {children}
            </div>
          )
        }

        elements.push(
          <HeadingComponent key={elements.length}>
            {renderInlineElements(text)}
          </HeadingComponent>
        )
        continue
      }

      if (trimmedLine === '') {
        continue
      }

      flushBlock()
      elements.push(
        <p key={elements.length} className="text-gray-700 leading-relaxed mb-4">
          {renderInlineElements(trimmedLine)}
        </p>
      )
    }

    flushBlock()
    return elements
  }

  return (
    <Card className="prose prose-gray max-w-none p-8 bg-white shadow-sm border-yellow-800/10">
      <div className={`markdown-content ${className}`}>
        {renderContent()}
      </div>
    </Card>
  )
}