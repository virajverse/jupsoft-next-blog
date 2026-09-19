import { NextRequest, NextResponse } from 'next/server';
export declare function POST(req: NextRequest): Promise<NextResponse<{
    ok: boolean;
    message: string;
}> | NextResponse<{
    ok: boolean;
    error: string;
}> | NextResponse<{
    ok: boolean;
    revalidated: boolean;
    now: number;
}>>;
//# sourceMappingURL=webhook.d.ts.map