// Rating utilities for star display and calculations

/**
 * Generate an array of star states for rendering
 * @param rating - Rating value (0-5)
 * @param maxStars - Maximum number of stars (default: 5)
 * @returns Array of star states: 'full', 'half', or 'empty'
 */
export function getStarStates(rating: number, maxStars: number = 5): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = []
  const clampedRating = Math.max(0, Math.min(rating, maxStars))
  
  for (let i = 1; i <= maxStars; i++) {
    if (clampedRating >= i) {
      stars.push('full')
    } else if (clampedRating >= i - 0.5) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }
  
  return stars
}

/**
 * Format rating with one decimal place
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Generate range array for star rendering
 */
export function starRange(count: number = 5): number[] {
  return Array.from({ length: count }, (_, i) => i + 1)
}

/**
 * Calculate average rating from rating breakdown
 */
export function calculateAverageFromBreakdown(breakdown: Record<number, number>): number {
  const totalRatings = Object.values(breakdown).reduce((sum, count) => sum + count, 0)
  if (totalRatings === 0) return 0
  
  const weightedSum = Object.entries(breakdown).reduce((sum, [rating, count]) => {
    return sum + (parseInt(rating) * count)
  }, 0)
  
  return weightedSum / totalRatings
}

/**
 * Get rating text in Indonesian
 */
export function getRatingText(rating: number): string {
  if (rating === 0) return 'Belum ada rating'
  if (rating < 2) return 'Sangat Buruk'
  if (rating < 3) return 'Buruk'
  if (rating < 4) return 'Cukup'
  if (rating < 5) return 'Baik'
  return 'Sangat Baik'
}