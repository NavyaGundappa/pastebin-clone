import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

function getCurrentTime(request: NextRequest): number {
    if (process.env.TEST_MODE === '1') {
        const testTimeHeader = request.headers.get('x-test-now-ms');
        if (testTimeHeader) {
            const testTime = parseInt(testTimeHeader, 10);
            if (!isNaN(testTime)) {
                return testTime;
            }
        }
    }
    return Date.now();
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log(`[FETCH] Fetching paste: ${id}`);
        console.log(`[FETCH] Full URL: ${request.url}`);

        // Debug: List all pastes before fetch
        storage.debug();

        if (!id || id.trim() === '') {
            console.log(`[FETCH] Invalid ID: ${id}`);
            return NextResponse.json(
                { error: 'Invalid paste ID' },
                { status: 400 }
            );
        }

        const paste = await storage.get(id);
        const now = getCurrentTime(request);

        console.log(`[FETCH] Paste found: ${!!paste}`);
        console.log(`[FETCH] Current time: ${new Date(now).toISOString()}`);

        if (!paste) {
            console.log(`[FETCH] Paste ${id} not found in storage`);
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Check expiry
        if (paste.expires_at && paste.expires_at < now) {
            console.log(`[FETCH] Paste expired: ${id}, Expiry: ${new Date(paste.expires_at).toISOString()}`);
            await storage.delete(id);
            return NextResponse.json(
                { error: 'Paste has expired' },
                { status: 404 }
            );
        }

        // Check view limit
        if (paste.max_views !== undefined && paste.views >= paste.max_views) {
            console.log(`[FETCH] View limit reached: ${id}, Views: ${paste.views}, Max: ${paste.max_views}`);
            await storage.delete(id);
            return NextResponse.json(
                { error: 'Paste view limit reached' },
                { status: 404 }
            );
        }

        // Increment view count
        const updatedViews = paste.views + 1;
        console.log(`[FETCH] Incrementing views for ${id}: ${paste.views} -> ${updatedViews}`);
        await storage.update(id, { views: updatedViews });

        // Prepare response
        const response = {
            content: paste.content,
            remaining_views: paste.max_views !== undefined ?
                Math.max(0, paste.max_views - updatedViews) : null,
            expires_at: paste.expires_at ?
                new Date(paste.expires_at).toISOString() : null,
            created_at: new Date(paste.created_at).toISOString(),
            view_count: updatedViews,
            id: paste.id,
            debug: {
                storage: 'in_memory',
                ttl_seconds: paste.ttl_seconds,
                max_views: paste.max_views
            }
        };

        console.log(`[FETCH] Returning paste ${id} successfully`);
        return NextResponse.json(response);

    } catch (error: any) {
        console.error(`[FETCH] Error:`, error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}