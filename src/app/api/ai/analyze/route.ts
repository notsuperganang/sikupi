import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createStructuredCompletion, fileToDataURL, imageUrlToDataURL } from '@/lib/openai'
import { ZAmpasAnalysis, AmpasAnalysisSchema, type AmpasAnalysis } from '@/lib/schemas/analyzer'
import { nanoid } from 'nanoid'

// Input validation schema
const AnalyzeInputSchema = z.object({
  jenis_kopi: z.enum(["arabika", "robusta", "mix", "unknown"]).default("unknown"),
  grind_level: z.enum(["halus", "sedang", "kasar", "unknown"]).default("unknown"),
  condition: z.enum(["basah", "kering", "unknown"]).default("unknown"),
  image_url: z.string().url().optional().or(z.literal('').optional())
}).transform(data => ({
  ...data,
  image_url: data.image_url === '' ? undefined : data.image_url
}))

const ANALYZER_SYSTEM_PROMPT = `You are *Sikupi Ampas Analyzer*, an AI specialist for analyzing coffee grounds (ampas kopi).

You will receive:
1. An image of coffee grounds
2. Metadata: jenis_kopi, grind_level, condition

Your task:
- Analyze the visual characteristics of the coffee grounds
- Estimate market value based on quality indicators
- Assess suitability for various applications (briket, pulp, scrub, pupuk, pakan_ternak)
- Provide processing recommendations and eco-impact scores
- Generate engaging UI copy for the marketplace

Important guidelines:
- Use heuristic visual assessment only - avoid definitive lab claims
- Keep "why" explanations under 25 words each
- If image quality is poor, note it and adjust confidence scores
- Base price estimates on Indonesian coffee grounds market (IDR)
- Consider regional demand and processing difficulty
- Red flags should highlight genuine quality concerns
- Eco scores should reflect realistic environmental impact

Output ONLY valid JSON that strictly matches the provided schema.`

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let imageDataURL: string | null = null
    let formData: Record<string, string> = {}

    // Handle multipart/form-data or JSON
    if (contentType.includes('multipart/form-data')) {
      const data = await request.formData()
      
      // Extract form fields
      formData = {
        jenis_kopi: data.get('jenis_kopi')?.toString() || 'unknown',
        grind_level: data.get('grind_level')?.toString() || 'unknown',
        condition: data.get('condition')?.toString() || 'unknown',
        image_url: data.get('image_url')?.toString() || ''
      }

      // Handle file upload
      const imageFile = data.get('image') as File
      if (imageFile && imageFile.size > 0) {
        // Validate file type and size - only accept JPG/JPEG and PNG
        const fileName = imageFile.name.toLowerCase()
        const validExtensions = ['.jpg', '.jpeg', '.png']
        const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
        const hasValidMimeType = validMimeTypes.includes(imageFile.type)
        
        if (!hasValidExtension && !hasValidMimeType) {
          return NextResponse.json(
            { error: 'File must be a JPEG or PNG image' },
            { status: 400 }
          )
        }
        
        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
          return NextResponse.json(
            { error: 'Image size must be less than 10MB' },
            { status: 400 }
          )
        }

        imageDataURL = await fileToDataURL(imageFile)
      }
    } else {
      // Handle JSON input
      const body = await request.json()
      formData = body
    }

    // If no file uploaded, try image_url
    if (!imageDataURL && formData.image_url) {
      try {
        imageDataURL = await imageUrlToDataURL(formData.image_url)
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to process image URL' },
          { status: 400 }
        )
      }
    }

    // Validate we have an image
    if (!imageDataURL) {
      return NextResponse.json(
        { error: 'Either image file or image_url is required' },
        { status: 400 }
      )
    }

    // Validate input data
    const validationResult = AnalyzeInputSchema.safeParse(formData)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input parameters', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { jenis_kopi, grind_level, condition } = validationResult.data

    // Prepare OpenAI messages
    const messages = [
      {
        role: "system" as const,
        content: ANALYZER_SYSTEM_PROMPT
      },
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: `Analyze this coffee grounds image.

Metadata:
- Jenis kopi: ${jenis_kopi}
- Grind level: ${grind_level}  
- Condition: ${condition}

Provide complete analysis following the JSON schema.`
          },
          {
            type: "image_url" as const,
            image_url: {
              url: imageDataURL,
              detail: "high" as const
            }
          }
        ]
      }
    ]

    console.log(`[Analyzer] Starting analysis for ${jenis_kopi} coffee grounds`)
    
    // Call OpenAI with structured output
    const { data: analysisData, model, latency_ms } = await createStructuredCompletion<AmpasAnalysis>(
      messages,
      AmpasAnalysisSchema
    )

    // Add generated analysis ID and update meta
    const analysis: AmpasAnalysis = {
      ...analysisData,
      analysis_id: nanoid(),
      input: { jenis_kopi, grind_level, condition },
      meta: {
        ...analysisData.meta,
        model,
        latency_ms
      }
    }

    // Final validation with Zod
    const validatedAnalysis = ZAmpasAnalysis.parse(analysis)
    
    console.log(`[Analyzer] Success - ${model} (${latency_ms}ms) - Score: ${validatedAnalysis.eco.sikupi_score}`)

    return NextResponse.json({
      success: true,
      data: validatedAnalysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Analyzer] Error:', error)
    
    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Analysis validation failed', 
          details: error.errors 
        },
        { status: 422 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in analysis response' },
        { status: 502 }
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
      { error: 'Analysis failed' },
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