'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { IconBrandGoogle } from '@tabler/icons-react'

import { HeroSection } from '@/components/auth/HeroSection'
import { ShineBorder } from '@/components/magicui/shine-border'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Get returnTo from URL params
  const [returnTo, setReturnTo] = useState<string | null>(null)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setReturnTo(urlParams.get('returnTo'))
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const handleRoleBasedRedirect = () => {
    // If there's a return URL, go there regardless of role (unless it's admin-only)
    if (returnTo && returnTo.startsWith('/')) {
      // Prevent redirecting to admin routes for non-admin users
      if (returnTo.startsWith('/admin') && profile?.role !== 'admin') {
        router.push('/')
      } else {
        router.push(returnTo)
      }
    } else if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await signUp(data.email, data.password, {
        full_name: data.full_name,
        phone: data.phone,
      })
      
      setSuccess(true)
      setTimeout(() => {
        handleRoleBasedRedirect()
      }, 1500)
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mendaftar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      await signInWithGoogle(returnTo || undefined)
    } catch (error: any) {
      setIsGoogleLoading(false)
      setError(error.message || 'Terjadi kesalahan saat daftar dengan Google')
    }
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
      >
        <div className="relative rounded-2xl bg-white dark:bg-black">
          <ShineBorder 
            borderWidth={2}
            duration={6}
            shineColor={["#10b981", "#059669", "#047857"]}
            className="rounded-2xl"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Pendaftaran Berhasil!
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Selamat datang di Sikupi! Anda akan dialihkan ke beranda sebentar lagi.
            </p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Hero Section */}
      <motion.div 
        className="hidden lg:block lg:w-1/2 relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HeroSection />
      </motion.div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-stone-50 to-amber-50/30 dark:from-stone-950 dark:to-amber-950/30">
        <motion.div 
          className="w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Form Card */}
          <motion.div 
            className="relative rounded-2xl bg-white dark:bg-black"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            whileHover={{ y: -2, transition: { duration: 0.3 } }}
          >
            <ShineBorder 
              borderWidth={2}
              duration={8}
              shineColor={["#D2691E", "#CD853F", "#8B4513"]}
              className="rounded-2xl"
            />
            <div className="relative p-8">
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="mb-6">
                      <p className="text-sm">{error}</p>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <motion.div 
                className="text-center mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  Bergabung dengan Sikupi
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Daftar sekarang dan mulai menjelajahi dunia ampas kopi berkualitas
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Label htmlFor="full_name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nama Lengkap
                  </Label>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      {...register('full_name')}
                      disabled={isLoading}
                      className="h-12 transition-all duration-300"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.full_name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600"
                      >
                        {errors.full_name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.85, duration: 0.5 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email
                  </Label>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email Anda"
                      {...register('email')}
                      disabled={isLoading}
                      className="h-12 transition-all duration-300"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <Label htmlFor="phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nomor Telepon
                  </Label>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Masukkan nomor telepon Anda"
                      {...register('phone')}
                      disabled={isLoading}
                      className="h-12 transition-all duration-300"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-600"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.95, duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Password
                    </Label>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Buat password"
                        {...register('password')}
                        disabled={isLoading}
                        className="h-12 transition-all duration-300"
                      />
                    </motion.div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-sm text-red-600"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Konfirmasi Password
                    </Label>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Konfirmasi password"
                        {...register('confirmPassword')}
                        disabled={isLoading}
                        className="h-12 transition-all duration-300"
                      />
                    </motion.div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-sm text-red-600"
                        >
                          {errors.confirmPassword.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 dark:from-amber-600 dark:to-orange-600 text-white font-medium h-12 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <motion.svg
                            className="w-5 h-5 mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </motion.svg>
                          Loading...
                        </div>
                      ) : (
                        "Daftar Sekarang"
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              </form>

              {/* Login link */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Sudah punya akun?{' '}
                  <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                    <Link
                      href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login'}
                      className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    >
                      Masuk sekarang
                    </Link>
                  </motion.span>
                </p>
              </motion.div>

              {/* Back to home */}
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                  <Link 
                    href="/" 
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke halaman utama
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};