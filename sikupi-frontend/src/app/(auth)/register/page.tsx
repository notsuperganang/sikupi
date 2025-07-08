'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, Building, MapPin, Coffee, ArrowRight, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FloatingAnimations from '@/components/ui/FloatingAnimations';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterCredentials, UserType } from '@/types';
import { AuthValidation } from '@/lib/auth';
import { USER_TYPES } from '@/lib/constants';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>('buyer');
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterCredentials>({
    defaultValues: {
      user_type: 'buyer',
    },
  });

  const watchPassword = watch('password');

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const userData = {
        ...data,
        user_type: selectedUserType,
      };
      await registerUser(userData);
      // Navigation is handled in the register function
    } catch (error: any) {
      // Handle registration errors
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || '';
        if (message.includes('email')) {
          setError('email', { message: 'This email is already registered' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-secondary-50 to-primary-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30"></div>
      
      {/* Floating Coffee Beans Animation */}
      <FloatingAnimations count={8} icons={['☕', '🌱', '♻️']} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-coffee rounded-full mb-4 shadow-large"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Coffee className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Join Sikupi</h1>
          <p className="text-neutral-600">Start your sustainable coffee waste journey</p>
        </motion.div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card variant="elevated" className="backdrop-blur-sm bg-white/95">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-neutral-900">Create Account</CardTitle>
              <CardDescription>
                Join thousands making coffee waste valuable
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* User Type Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    I want to
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {USER_TYPES.map((type) => (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedUserType(type.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedUserType === type.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs mt-1 opacity-80">{type.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Your full name"
                      leftIcon={<User />}
                      error={errors.full_name?.message}
                      {...register('full_name', {
                        required: 'Full name is required',
                        validate: (value) => AuthValidation.validateFullName(value),
                      })}
                    />
                    <Input
                      label="Phone"
                      placeholder="Your phone number"
                      leftIcon={<Phone />}
                      error={errors.phone?.message}
                      {...register('phone', {
                        validate: (value) => !value || AuthValidation.validatePhone(value) === true,
                      })}
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    leftIcon={<Mail />}
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => AuthValidation.validateEmail(value),
                    })}
                  />
                </motion.div>

                {/* Business Information (for sellers) */}
                {selectedUserType === 'seller' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Business Name"
                      placeholder="Your cafe or business name"
                      leftIcon={<Building />}
                      error={errors.business_name?.message}
                      {...register('business_name', {
                        required: selectedUserType === 'seller' ? 'Business name is required for sellers' : false,
                      })}
                    />
                    <Input
                      label="Location"
                      placeholder="City, Province"
                      leftIcon={<MapPin />}
                      error={errors.city?.message}
                      {...register('city')}
                    />
                  </motion.div>
                )}

                {/* Password */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    leftIcon={<Lock />}
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      validate: (value) => AuthValidation.validatePassword(value),
                    })}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    leftIcon={<Lock />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => AuthValidation.validatePasswordConfirmation(watchPassword || '', value || ''),
                    })}
                  />
                </motion.div>

                {/* Terms and Conditions */}
                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions',
                    })}
                  />
                  <label htmlFor="terms" className="text-sm text-neutral-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </Link>
                  </label>
                </motion.div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-error-600 mt-1">{errors.agreeToTerms.message}</p>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    icon={<UserCheck />}
                    iconPosition="right"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                className="relative my-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">Already have an account?</span>
                </div>
              </motion.div>

              {/* Login Link */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <p className="text-sm text-neutral-600">
                  Welcome back!{' '}
                  <Link
                    href="/login"
                    className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Environmental Impact Message */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p className="text-sm text-neutral-600 flex items-center justify-center">
            <span className="mr-2">🌱</span>
            Be part of the solution to coffee waste problem
          </p>
        </motion.div>
      </div>
    </div>
  );
}