# Psych Episodes Database

A searchable database of all Psych TV show episodes with user ratings, bookmarks, and advanced filtering capabilities.

## Features

- **Complete Episode Database**: All 121 episodes across 8 seasons from TMDB (Show ID: 1447)
- **Advanced Search & Filters**: Search by title, filter by season, main cast, and location
- **User Accounts**: Register, login, and manage your personal preferences
- **Ratings & Reviews**: Rate episodes and see community ratings
- **Bookmarks**: Save your favorite episodes for later
- **Main Cast Filter**: Filter episodes featuring:
  - James Roday Rodriguez (Shawn Spencer)
  - Dulé Hill (Burton "Gus" Guster)
  - Timothy Omundson (Carlton Lassiter)
  - Maggie Lawson (Juliet O'Hara)
  - Kirsten Nelson (Karen Vick)
  - Corbin Bernsen (Henry Spencer)
- **Default Location**: Santa Barbara, CA

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Turso (LibSQL)
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS v4
- **API**: TMDB (The Movie Database) API
- **Language**: TypeScript

## Setup

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Turso account and database
- TMDB API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/B8Brooks/psych-episodes.git
cd psych-episodes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Initialize the database:
```bash
npm run db:init
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Seeding

After deployment, visit the admin page to seed the database with episode data:

1. Navigate to `/admin` on your deployed site
2. Enter the admin secret: `ive-heard-it-both-ways`
3. Click "Seed Database" to fetch and store all episodes from TMDB

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variables in Vercel project settings:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
   - `TMDB_API_KEY`
4. Deploy
5. Visit `/admin` to seed the database

## Project Structure

```
psych-episodes/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and database client
│   └── types/           # TypeScript type definitions
├── scripts/             # Database initialization scripts
├── public/              # Static assets
└── package.json
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/episodes` - Get all episodes with filters
- `POST /api/episodes/[id]/rate` - Rate an episode
- `POST /api/episodes/[id]/bookmark` - Bookmark an episode
- `POST /api/admin/seed` - Seed database (requires admin secret)

## Color Scheme

The app uses a green color theme to differentiate it from the amber-themed Murder, She Wrote database.

## Admin Secret

Admin operations require the secret phrase: **ive-heard-it-both-ways** (a classic Psych reference!)

## License

MIT

## Credits

- Episode data from [The Movie Database (TMDB)](https://www.themdb.org/)
- Inspired by the "Murder, She Wrote" episode database
