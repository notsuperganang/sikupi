// FILE PATH: /src/lib/types/auth.ts

// User types and interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: "seller" | "buyer" | "admin";
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessName?: string;
  businessType?: string;
  avatarUrl?: string;
  isVerified: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: "seller" | "buyer" | "admin";
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessName?: string;
  businessType?: string;
  avatarUrl?: string;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  rating?: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// Auth request/response types
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
  userType: "seller" | "buyer";
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

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessName?: string;
  businessType?: string;
  // Support all user types including admin
  userType?: "seller" | "buyer" | "admin";
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  message: string;
}

export interface UploadProfileImageRequest {
  image: File;
}

export interface UploadProfileImageResponse {
  success: boolean;
  avatarUrl: string;
  message: string;
}

// Verification types
export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

// Helper function to map backend user data to frontend format
export function mapUserFromBackend(backendUser: any): User {
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

// Helper function to map frontend register data to backend format
export function mapRegisterDataToBackend(data: RegisterRequest) {
  const baseData = {
    email: data.email,
    password: data.password,
    full_name: data.fullName,
    phone: data.phone,
    user_type: data.userType,
    address: data.address,
    city: data.city,
    province: data.province,
    postal_code: data.postalCode,
  };

  // Only add business fields for sellers
  if (data.userType === 'seller') {
    return {
      ...baseData,
      business_name: data.businessName || '',
      business_type: data.businessType || '',
    };
  }

  return baseData;
}

// Helper function to map frontend update profile data to backend format
export function mapUpdateProfileToBackend(data: UpdateProfileRequest) {
  const backendData: Record<string, any> = {};
  
  if (data.fullName !== undefined) backendData.full_name = data.fullName;
  if (data.phone !== undefined) backendData.phone = data.phone;
  if (data.address !== undefined) backendData.address = data.address;
  if (data.city !== undefined) backendData.city = data.city;
  if (data.province !== undefined) backendData.province = data.province;
  if (data.postalCode !== undefined) backendData.postal_code = data.postalCode;
  
  // Only include business fields for sellers
  if (data.userType === 'seller') {
    if (data.businessName !== undefined) backendData.business_name = data.businessName;
    if (data.businessType !== undefined) backendData.business_type = data.businessType;
  }
  
  return backendData;
}