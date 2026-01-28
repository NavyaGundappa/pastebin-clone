import { NextResponse } from 'next/server';
import { storage } from '../utils/storage';

export async function GET() {
    try {
        const isHealthy = await storage.healthCheck();

        return NextResponse.json(
            { ok: isHealthy },
            {
                status: isHealthy ? 200 : 503,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            }
        );
    } catch (error) {
        return NextResponse.json(
            { ok: false },
            {
                status: 503,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            }
        );
    }
}