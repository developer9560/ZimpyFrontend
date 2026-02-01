// Re-export all types
export * from './product';
export * from './user';
export * from './order';
export * from './cart';
export * from './attribute';

// Common Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    status?: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    pageable: any;
    last: boolean;
    totalPages: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    errors?: Record<string, string[]>;
}

// UI State Types
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

// Form Types
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

// Search Types
export interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'brand';
    image?: string;
}

// Location Types
export interface DeliveryLocation {
    pincode: string;
    city: string;
    state: string;
    isServiceable: boolean;
}
