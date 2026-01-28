import { nanoid } from 'nanoid';
import { Paste } from './types';

export function generateId(): string {
    return nanoid(10); // 10-character ID
}

export function isPasteExpired(paste: Paste, now: number): boolean {
    if (paste.expires_at && paste.expires_at <= now) {
        return true;
    }
    if (paste.maxViews && paste.views >= paste.maxViews) {
        return true;
    }
    return false;
}

export function getCurrentTime(request: Request): number {
    if (process.env.TEST_MODE === '1') {
        const testTimeHeader = request.headers.get('x-test-now-ms');
        if (testTimeHeader) {
            return parseInt(testTimeHeader, 10);
        }
    }
    return Date.now();
}

export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}
