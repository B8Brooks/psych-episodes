import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { bookmarkEpisode, getUserBookmarks, isMissingEpisodeError } from '@/lib/user-actions';
import { ensureDb } from '@/lib/db';
import { parsePagination } from '@/lib/validations';

// Get all bookmarks for current user
export async function GET(request: Request) {
  try {
    await ensureDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams, { defaultLimit: 50, maxLimit: 100 });

    const result = await getUserBookmarks(user.id, limit, offset);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a bookmark
export async function POST(request: Request) {
  try {
    await ensureDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { episode_id } = body;

    if (!episode_id) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    const bookmark = await bookmarkEpisode(user.id, episode_id);

    // Idempotent upsert, so this is not necessarily a creation.
    return NextResponse.json({ bookmark });
  } catch (error) {
    if (isMissingEpisodeError(error)) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    console.error('Create bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
