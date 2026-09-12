import { NextResponse } from 'next/server';
import { searchGuestStars } from '@/lib/episodes';
import { ensureDb } from '@/lib/db';
import { parsePagination } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const { limit } = parsePagination(searchParams, { defaultLimit: 10, maxLimit: 50 });

    const guestStars = await searchGuestStars(query, limit);

    return NextResponse.json({ guest_stars: guestStars });
  } catch (error) {
    console.error('Guest stars search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
