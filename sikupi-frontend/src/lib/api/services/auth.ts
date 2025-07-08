import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User } from '@/stores/auth-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
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
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
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
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const authService = {
  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: User }> => {
    return api.get<{ user: User }>(API_ENDPOINTS.AUTH.PROFILE);
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    return api.put<UpdateProfileResponse>(API_ENDPOINTS.AUTH.PROFILE, data);
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return api.put<ChangePasswordResponse>(`${API_ENDPOINTS.AUTH.PROFILE}/password`, data);
  },

  // Refresh access token
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return api.post<RefreshTokenResponse>('/api/auth/refresh', data);
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/resend-verification', { email });
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/reset-password', { 
      token, 
      newPassword 
    });
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    return api.post<{ avatarUrl: string; message: string }>(
      '/api/auth/upload-avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Delete avatar
  deleteAvatar: async (): Promise<{ message: string }> => {
    return api.delete<{ message: string }>('/api/auth/avatar');
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    rating: number;
    reviewCount: number;
  }> => {
    return api.get<{
      totalSales: number;
      totalOrders: number;
      totalProducts: number;
      rating: number;
      reviewCount: number;
    }>('/api/users/stats');
  },
};