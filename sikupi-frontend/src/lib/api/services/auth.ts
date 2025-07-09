// FILE PATH: /sikupi-frontend/src/lib/api/services/auth.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User } from '@/stores/auth-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  userType: 'seller' | 'buyer';
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessName?: string;
  businessType?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

// Helper function to map frontend fields to backend fields
function mapRegisterDataToBackend(data: RegisterRequest) {
  const baseData = {
    email: data.email,
    password: data.password,
    full_name: data.fullName,        // Map fullName to full_name
    phone: data.phone,
    user_type: data.userType,        // Map userType to user_type
    address: data.address,
    city: data.city,
    province: data.province,
    postal_code: data.postalCode,    // Map postalCode to postal_code
  };

  // Only add business fields for sellers
  if (data.userType === 'seller') {
    return {
      ...baseData,
      business_name: data.businessName || '', // Map businessName to business_name
      business_type: data.businessType || '', // Map businessType to business_type
    };
  }

  return baseData;
}

// Helper function to map backend user data to frontend format
function mapUserFromBackend(backendUser: any): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    fullName: backendUser.full_name || backendUser.fullName,
    phone: backendUser.phone,
    userType: backendUser.user_type || backendUser.userType,
    address: backendUser.address,
    city: backendUser.city,
    province: backendUser.province,
    postalCode: backendUser.postal_code || backendUser.postalCode,
    businessName: backendUser.business_name || backendUser.businessName,
    businessType: backendUser.business_type || backendUser.businessType,
    avatarUrl: backendUser.avatar_url || backendUser.avatarUrl,
    isVerified: backendUser.is_verified || backendUser.isVerified || false,
    emailVerified: backendUser.email_verified || backendUser.emailVerified || false,
    phoneVerified: backendUser.phone_verified || backendUser.phoneVerified || false,
    rating: backendUser.rating,
    totalReviews: backendUser.total_reviews || backendUser.totalReviews || 0,
    createdAt: backendUser.created_at || backendUser.createdAt,
    updatedAt: backendUser.updated_at || backendUser.updatedAt,
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  message: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessName?: string;
  businessType?: string;
  userType?: 'seller' | 'buyer'; // Add userType to determine if business fields should be sent
}

export interface UpdateProfileResponse {
  success: boolean;
  user: User;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Auth service implementation
export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Validate response structure
      if (!response.user || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Map user data from backend format
      const mappedUser = mapUserFromBackend(response.user);
      
      return {
        success: true,
        user: mappedUser,
        token: response.token,
        refreshToken: response.refreshToken,
        message: response.message || 'Login successful',
      };
    } catch (error: any) {
      // Handle specific error cases
      if (error.status === 401) {
        throw new Error('Email atau password salah');
      } else if (error.status === 422) {
        throw new Error('Data yang dimasukkan tidak valid');
      } else if (error.status === 429) {
        throw new Error('Terlalu banyak percobaan login. Coba lagi nanti.');
      }
      
      throw new Error(error.message || 'Login gagal. Silakan coba lagi.');
    }
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      // Map frontend data to backend format
      const backendData = mapRegisterDataToBackend(userData);
      
      console.log('Frontend data:', userData); // Debug log
      console.log('Mapped backend data:', backendData); // Debug log
      
      const response = await api.post<any>(API_ENDPOINTS.AUTH.REGISTER, backendData);
      
      console.log('Backend response:', response); // Debug log
      
      // Validate response structure
      if (!response.user || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Map user data from backend format
      const mappedUser = mapUserFromBackend(response.user);
      
      return {
        success: true,
        user: mappedUser,
        token: response.token,
        refreshToken: response.refreshToken,
        message: response.message || 'Registration successful',
      };
    } catch (error: any) {
      console.error('Registration error details:', {
        status: error.status,
        message: error.message,
        originalError: error
      }); // Enhanced debug log
      
      // Handle specific error cases
      if (error.status === 409) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
      } else if (error.status === 422 || error.status === 400) {
        // Extract specific field errors from backend response
        const errorMessage = error.message || 'Data yang dimasukkan tidak valid';
        throw new Error(errorMessage);
      }
      
      throw new Error(error.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get<{ user: any }>(API_ENDPOINTS.AUTH.PROFILE);
      
      if (!response.user) {
        throw new Error('Invalid profile data received');
      }
      
      // Map user data from backend format
      const mappedUser = mapUserFromBackend(response.user);
      
      return { user: mappedUser };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(error.message || 'Failed to load profile');
    }
  },

  // Update user profile
  updateProfile: async (userData: UpdateProfileRequest & { userType?: 'seller' | 'buyer' }): Promise<UpdateProfileResponse> => {
    try {
      // Map frontend data to backend format for update
      const baseData = {
        full_name: userData.fullName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        province: userData.province,
        postal_code: userData.postalCode,
      };

      // Only add business fields for sellers
      const backendData = userData.userType === 'seller' ? {
        ...baseData,
        business_name: userData.businessName,
        business_type: userData.businessType,
      } : baseData;
      
      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(backendData).filter(([_, v]) => v !== undefined)
      );
      
      const response = await api.put<any>(API_ENDPOINTS.AUTH.PROFILE, cleanedData);
      
      if (!response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Map user data from backend format
      const mappedUser = mapUserFromBackend(response.user);
      
      return {
        success: true,
        user: mappedUser,
        message: response.message || 'Profile updated successfully',
      };
    } catch (error: any) {
      if (error.status === 422) {
        throw new Error('Data yang dimasukkan tidak valid');
      }
      
      throw new Error(error.message || 'Update profil gagal');
    }
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    try {
      const response = await api.post<any>('/api/auth/change-password', passwordData);
      return {
        success: true,
        message: response.message || 'Password changed successfully',
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Password saat ini salah');
      } else if (error.status === 422) {
        throw new Error('Password baru tidak memenuhi kriteria');
      }
      
      throw new Error(error.message || 'Gagal mengubah password');
    }
  },

  // Refresh token
  refreshToken: async (refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.post<any>('/api/auth/refresh', refreshData);
      
      if (!response.token) {
        throw new Error('Invalid refresh response');
      }
      
      return {
        success: true,
        token: response.token,
        refreshToken: response.refreshToken,
        message: response.message || 'Token refreshed successfully',
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Refresh token expired');
      }
      
      throw new Error(error.message || 'Token refresh failed');
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.warn('Logout API call failed:', error);
    }
  },

  // Forgot password
  forgotPassword: async (emailData: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post<any>('/api/auth/forgot-password', emailData);
      return {
        success: true,
        message: response.message || 'Reset email sent successfully',
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Email tidak ditemukan dalam sistem');
      } else if (error.status === 429) {
        throw new Error('Terlalu banyak permintaan reset password. Coba lagi nanti.');
      }
      
      throw new Error(error.message || 'Gagal mengirim email reset password');
    }
  },

  // Reset password
  resetPassword: async (resetData: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    try {
      const response = await api.post<any>('/api/auth/reset-password', resetData);
      return {
        success: true,
        message: response.message || 'Password reset successfully',
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Token reset password tidak valid atau sudah kadaluarsa');
      } else if (error.status === 422) {
        throw new Error('Password baru tidak memenuhi kriteria');
      }
      
      throw new Error(error.message || 'Gagal reset password');
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<any>('/api/auth/verify-email', { token });
      return {
        success: true,
        message: response.message || 'Email verified successfully',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  },

  // Resend email verification
  resendVerification: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<any>('/api/auth/resend-verification');
      return {
        success: true,
        message: response.message || 'Verification email sent',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  },

  // Check if email exists (for registration validation)
  checkEmailExists: async (email: string): Promise<{ exists: boolean }> => {
    try {
      const response = await api.post<{ exists: boolean }>('/api/auth/check-email', { email });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check email');
    }
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<{ avatarUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post<{ avatarUrl: string }>('/api/uploads/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload profile image');
    }
  },
};

// Export individual functions for convenience
export const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  checkEmailExists,
  uploadProfileImage,
} = authService;