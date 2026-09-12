import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { rateEpisode, getUserRatings, isMissingEpisodeError } from '@/lib/user-actions';
import { ratingSchema, parsePagination } from '@/lib/validations';
import { ensureDb } from '@/lib/db';

// Get all ratings for current user
export async function GET(request: Request) {
  try {
    await ensureDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams, { defaultLimit: 50, maxLimit: 100 });

    const result = await getUserRatings(user.id, limit, offset);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create or update a rating
export async function POST(request: Request) {
  try {
    await ensureDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { episode_id, ...ratingData } = body;

    if (!episode_id) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    const parsed = ratingSchema.safeParse(ratingData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rating = await rateEpisode(user.id, episode_id, parsed.data.rating, parsed.data.notes);

    // Idempotent upsert, so this is not necessarily a creation.
    return NextResponse.json({ rating });
  } catch (error) {
    if (isMissingEpisodeError(error)) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    console.error('Create rating error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
