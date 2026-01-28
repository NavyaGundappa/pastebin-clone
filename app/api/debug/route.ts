import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    try {
        // Get storage statistics
        const stats = {
            ok: true,
            timestamp: new Date().toISOString(),
            storage_type: 'in_memory',
            total_pastes: 'available_via_debug_method',
            note: 'Check server logs for debug output'
        };

        // Trigger debug output
        storage.debug();

        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json(
            { error: 'Debug failed', details: String(error) },
            { status: 500 }
        );
    }
}