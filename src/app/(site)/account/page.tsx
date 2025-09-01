'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ProfileData {
  id: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
  updated_at: string
}

interface UserData {
  email: string
  email_verified: boolean
  last_sign_in: string | null
}

export default function AccountPage() {
  const router = useRouter()
  const { user, session, loading: authLoading, signOut } = useAuth()
  
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // Fetch profile data
  const fetchProfile = async () => {
    console.log('🔍 [ACCOUNT] Starting fetchProfile...')
    setLoading(true)
    
    try {
      if (!session?.access_token) {
        console.log('❌ [ACCOUNT] No access token available')
        throw new Error('No access token')
      }

      console.log('📡 [ACCOUNT] Making API request...')
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 [ACCOUNT] API response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      console.log('📡 [ACCOUNT] API response data:', data)
      
      if (data.success) {
        setProfile(data.data.profile)
        setUserData(data.data.user)
        setFullName(data.data.profile.full_name || '')
        setPhone(data.data.profile.phone || '')
        console.log('✅ [ACCOUNT] Profile loaded successfully')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('❌ [ACCOUNT] Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Gagal memuat data profil' })
    } finally {
      console.log('🏁 [ACCOUNT] Setting loading to false')
      setLoading(false)
    }
  }

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (!session?.access_token) {
        throw new Error('No access token')
      }

      const updateData: any = {}
      if (fullName.trim() !== profile?.full_name) {
        updateData.full_name = fullName.trim()
      }
      if (phone.trim() !== profile?.phone) {
        updateData.phone = phone.trim() || null
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'Tidak ada perubahan untuk disimpan' })
        setSaving(false)
        return
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      if (data.success) {
        setProfile(data.data.profile)
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Gagal memperbarui profil' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    console.log('🔄 [ACCOUNT] useEffect triggered:', {
      authLoading,
      hasUser: !!user,
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      loading,
      userEmail: user?.email
    })

    if (!authLoading && !user) {
      console.log('➡️ [ACCOUNT] Redirecting to login - no user')
      router.push('/login')
      return
    }
    
    if (user && session?.access_token && loading) {
      console.log('🚀 [ACCOUNT] Calling fetchProfile...')
      fetchProfile()
    }
  }, [user, session?.access_token, authLoading, loading])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-red-100 text-red-800' }
      case 'buyer':
        return { label: 'Pembeli', color: 'bg-green-100 text-green-800' }
      default:
        return { label: role, color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="text-gray-600">Memuat profil...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
            <p className="text-gray-600 mb-6">Anda harus login untuk mengakses halaman ini.</p>
            <Button onClick={() => router.push('/login')} className="bg-amber-600 hover:bg-amber-700">
              Login Sekarang
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const roleDisplay = getRoleDisplay(profile.role)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
          <p className="text-gray-600">Kelola informasi profil dan pengaturan akun Anda</p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-xl">{profile.full_name || 'Nama Belum Diatur'}</CardTitle>
                <Badge variant="secondary" className={roleDisplay.color}>
                  <Shield className="w-3 h-3 mr-1" />
                  {roleDisplay.label}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{userData?.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Bergabung {formatDate(profile.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Nama Lengkap</Label>
                      <Input
                        id="full_name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData?.email || ''}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email tidak dapat diubah. Hubungi support jika diperlukan.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFullName(profile.full_name || '')
                        setPhone(profile.phone || '')
                        setMessage(null)
                      }}
                    >
                      Reset
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Zona Bahaya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Keluar dari Akun</h3>
                <p className="text-sm text-gray-600">Anda akan perlu login kembali untuk mengakses akun.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  signOut()
                  router.push('/')
                }}
              >
                Keluar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
