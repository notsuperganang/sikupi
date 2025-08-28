'use client'

import { useState } from 'react'
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
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleRoleBasedRedirect = () => {
    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(data.email, data.password)
      handleRoleBasedRedirect()
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat masuk')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      await signInWithGoogle()
    } catch (error: any) {
      setIsGoogleLoading(false)
      setError(error.message || 'Terjadi kesalahan saat masuk dengan Google')
    }
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
                  Selamat Datang Kembali
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Masuk ke akun Anda untuk melanjutkan petualangan di Sikupi
                </p>
              </motion.div>

              {/* Google Sign In Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full mb-6 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group rounded-lg h-12 font-medium disabled:opacity-50"
                  >
                    <IconBrandGoogle className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
                    <span>{isGoogleLoading ? 'Memproses...' : 'Masuk dengan Google'}</span>
                  </button>
                </motion.div>
              </motion.div>

              {/* Divider */}
              <motion.div 
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="flex-grow h-px bg-neutral-300 dark:bg-neutral-700"></div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Atau masuk dengan</span>
                <div className="flex-grow h-px bg-neutral-300 dark:bg-neutral-700"></div>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
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
                  transition={{ delay: 0.85, duration: 0.5 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Password
                  </Label>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password Anda"
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
                </motion.div>

                {/* Remember me & Forgot password */}
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                      Ingat saya
                    </label>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </motion.div>
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
                      className="w-full bg-gradient-to-br from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 dark:from-amber-600 dark:to-orange-600 text-white font-medium h-12 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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
                        "Masuk"
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              </form>

              {/* Register link */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Belum punya akun?{' '}
                  <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                    <Link
                      href="/register"
                      className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    >
                      Daftar sekarang
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