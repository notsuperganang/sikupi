'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
import { HoverEffect } from '@/components/ui/card-hover-effect'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coffee, 
  Lightbulb, 
  TrendingUp,
  User
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Component to render chat message content with proper markdown formatting
const ChatMessageContent = ({ content, role }: { content: string; role: 'user' | 'assistant' }) => {
  if (role === 'user') {
    // For user messages, just render plain text
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    )
  }

  // For assistant messages, render markdown with custom styling
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-gray-800">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-800">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-gray-800">{children}</h3>,
          p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          ul: ({ children }) => <ul className="mb-3 space-y-1 ml-4">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 space-y-1 ml-4 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          code: ({ children }) => (
            <code className="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-xs font-mono text-amber-800">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs overflow-x-auto mb-3 text-amber-800">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-500 pl-4 italic text-gray-600 mb-3 bg-amber-50 py-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

const presetQuestions = [
  {
    icon: Coffee,
    title: "Tanyakan tentang produk ampas kopi",
    question: "Apa saja produk ampas kopi yang tersedia di Sikupi?"
  },
  {
    icon: Lightbulb,
    title: "Minta rekomendasi pemanfaatan",
    question: "Bagaimana cara memanfaatkan ampas kopi untuk pupuk tanaman?"
  },
  {
    icon: TrendingUp,
    title: "Analisis harga pasar kopi",
    question: "Bagaimana perkembangan harga ampas kopi di pasar saat ini?"
  }
]

// Remove dummy conversation data - start with just the initial greeting
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hai! Saya Ampy, asisten virtual Sikupi. Saya siap membantu Anda dengan segala hal tentang ampas kopi dan produk berkelanjutan kami. Ada yang bisa saya bantu hari ini?',
    timestamp: new Date()
  }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
        duration: 0.6
      }
    }
  }

  const heroVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
        duration: 0.8,
        delay: 0.3
      }
    }
  }

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotate: -5
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
        duration: 0.8,
        delay: 0.5
      }
    }
  }

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 15,
        duration: 0.5
      }
    }
  }

  // Initialize page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Placeholder messages for the vanish input
  const placeholders = [
    "Apa manfaat ampas kopi untuk tanaman?",
    "Bagaimana cara mengolah ampas kopi menjadi pupuk?",
    "Ceritakan tentang produk Sikupi...",
    "Apa perbedaan kopi arabika dan robusta?",
    "Tips menyeduh kopi yang enak?",
    "Bagaimana cara menyimpan kopi agar tetap segar?"
  ]

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }
      // Then scroll to the actual end of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        })
      }, 300)
    }, 100)
  }

  useEffect(() => {
    if (messages.length > 1) { // Only scroll if there are actual messages beyond the initial one
      scrollToBottom()
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          toolsEnabled: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data?.reply || data.reply || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSendMessage(inputValue)
      setInputValue('') // Clear the input after sending
    }
  }

  const handlePresetClick = (question: string) => {
    handleSendMessage(question)
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
      initial="hidden"
      animate={isPageLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Interactive Ripple Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundRippleEffect
          rows={8}
          cols={20}
          cellSize={60}
          borderColor="rgba(217, 119, 6, 0.3)"
          fillColor="rgba(245, 158, 11, 0.2)"
          shadowColor="rgba(154, 52, 18, 0.4)"
          activeColor="rgba(217, 119, 6, 0.5)"
        />
      </div>
      
      <motion.div 
        className="max-w-4xl mx-auto px-4 pt-20 md:pt-24 pb-8 relative z-10"
        variants={itemVariants}
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          variants={heroVariants}
        >
          <motion.div 
            className="relative inline-block mb-6"
            variants={imageVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <Image
              src="/image-asset/ampy.png"
              alt="Ampy - Sikupi AI Assistant"
              width={160}
              height={160}
              className="relative rounded-full shadow-lg border-4 border-white"
            />
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            Hai, saya{" "}
            <SparklesText 
              className="inline-block text-4xl md:text-5xl font-bold"
              colors={{ first: "#f59e0b", second: "#ea580c" }}
              sparklesCount={8}
            >
              Ampy
            </SparklesText>{" "}
            👋
          </motion.h1>
          <motion.p 
            className="text-xl text-amber-700 font-medium mb-6"
            variants={itemVariants}
          >
            Apa yang bisa saya bantu hari ini?
          </motion.p>
        </motion.div>

        {/* Preset Question Cards - Only show if no conversation yet */}
        {messages.length <= 1 && (
          <motion.div 
            className="mb-12 relative z-20"
            variants={itemVariants}
          >
            <HoverEffect
              items={presetQuestions.map(preset => ({
                title: preset.title,
                description: "Klik untuk bertanya kepada Ampy",
                icon: <preset.icon className="w-8 h-8 text-amber-600" />,
                question: preset.question
              }))}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 py-0"
              onItemClick={(item) => handlePresetClick(item.question)}
            />
          </motion.div>
        )}

        {/* Chat Conversation Area */}
        <motion.div 
          ref={chatContainerRef} 
          className="max-w-3xl mx-auto relative z-20"
          variants={itemVariants}
        >
          <div className="space-y-6 mb-8">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  layout
                >
                  {message.role === 'assistant' && (
                    <motion.div 
                      className="flex-shrink-0"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-white shadow-sm flex items-center justify-center">
                        <Image
                          src="/image-asset/ampy.png"
                          alt="Ampy"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md'
                        : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                    }`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.15 }}
                  >
                    <ChatMessageContent content={message.content} role={message.role} />
                    <motion.div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-amber-100' : 'text-gray-500'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {message.timestamp.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </motion.div>
                  </motion.div>

                  {message.role === 'user' && (
                    <motion.div 
                      className="flex-shrink-0"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                className="flex gap-4 justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
              >
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-white shadow-sm flex items-center justify-center">
                    <Image
                      src="/image-asset/ampy.png"
                      alt="Ampy"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                </motion.div>
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 border border-gray-200 shadow-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.15 }}
                >
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Section - Integrated into page */}
          {/* Chat Input Section - Clean without box */}
          <motion.div 
            className="space-y-4"
            variants={itemVariants}
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={handleSubmit}
            />
            
            <motion.div 
              className="text-xs text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Ampy didukung oleh AI. Informasi yang diberikan mungkin tidak selalu akurat.
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
