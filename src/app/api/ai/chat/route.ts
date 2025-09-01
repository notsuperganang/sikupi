import { NextRequest, NextResponse } from 'next/server'
import { createChatCompletion, mockTools } from '@/lib/openai'
import { ZChatRequest, ZChatResponse, type ChatMessage, type ChatResponse } from '@/lib/schemas/analyzer'
import OpenAI from 'openai'

const SIKUPIBOT_SYSTEM_PROMPT = `Kamu adalah *Ampy*, asisten untuk marketplace Sikupi yang ramah dan membantu.

Kepribadian:
- Ramah, santai, sedikit playful
- Gunakan Bahasa Indonesia yang natural
- Singkat tapi informatif
- Kalau ditanya rekomendasi, berikan 3 pilihan dalam format tabel compact
- Transparan tentang estimasi heuristik (bukan lab result)

Kemampuan kamu:
1. **Q&A Produk & Edukasi**: Ampas kopi basah vs kering, cara penyimpanan, tips kompos, dll.
2. **Rekomendasi Produk**: Berikan 3 opsi terbaik + tabel perbandingan (judul, perkiraan harga, stok, kecocokan untuk tujuan user).
3. **Bantuan Checkout**: Jelaskan flow Midtrans, status order, tracking.
4. **Copywriting**: Bantu buat judul produk, deskripsi SEO pendek, caption IG.

Tools yang tersedia (gunakan kalau dibutuhkan):
- listProducts: Cari produk berdasarkan purpose/qty/city
- getShippingQuotes: Hitung ongkir berdasarkan berat/tujuan

Batasan:
- Jangan buat klaim medis/kimia definitif
- Selalu jelaskan ini estimasi berbasis heuristik
- Kalau ada pertanyaan di luar scope, arahkan ke customer service

Contoh response untuk rekomendasi:

"Nih 3 pilihan ampas kopi terbaik buat kompos di Banda Aceh:

| Produk | Harga | Stok | Kecocokan | Kirim |
|--------|--------|------|-----------|-------|
| Arabika Premium | Rp 25-30k/kg | 500kg | 95% | 2-3 hari |
| Robusta Organik | Rp 20-25k/kg | 300kg | 90% | 3-4 hari |
| Mix Grade A | Rp 22-28k/kg | 150kg | 88% | 2-4 hari |

Arabika Premium paling cocok karena keasaman alami yang bagus buat kompos. Mau lanjut order yang mana?"

Selalu tutup dengan pertanyaan atau CTA yang engaging.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = ZChatRequest.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input format', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { messages, toolsEnabled = false } = validationResult.data
    const startTime = performance.now()

    // Prepare messages with system prompt
    const systemMessage: ChatMessage = {
      role: "system",
      content: SIKUPIBOT_SYSTEM_PROMPT
    }

    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages
    ].map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // Prepare tools if enabled
    const tools: OpenAI.Chat.ChatCompletionTool[] | undefined = toolsEnabled ? [
      {
        type: "function",
        function: {
          name: "listProducts",
          description: "Search for coffee grounds products based on purpose, quantity, and location",
          parameters: {
            type: "object",
            properties: {
              purpose: {
                type: "string",
                description: "Intended use: kompos, briket, scrub, etc.",
                enum: ["kompos", "briket", "scrub", "pulp", "pupuk", "pakan_ternak", "general"]
              },
              qty_kg: {
                type: "number",
                description: "Desired quantity in kg"
              },
              city: {
                type: "string",
                description: "Destination city for shipping calculation"
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getShippingQuotes",
          description: "Get shipping cost estimates for coffee grounds",
          parameters: {
            type: "object",
            properties: {
              weight_kg: {
                type: "number",
                description: "Total weight in kg",
                minimum: 1
              },
              origin: {
                type: "string",
                description: "Origin city (default: Jakarta)"
              },
              destination: {
                type: "string",
                description: "Destination city"
              }
            },
            required: ["weight_kg", "destination"]
          }
        }
      }
    ] : undefined

    console.log(`[SiKupiBot] Processing chat with ${messages.length} messages, tools: ${toolsEnabled}`)

    // Call OpenAI
    const response = await createChatCompletion({
      messages: conversationMessages,
      ...(tools && tools.length > 0 && { tools }),
      ...(toolsEnabled && { tool_choice: "auto" as const }),
      temperature: 0.7, // Slightly creative for friendly responses
      max_tokens: 1000
    })

    const latency_ms = Math.round(performance.now() - startTime)
    const choice = response.choices[0]
    
    if (!choice?.message) {
      throw new Error('No message in OpenAI response')
    }

    let finalReply = choice.message.content || ''
    const usedTools: string[] = []

    // Handle tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      console.log(`[SiKupiBot] Processing ${choice.message.tool_calls.length} tool calls`)
      
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== 'function') continue
        const { name, arguments: argsStr } = toolCall.function
        usedTools.push(name)
        
        try {
          const args = JSON.parse(argsStr)
          let toolResult: any
          
          if (name === 'listProducts') {
            toolResult = await mockTools.listProducts(args)
          } else if (name === 'getShippingQuotes') {
            toolResult = await mockTools.getShippingQuotes(args)
          }
          
          // Create follow-up message to integrate tool results
          const followUpMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            ...conversationMessages,
            choice.message as OpenAI.Chat.ChatCompletionAssistantMessageParam,
            {
              role: "tool",
              content: JSON.stringify(toolResult),
              tool_call_id: toolCall.id
            }
          ]
          
          // Get final response with tool results
          const followUpResponse = await createChatCompletion({
            messages: followUpMessages,
            temperature: 0.7,
            max_tokens: 1000
          })
          
          finalReply = followUpResponse.choices[0]?.message?.content || finalReply
          
        } catch (toolError) {
          console.error(`[SiKupiBot] Tool ${name} failed:`, toolError)
          finalReply += `\n\n*Maaf, ada error saat mengakses data ${name}. Coba tanya lagi ya!*`
        }
      }
    }

    const chatResponse: ChatResponse = {
      reply: finalReply,
      usedTools: usedTools.length > 0 ? usedTools : undefined,
      meta: {
        model: response.model,
        latency_ms
      }
    }

    // Validate response
    const validatedResponse = ZChatResponse.parse(chatResponse)
    
    console.log(`[SiKupiBot] Success - ${response.model} (${latency_ms}ms) - Tools: ${usedTools.join(', ') || 'none'}`)

    return NextResponse.json({
      success: true,
      data: validatedResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[SiKupiBot] Error:', error)
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request' },
        { status: 400 }
      )
    }

    // OpenAI API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message?: string }
      return NextResponse.json(
        { 
          error: 'AI service error', 
          message: apiError.message || 'Unknown API error' 
        },
        { status: 502 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Chat failed',
        message: 'Maaf, SiKupiBot lagi ada masalah. Coba lagi ya!' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}