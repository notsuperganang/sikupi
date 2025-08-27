import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const MODEL_CONFIG = {
  primary: 'gpt-4o-mini',
  fallback: 'gpt-4o',
  maxRetries: 2,
  timeout: 30000, // 30 seconds
} as const

// Model selection with automatic fallback
export async function createChatCompletion(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, 'model'>,
  options?: { preferFallback?: boolean }
): Promise<OpenAI.Chat.ChatCompletion> {
  const models = options?.preferFallback 
    ? [MODEL_CONFIG.fallback, MODEL_CONFIG.primary]
    : [MODEL_CONFIG.primary, MODEL_CONFIG.fallback]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      console.log(`[OpenAI] Attempting with model: ${model}`)
      
      const response = await openai.chat.completions.create({
        ...params,
        model,
        stream: false,
      }, {
        timeout: MODEL_CONFIG.timeout,
      }) as OpenAI.Chat.ChatCompletion

      console.log(`[OpenAI] Success with ${model} - Tokens: ${response.usage?.total_tokens || 0}`)
      return response
      
    } catch (error) {
      console.error(`[OpenAI] Failed with ${model}:`, error)
      lastError = error as Error
      
      // Don't retry on certain errors
      if (error instanceof OpenAI.BadRequestError || 
          error instanceof OpenAI.AuthenticationError ||
          error instanceof OpenAI.PermissionDeniedError) {
        throw error
      }
      
      // Continue to next model for other errors
      continue
    }
  }

  // If all models failed, throw the last error
  throw lastError || new Error('All OpenAI models failed')
}

// Structured output helper for analyzer
export async function createStructuredCompletion<T>(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  schema: { name: string; schema: any; strict: boolean },
  options?: { preferFallback?: boolean }
): Promise<{ data: T; model: string; latency_ms: number }> {
  const startTime = performance.now()
  
  try {
    const response = await createChatCompletion({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: schema
      },
      temperature: 0.1, // Lower temperature for more consistent structured outputs
    }, options)

    const latency_ms = Math.round(performance.now() - startTime)
    
    if (!response.choices[0]?.message?.content) {
      throw new Error('No content in OpenAI response')
    }

    const data = JSON.parse(response.choices[0].message.content) as T
    
    return {
      data,
      model: response.model,
      latency_ms
    }
    
  } catch (error) {
    const latency_ms = Math.round(performance.now() - startTime)
    console.error(`[OpenAI Structured] Failed after ${latency_ms}ms:`, error)
    throw error
  }
}

// Mock tools for demo (can be replaced with real integrations later)
export const mockTools = {
  async listProducts(params: { purpose?: string; qty_kg?: number; city?: string }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return [
      {
        id: 1,
        title: "Ampas Kopi Arabika Premium",
        price_range: "Rp 25.000-30.000/kg",
        stock: "Tersedia (500kg)",
        kecocokan: params.purpose === "kompos" ? "95%" : "85%",
        shipping_time: params.city === "Banda Aceh" ? "2-3 hari" : "1-2 hari"
      },
      {
        id: 2,
        title: "Ampas Kopi Robusta Organik",
        price_range: "Rp 20.000-25.000/kg",
        stock: "Tersedia (300kg)",
        kecocokan: params.purpose === "kompos" ? "90%" : "80%",
        shipping_time: params.city === "Banda Aceh" ? "3-4 hari" : "2-3 hari"
      },
      {
        id: 3,
        title: "Mix Ampas Kopi Grade A",
        price_range: "Rp 22.000-28.000/kg",
        stock: "Terbatas (150kg)",
        kecocokan: params.purpose === "kompos" ? "88%" : "75%",
        shipping_time: params.city === "Banda Aceh" ? "2-4 hari" : "1-3 hari"
      }
    ]
  },

  async getShippingQuotes(params: { weight_kg: number; origin?: string; destination?: string }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const basePrice = params.weight_kg * 15000 // Base: Rp 15k/kg
    const distance = params.destination?.includes("Aceh") ? 1.5 : 1.0 // Distance multiplier
    
    return [
      {
        courier: "JNE REG",
        price: Math.round(basePrice * distance),
        time: params.destination?.includes("Aceh") ? "3-4 hari" : "1-2 hari",
        confidence: "Tinggi"
      },
      {
        courier: "POS Indonesia",
        price: Math.round(basePrice * distance * 0.8),
        time: params.destination?.includes("Aceh") ? "4-6 hari" : "2-3 hari",
        confidence: "Sedang"
      },
      {
        courier: "TIKI Economy",
        price: Math.round(basePrice * distance * 0.9),
        time: params.destination?.includes("Aceh") ? "3-5 hari" : "2-3 hari",
        confidence: "Tinggi"
      }
    ]
  }
}

// Convert file to base64 data URL for OpenAI Vision (server-side)
export async function fileToDataURL(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Use the original MIME type (JPEG/PNG only)
    const mimeType = file.type || 'image/jpeg'
    
    // Create data URL with proper MIME type
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
    
  } catch (error) {
    console.error('[FileToDataURL] Conversion failed:', error)
    throw new Error('Failed to convert file to data URL')
  }
}

// Convert image URL to data URL (for consistent processing)
export async function imageUrlToDataURL(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
    
    const blob = await response.blob()
    const file = new File([blob], 'image', { type: blob.type })
    return fileToDataURL(file)
  } catch (error) {
    console.error('[Image URL] Failed to convert:', error)
    throw new Error('Failed to process image URL')
  }
}