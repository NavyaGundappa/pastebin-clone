import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { storage } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('[CREATE] Received request:', {
            contentLength: body.content?.length,
            ttl_seconds: body.ttl_seconds,
            max_views: body.max_views
        });

        // Validate input
        if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
            return NextResponse.json(
                { error: 'content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        if (body.ttl_seconds !== undefined) {
            if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be an integer ≥ 1' },
                    { status: 400 }
                );
            }
        }

        if (body.max_views !== undefined) {
            if (!Number.isInteger(body.max_views) || body.max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be an integer ≥ 1' },
                    { status: 400 }
                );
            }
        }

        // Generate ID
        const id = nanoid(10);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const url = `${baseUrl}/p/${id}`;

        // Calculate expiry
        const now = Date.now();
        const expires_at = body.ttl_seconds ? now + (body.ttl_seconds * 1000) : undefined;

        // Create paste object
        const paste = {
            id,
            content: body.content.trim(),
            created_at: now,
            ttl_seconds: body.ttl_seconds,
            max_views: body.max_views,
            views: 0,
            expires_at,
        };

        console.log(`[CREATE] Creating paste: ${id}`);
        console.log(`[CREATE] URL: ${url}`);
        console.log(`[CREATE] Expires at: ${expires_at ? new Date(expires_at).toISOString() : 'Never'}`);

        // Store the paste
        await storage.create(paste);

        // Debug: List all pastes
        storage.debug();

        // Return response
        return NextResponse.json(
            {
                id,
                url,
                debug: {
                    expires_at: expires_at ? new Date(expires_at).toISOString() : null,
                    max_views: body.max_views || null,
                    storage_size: 'in_memory'
                }
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('[CREATE] Error:', error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}