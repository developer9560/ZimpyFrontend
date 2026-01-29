// Banner Types

export enum BannerPlacement {
    HOME_TOP = 'HOME_TOP',
    HOME_MIDDLE = 'HOME_MIDDLE',
    CATEGORY = 'CATEGORY',
    PRODUCT = 'PRODUCT',
    PROMOTION = 'PROMOTION',
}

export enum BannerStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    INACTIVE = 'INACTIVE',
}

export interface BannerCreateRequest {
    title: string;
    link: string;
    placement: BannerPlacement;
    status?: BannerStatus;
    priority: number;
    startDate?: string;
    endDate?: string;
    showDays?: string; // CSV: "MON,WED,FRI"
}

export interface BannerUpdateRequest {
    title?: string;
    link?: string;
    placement?: BannerPlacement;
    status?: BannerStatus;
    priority?: number;
    startDate?: string;
    endDate?: string;
    showDays?: string;
}

export interface BannerAdminResponse {
    id: number;
    mobileUrl: string | null;
    tabletUrl: string | null;
    desktopUrl: string | null;
    title: string;
    link: string;
    placement: BannerPlacement;
    status: BannerStatus;
    priority: number;
    totalClicked: number;
    startDate: string | null;
    endDate: string | null;
    showDays: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PublicBannerResponse {
    id: number;
    mobileUrl: string;
    tabletUrl: string;
    desktopUrl: string;
    title: string;
    link: string;
    placement: BannerPlacement;
    priority: number;
    totalClicked: number;
    startDate: string | null;
    endDate: string | null;
    showDays: string | null;
}
