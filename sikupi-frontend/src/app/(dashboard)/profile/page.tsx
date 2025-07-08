'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Lock, 
  Camera, 
  Save,
  Shield,
  Star,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserType } from '@/types';
import { AuthValidation } from '@/lib/auth';

function ProfilePage() {
  const { user, updateUser, changePassword, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<Partial<UserType>>({
    defaultValues: user || {},
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<{
    current_password: string;
    new_password: string;
    confirm_password: string;
  }>();

  const watchNewPassword = watch('new_password');

  const onProfileSubmit = async (data: Partial<UserType>) => {
    try {
      setIsUpdating(true);
      await updateUser(data);
      resetProfile(data);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: { current_password: string; new_password: string }) => {
    try {
      setIsUpdating(true);
      await changePassword(data);
      resetPassword();
    } catch (error) {
      // Error handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Profile Settings</h1>
          <p className="text-neutral-600">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="text-center p-6">
                {/* Profile Picture */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-coffee rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.full_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* User Info */}
                <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                  {user.full_name}
                </h3>
                <p className="text-neutral-600 text-sm mb-3">{user.email}</p>
                
                {/* User Type Badge */}
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                  <Shield className="w-4 h-4 mr-1" />
                  {user.user_type === 'seller' ? 'Seller' : user.user_type === 'buyer' ? 'Buyer' : 'Admin'}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-semibold text-neutral-900">
                        {user.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">Rating</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-4 h-4 text-primary-500 mr-1" />
                      <span className="font-semibold text-neutral-900">
                        {user.total_reviews || 0}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">Reviews</p>
                  </div>
                </div>

                {/* Verification Status */}
                {user.is_verified && (
                  <div className="mt-4 flex items-center justify-center text-green-600 text-sm">
                    <Shield className="w-4 h-4 mr-1" />
                    Verified Account
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Forms */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card variant="elevated">
                <CardHeader className="border-b border-neutral-200">
                  {/* Tabs */}
                  <div className="flex space-x-1">
                    {[
                      { key: 'profile', label: 'Profile Information', icon: User },
                      { key: 'password', label: 'Change Password', icon: Lock },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.key
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <motion.form
                      key="profile-form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleProfileSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <CardTitle>Personal Information</CardTitle>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          leftIcon={<User />}
                          error={profileErrors.full_name?.message}
                          {...registerProfile('full_name', {
                            required: 'Full name is required',
                            validate: (value) => AuthValidation.validateFullName(value || ''),
                          })}
                        />
                        <Input
                          label="Phone Number"
                          leftIcon={<Phone />}
                          error={profileErrors.phone?.message}
                          {...registerProfile('phone', {
                            validate: (value) => !value || AuthValidation.validatePhone(value),
                          })}
                        />
                      </div>

                      <Input
                        label="Email Address"
                        type="email"
                        leftIcon={<Mail />}
                        disabled
                        helperText="Email cannot be changed. Contact support if needed."
                        {...registerProfile('email')}
                      />

                      {user.user_type === 'seller' && (
                        <>
                          <CardTitle className="mt-8">Business Information</CardTitle>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Business Name"
                              leftIcon={<Building />}
                              error={profileErrors.business_name?.message}
                              {...registerProfile('business_name')}
                            />
                            <Input
                              label="City"
                              leftIcon={<MapPin />}
                              error={profileErrors.city?.message}
                              {...registerProfile('city')}
                            />
                          </div>
                          <Input
                            label="Full Address"
                            leftIcon={<MapPin />}
                            error={profileErrors.address?.message}
                            {...registerProfile('address')}
                          />
                        </>
                      )}

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={isUpdating}
                          icon={<Save />}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </motion.form>
                  )}

                  {/* Password Tab */}
                  {activeTab === 'password' && (
                    <motion.form
                      key="password-form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                      className="space-y-6"
                    >
                      <div>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                          Choose a strong password to keep your account secure
                        </CardDescription>
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          leftIcon={<Lock />}
                          error={passwordErrors.current_password?.message}
                          {...registerPassword('current_password', {
                            required: 'Current password is required',
                          })}
                        />
                        <Input
                          label="New Password"
                          type="password"
                          leftIcon={<Lock />}
                          error={passwordErrors.new_password?.message}
                          {...registerPassword('new_password', {
                            required: 'New password is required',
                            validate: (value) => AuthValidation.validatePassword(value),
                          })}
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          leftIcon={<Lock />}
                          error={passwordErrors.confirm_password?.message}
                          {...registerPassword('confirm_password', {
                            required: 'Please confirm your new password',
                            validate: (value) =>
                              AuthValidation.validatePasswordConfirmation(watchNewPassword, value),
                          })}
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={isUpdating}
                          icon={<Lock />}
                        >
                          Update Password
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with protection requiring authentication
export default function ProtectedProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfilePage />
    </ProtectedRoute>
  );
}