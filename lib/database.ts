import { kv } from '@vercel/kv';
import { Paste } from './types';

const PASTE_PREFIX = 'paste:';

class PasteStorage {
    async create(paste: Paste): Promise<void> {
        const key = `${PASTE_PREFIX}${paste.id}`;
        await kv.set(key, JSON.stringify(paste));

        // If the paste has an expiry, set TTL
        if (paste.expires_at) {
            const ttlSeconds = Math.ceil((paste.expires_at - Date.now()) / 1000);
            if (ttlSeconds > 0) {
                await kv.expire(key, ttlSeconds);
            }
        }
    }

    async get(id: string): Promise<Paste | null> {
        const key = `${PASTE_PREFIX}${id}`;
        const data = await kv.get<string>(key);

        if (!data) return null;

        const paste = JSON.parse(data) as Paste;

        // Check if paste has expired (for cases where TTL wasn't set properly)
        if (paste.expires_at && paste.expires_at < Date.now()) {
            await this.delete(id);
            return null;
        }

        return paste;
    }

    async update(id: string, updates: Partial<Paste>): Promise<void> {
        const existing = await this.get(id);
        if (existing) {
            const updated = { ...existing, ...updates };
            const key = `${PASTE_PREFIX}${id}`;
            await kv.set(key, JSON.stringify(updated));
        }
    }

    async delete(id: string): Promise<void> {
        const key = `${PASTE_PREFIX}${id}`;
        await kv.del(key);
    }

    async healthCheck(): Promise<boolean> {
        try {
            // Simple ping to check if KV is accessible
            await kv.ping();
            return true;
        } catch (error) {
            console.error('KV health check failed:', error);
            return false;
        }
    }
}

export const storage = new PasteStorage();