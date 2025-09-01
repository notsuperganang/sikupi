import { supabaseAdmin } from '@/lib/supabase'

export async function uploadImageToStorage(
  file: File,
  bucket: string = 'magazine',
  folder: string = 'articles'
): Promise<{ url: string; path: string }> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  
  // Upload file to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return {
    url: urlData.publicUrl,
    path: fileName
  }
}

export async function deleteImageFromStorage(
  path: string,
  bucket: string = 'magazine'
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Storage delete error:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
