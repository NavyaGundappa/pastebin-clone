import { Paste } from './types';

class MemoryStorage {
    private pastes = new Map<string, Paste>();

    async create(paste: Paste): Promise<void> {
        this.pastes.set(paste.id, paste);
    }

    async get(id: string): Promise<Paste | null> {
        const paste = this.pastes.get(id);
        if (!paste) return null;

        // Check if expired
        if (paste.expires_at && paste.expires_at < Date.now()) {
            this.pastes.delete(id);
            return null;
        }

        return paste;
    }

    async update(id: string, updates: Partial<Paste>): Promise<void> {
        const existing = this.pastes.get(id);
        if (existing) {
            this.pastes.set(id, { ...existing, ...updates });
        }
    }

    async delete(id: string): Promise<void> {
        this.pastes.delete(id);
    }

    async healthCheck(): Promise<boolean> {
        return true; // Memory storage is always available
    }
}

export const memoryStorage = new MemoryStorage();