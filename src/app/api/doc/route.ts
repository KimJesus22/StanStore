import { getApiDocs } from '@/lib/swagger';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/requireAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const denial = await requireAdmin();
    if (denial) {
        return NextResponse.json({ error: 'Forbidden' }, { status: denial === 'unauthenticated' ? 401 : 403 });
    }

    const spec = await getApiDocs();
    return NextResponse.json(spec);
}
