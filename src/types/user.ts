// User Types

export interface Address {
    id: string;
    userId: string;
    contactNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    pincode?: string;
    country: "India";
    type: 'home' | 'office' | 'other';
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    id: string;
    email: string;
    phone?: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    addresses?: Address[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
    expiresIn: number;
}

export interface AdminAuthResponse {
    accessToken: string;
    tokenType?: string;
}

export interface LoginCredentials {
    email?: string;
    password: string;
}



export interface SignupData {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
}

export interface OTPLoginData {
    phone: string;
    otp: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UpdateProfileData {
    fullName?: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    avatar?: string;
}
export interface UserProfile {
    id: string;
    email: string;
    phone?: string;
    fullName?: string;
}
export interface UserProfileResponse {
    data: UserProfile;
    success: boolean;
    status: number;
    message: string;
}
export interface AdminUserAnalyticsResponse {
    totalUsers: number;
    activeUsers: number;
    inActiveUsers: number;
    blockeUsers: number;
    newToday: number;
    newThisMonth: number;
}

export interface UserDetailResponse {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface UpdateUserStatusRequest {
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
