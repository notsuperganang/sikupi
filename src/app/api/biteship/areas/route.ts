import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { biteship } from '@/lib/biteship'

// Request validation schema
const AreasRequestSchema = z.object({
  search: z.string().min(1).max(100),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const validatedData = AreasRequestSchema.parse({ search })

    // Get areas from Biteship Maps API
    const areasResponse = await biteship.getAreas(validatedData.search)

    if (!areasResponse.success) {
      console.error('Biteship areas error:', areasResponse.message)
      return NextResponse.json(
        { error: 'Failed to get areas', details: areasResponse.message },
        { status: 500 }
      )
    }

    // Format response for frontend
    const formattedAreas = areasResponse.areas.map(area => ({
      id: area.id,
      name: area.name,
      type: area.type,
      postal_code: area.postal_code,
      city: area.administrative_division_level_2_name,
      province: area.administrative_division_level_1_name,
      country: area.country_name,
      full_name: `${area.name}, ${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name}`,
    }))

    return NextResponse.json({
      success: true,
      data: {
        areas: formattedAreas,
        total: formattedAreas.length,
      }
    })

  } catch (error) {
    console.error('Areas API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}