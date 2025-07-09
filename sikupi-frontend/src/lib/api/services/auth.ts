// FILE PATH: /src/lib/api/services/auth.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { 
  User,
  UserProfile,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UploadProfileImageRequest,
  UploadProfileImageResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  mapUserFromBackend,
  mapRegisterDataToBackend,
  mapUpdateProfileToBackend
} from '@/lib/types/auth';

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
      
      const response = await api.post<any>(API_ENDPOINTS.AUTH.REGISTER, backendData);
      
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
      if (error.status === 409) {
        throw new Error('Email sudah terdaftar');
      } else if (error.status === 422) {
        throw new Error('Data registrasi tidak valid');
      }
      
      throw new Error(error.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      await api.post<any>(API_ENDPOINTS.AUTH.LOGOUT);
      
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error: any) {
      // Even if logout fails on server, we still consider it successful on client
      console.warn('Logout API error:', error.message);
      return {
        success: true,
        message: 'Logout successful',
      };
    }
  },

  // Get user profile
  getProfile: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.AUTH.PROFILE);
      
      if (!response.user) {
        throw new Error('Invalid response from server');
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

  // Update user profile - now supports admin userType
  updateProfile: async (userData: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    try {
      // Map frontend data to backend format
      const backendData = mapUpdateProfileToBackend(userData);
      
      const response = await api.put<any>(API_ENDPOINTS.AUTH.PROFILE, backendData);
      
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
      const backendData = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      };
      
      const response = await api.post<any>('/api/auth/change-password', backendData);
      
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

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post<any>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      
      return {
        success: true,
        message: response.message || 'Reset password link sent to your email',
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Email tidak ditemukan');
      }
      
      throw new Error(error.message || 'Gagal mengirim email reset password');
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    try {
      const backendData = {
        token: data.token,
        new_password: data.newPassword,
      };
      
      const response = await api.post<any>(API_ENDPOINTS.AUTH.RESET_PASSWORD, backendData);
      
      return {
        success: true,
        message: response.message || 'Password reset successful',
      };
    } catch (error: any) {
      if (error.status === 400) {
        throw new Error('Token reset password tidak valid atau sudah kedaluwarsa');
      }
      
      throw new Error(error.message || 'Gagal reset password');
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
      throw new Error('Session expired. Please login again.');
    }
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<UploadProfileImageResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post<any>('/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        avatarUrl: response.avatarUrl || response.avatar_url,
        message: response.message || 'Profile image uploaded successfully',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload profile image');
    }
  },

  // Verify email
  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    try {
      const response = await api.post<any>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
      
      return {
        success: true,
        message: response.message || 'Email verified successfully',
      };
    } catch (error: any) {
      if (error.status === 400) {
        throw new Error('Token verifikasi tidak valid atau sudah kedaluwarsa');
      }
      
      throw new Error(error.message || 'Gagal verifikasi email');
    }
  },

  // Resend verification email
  resendVerification: async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    try {
      const response = await api.post<any>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data);
      
      return {
        success: true,
        message: response.message || 'Verification email sent successfully',
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Terlalu banyak permintaan. Coba lagi nanti.');
      }
      
      throw new Error(error.message || 'Gagal mengirim email verifikasi');
    }
  },

  // Check authentication status
  checkAuth: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get<any>('/api/auth/me');
      
      if (!response.user) {
        throw new Error('Invalid response from server');
      }
      
      const mappedUser = mapUserFromBackend(response.user);
      
      return { user: mappedUser };
    } catch (error: any) {
      throw new Error('Authentication check failed');
    }
  },
};

// Export service and types
export default authService;
export type {
  User,
  UserProfile,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UploadProfileImageRequest,
  UploadProfileImageResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
};