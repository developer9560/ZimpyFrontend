/**
 * JWT Token Decoder Utility
 * Decodes JWT tokens to extract payload information without verification
 * Note: This is for client-side role checking only. Server still validates tokens.
 */

interface JwtPayload {
    sub: string; // userId
    role: string; // USER or ADMIN
    iat: number; // issued at
    exp: number; // expiration
}

/**
 * Decode JWT token and extract payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JwtPayload | null {
    try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (base64url encoded)
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload) as JwtPayload;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

/**
 * Extract user role from JWT token
 * @param token - JWT token string
 * @returns Role string (ADMIN or USER) or null
 */
export function extractRoleFromToken(token: string): string | null {
    const payload = decodeJWT(token);
    return payload?.role || null;
}

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns User ID or null
 */
export function extractUserIdFromToken(token: string): string | null {
    const payload = decodeJWT(token);
    return payload?.sub || null;
}

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
        return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
}

/**
 * Check if user has admin role from token
 * @param token - JWT token string
 * @returns true if user is admin
 */
export function isAdminFromToken(token: string): boolean {
    const role = extractRoleFromToken(token);
    return role === 'ADMIN';
}
