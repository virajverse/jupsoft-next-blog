import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { jupsoft } from './client.js';
export async function POST(req) {
    const bodyText = await req.text();
    const signature = req.headers.get('x-signature');
    // Verify HMAC SHA-256 signature using the SDK
    const isValid = await jupsoft.verifyWebhookSignature(bodyText, signature);
    if (!isValid) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }
    let payload;
    try {
        payload = JSON.parse(bodyText);
    }
    catch {
        return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }
    // Invalidate specific article cache and list tags (Fix Bug #6: safely validate slug)
    if (payload.event === 'blog.published' || payload.event === 'blog.archived') {
        if (payload.slug && typeof payload.slug === 'string') {
            const cleanSlug = payload.slug.trim();
            revalidateTag(`blog:${cleanSlug}`);
        }
        revalidateTag('blogs');
        revalidateTag('blogs-list');
    }
    return NextResponse.json({ revalidated: true, now: Date.now() });
}
