import { createClient, Client } from '@libsql/client';

// Singleton database client
let client: Client | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

export function getDb(): Client {
  if (!client) {
    // For local development, use file: URL
    // For Turso cloud, use libsql:// or https:// URL
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

// Initialize database schema - only call once
export async function initDb(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = getDb();

    // SQLite leaves foreign keys off per connection, which would make every
    // ON DELETE CASCADE below inert. Remote libsql rejects the pragma and
    // enforces constraints server-side instead, hence the catch.
    try {
      await db.execute('PRAGMA foreign_keys = ON');
    } catch {
      // Enforced by the server for remote connections
    }

    // Create tables
    await db.executeMultiple(`
      -- Episodes table
      CREATE TABLE IF NOT EXISTS episodes (
        id TEXT PRIMARY KEY,
        season_number INTEGER NOT NULL,
        episode_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        air_date TEXT,
        synopsis TEXT,
        setting TEXT,
        imdb_rating REAL,
        tags TEXT,
        UNIQUE(season_number, episode_number)
      );

      -- Guest stars table
      CREATE TABLE IF NOT EXISTS guest_stars (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      -- Episode-GuestStar join table
      CREATE TABLE IF NOT EXISTS episode_guest_stars (
        id TEXT PRIMARY KEY,
        episode_id TEXT NOT NULL,
        guest_star_id TEXT NOT NULL,
        FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
        FOREIGN KEY (guest_star_id) REFERENCES guest_stars(id) ON DELETE CASCADE,
        UNIQUE(episode_id, guest_star_id)
      );

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Ratings table
      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        episode_id TEXT NOT NULL,
        rating REAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
        UNIQUE(user_id, episode_id)
      );

      -- Bookmarks table
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        episode_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
        UNIQUE(user_id, episode_id)
      );

      -- Indexes for common queries
      CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_number);
      CREATE INDEX IF NOT EXISTS idx_episodes_title ON episodes(title);
      CREATE INDEX IF NOT EXISTS idx_guest_stars_name ON guest_stars(name);
      CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_episode ON ratings(episode_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
    `);

    initialized = true;
  })().catch((error) => {
    // Without this reset a single transient failure would be replayed to
    // every later caller, since they all await this same cached promise.
    initPromise = null;
    throw error;
  });

  return initPromise;
}

// Ensure DB is initialized - call this at the start of API routes
export async function ensureDb(): Promise<void> {
  // Skip during build if DATABASE_URL is not set or if building
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  await initDb();
}

// Generate a unique ID
export function generateId(): string {
  return crypto.randomUUID();
}
