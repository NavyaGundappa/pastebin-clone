import { storage } from '@/lib/storage';

export { storage };

// Simple in-memory storage for development
interface Paste {
    id: string;
    content: string;
    created_at: number;
    ttl_seconds?: number;
    max_views?: number;
    views: number;
    expires_at?: number;
}

class PasteStorage {
    private pastes = new Map<string, Paste>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up expired pastes every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredPastes();
        }, 60000);
    }

    private cleanupExpiredPastes() {
        const now = Date.now();
        for (const [id, paste] of this.pastes.entries()) {
            if (paste.expires_at && paste.expires_at < now) {
                this.pastes.delete(id);
            }
        }
    }

    async create(paste: Paste): Promise<void> {
        this.pastes.set(paste.id, paste);
        console.log('Created paste:', paste.id, 'Total pastes:', this.pastes.size);
    }

    async get(id: string): Promise<Paste | null> {
        const paste = this.pastes.get(id);
        if (!paste) {
            console.log('Paste not found:', id);
            return null;
        }
        console.log('Found paste:', id, 'Views:', paste.views, 'Max:', paste.max_views);
        return paste;
    }

    async update(id: string, updates: Partial<Paste>): Promise<void> {
        const existing = this.pastes.get(id);
        if (existing) {
            this.pastes.set(id, { ...existing, ...updates });
            console.log('Updated paste:', id, 'New views:', updates.views);
        }
    }

    async delete(id: string): Promise<void> {
        this.pastes.delete(id);
        console.log('Deleted paste:', id);
    }

    async healthCheck(): Promise<boolean> {
        return true; // Memory storage is always healthy
    }

    // Clean up interval on destroy
    destroy() {
        clearInterval(this.cleanupInterval);
    }
}

// Create a singleton instance
export const storage = new PasteStorage();