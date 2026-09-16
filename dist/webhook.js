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
    const payload = JSON.parse(bodyText);
    // Invalidate specific article cache and list tags
    if (payload.event === 'blog.published' || payload.event === 'blog.archived') {
        if (payload.slug) {
            revalidateTag(`blog:${payload.slug}`);
        }
        revalidateTag('blogs');
        revalidateTag('blogs-list');
    }
    return NextResponse.json({ revalidated: true, now: Date.now() });
}
