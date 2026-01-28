export interface Paste {
    id: string;
    content: string;
    created_at: number; // milliseconds since epoch
    ttl_seconds?: number;
    max_views?: number;
    views: number;
    expires_at?: number; // milliseconds since epoch
}

export interface CreatePasteRequest {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
}

export interface CreatePasteResponse {
    id: string;
    url: string;
}

export interface GetPasteResponse {
    content: string;
    remaining_views: number | null;
    expires_at: string | null; // ISO string
}

export interface ErrorResponse {
    error: string;
}

export interface HealthCheckResponse {
    ok: boolean;
}