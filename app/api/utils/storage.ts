// Shared in-memory storage accessible by all routes
interface Paste {
    id: string;
    content: string;
    created_at: number;
    ttl_seconds?: number;
    max_views?: number;
    views: number;
    expires_at?: number;
    expiresAt?: number;
}

// Global storage instance
class PasteStorage {
    private pastes = new Map<string, Paste>();
    private static instance: PasteStorage;
    private cleanupInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.startCleanupInterval();
    }

    private startCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredPastes();
        }, 30000);
    }

    public static getInstance(): PasteStorage {
        if (!PasteStorage.instance) {
            PasteStorage.instance = new PasteStorage();
        }
        return PasteStorage.instance;
    }

    private cleanupExpiredPastes() {
        const now = Date.now();
        let cleaned = 0;
        for (const [id, paste] of this.pastes.entries()) {
            if (paste.expires_at && paste.expires_at < now) {
                this.pastes.delete(id);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} expired pastes`);
        }
    }

    async create(paste: Paste): Promise<void> {
        this.pastes.set(paste.id, paste);
        console.log(`Created paste: ${paste.id}, Total: ${this.pastes.size}`);
    }

    async get(id: string): Promise<Paste | null> {
        const paste = this.pastes.get(id);
        if (!paste) {
            console.log(`Paste not found: ${id}`);
            return null;
        }

        if (paste.expires_at && paste.expires_at < Date.now()) {
            console.log(`Paste expired: ${id}`);
            this.pastes.delete(id);
            return null;
        }

        return paste;
    }

    async update(id: string, updates: Partial<Paste>): Promise<void> {
        const existing = this.pastes.get(id);
        if (existing) {
            this.pastes.set(id, { ...existing, ...updates });
            console.log(`Updated paste: ${id}, Views: ${updates.views}`);
        }
    }

    async delete(id: string): Promise<void> {
        this.pastes.delete(id);
        console.log(`Deleted paste: ${id}`);
    }

    async healthCheck(): Promise<boolean> {
        return true;
    }

    public destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

export const storage = PasteStorage.getInstance();
