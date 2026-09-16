import { NextRequest, NextResponse } from 'next/server';
export declare function POST(req: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    revalidated: boolean;
    now: number;
}>>;
//# sourceMappingURL=webhook.d.ts.map