import { redirect } from 'next/navigation'

export default async function ErrorPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  // Redirect old error URLs to new payment result page
  const resolvedParams = await searchParams
  const params = new URLSearchParams()
  
  // Transfer all search parameters to the new result page
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      params.set(key, value)
    }
  })
  
  redirect(`/payment/result?${params.toString()}`)
}