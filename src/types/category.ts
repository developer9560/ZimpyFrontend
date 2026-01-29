export interface userCategory {
    id: number;
    name: string;
    slug: string;
    level: number;
    imageUrl?: string;
    isActive: boolean;
    priority: number;
}

export interface userCategoryResponse {
    data: userCategory[];
    message: string;
    status: number;
    success: boolean;
}
