import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, generateId } from '@/lib/db';
import { ensureDb } from '@/lib/db';
import { userParentalPreferencesSchema } from '@/lib/validations';

// GET user's parental preferences
export async function GET(request: Request) {
  try {
    await ensureDb();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM user_parental_preferences WHERE user_id = ?',
      args: [user.id],
    });

    if (result.rows.length === 0) {
      // Return defaults if not set
      return NextResponse.json({
        preferences: {
          filter_enabled: false,
          max_violence: 3,
          max_sex: 3,
          max_profanity: 3,
          max_alcohol: 3,
          max_frightening: 3,
        }
      });
    }

    const prefs = result.rows[0] as any;
    return NextResponse.json({
      preferences: {
        filter_enabled: prefs.filter_enabled === 1,
        max_violence: prefs.max_violence,
        max_sex: prefs.max_sex,
        max_profanity: prefs.max_profanity,
        max_alcohol: prefs.max_alcohol,
        max_frightening: prefs.max_frightening,
      }
    });
  } catch (error) {
    console.error('Get parental preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update user's parental preferences
export async function PUT(request: Request) {
  try {
    await ensureDb();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = userParentalPreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();

    // Check if preferences exist
    const existing = await db.execute({
      sql: 'SELECT id FROM user_parental_preferences WHERE user_id = ?',
      args: [user.id],
    });

    if (existing.rows.length > 0) {
      // Update
      await db.execute({
        sql: `
          UPDATE user_parental_preferences
          SET filter_enabled = ?, max_violence = ?, max_sex = ?,
              max_profanity = ?, max_alcohol = ?, max_frightening = ?,
              updated_at = ?
          WHERE user_id = ?
        `,
        args: [
          parsed.data.filter_enabled ? 1 : 0,
          parsed.data.max_violence,
          parsed.data.max_sex,
          parsed.data.max_profanity,
          parsed.data.max_alcohol,
          parsed.data.max_frightening,
          now,
          user.id,
        ],
      });
    } else {
      // Insert
      await db.execute({
        sql: `
          INSERT INTO user_parental_preferences (
            id, user_id, filter_enabled, max_violence, max_sex,
            max_profanity, max_alcohol, max_frightening, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          generateId(),
          user.id,
          parsed.data.filter_enabled ? 1 : 0,
          parsed.data.max_violence,
          parsed.data.max_sex,
          parsed.data.max_profanity,
          parsed.data.max_alcohol,
          parsed.data.max_frightening,
          now,
          now,
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update parental preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
