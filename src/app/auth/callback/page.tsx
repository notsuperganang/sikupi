'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Gagal memproses autentikasi')
          setStatus('error')
          return
        }

        if (data.session) {
          setStatus('success')
          // Redirect to home page after successful authentication
          setTimeout(() => {
            router.push('/')
          }, 1500)
        } else {
          setError('Sesi tidak ditemukan')
          setStatus('error')
        }
      } catch (err) {
        console.error('Callback processing error:', err)
        setError('Terjadi kesalahan tidak terduga')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [router])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Gagal Masuk</CardTitle>
            <CardDescription className="text-center">
              {error || 'Terjadi kesalahan saat memproses login Google'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              <a 
                href="/auth/login" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Kembali ke halaman login
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            {status === 'loading' ? 'Memproses...' : 'Berhasil!'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' 
              ? 'Sedang memproses login Google Anda...'
              : 'Login berhasil! Mengalihkan ke beranda...'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    </div>
  )
}