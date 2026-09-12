'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchFromTMDB = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Fetching from TMDB... This may take a minute (121 episodes).');

    try {
      const response = await fetch('/api/admin/fetch-tmdb', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
      });

      const data = await response.json();

      if (data.success) {
        setStatus(`Success! Fetched ${data.fetched} episodes from TMDB, imported ${data.imported}.`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Admin</h1>

      <form
        onSubmit={fetchFromTMDB}
        className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Fetch from TMDB</h2>
        <p className="text-slate-400 mb-4">
          Fetch accurate Psych episode data directly from The Movie Database.
          Requires TMDB_API_KEY environment variable.
        </p>
        <p className="text-slate-500 text-sm mb-4">
          Get a free API key at:{' '}
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400"
          >
            themoviedb.org/settings/api
          </a>
        </p>

        <div className="mb-4">
          <label htmlFor="admin-secret" className="block text-slate-300 text-sm mb-1">
            Admin secret
          </label>
          <input
            type="password"
            id="admin-secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-slate-500 text-xs mt-1">
            Must match the ADMIN_SECRET environment variable.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Loading...' : 'Fetch from TMDB'}
        </button>
      </form>

      {status && (
        <div
          className={`mt-6 p-4 rounded-lg text-white ${
            status.includes('Success')
              ? 'bg-green-800'
              : status.includes('Error')
                ? 'bg-red-800'
                : 'bg-slate-700'
          }`}
        >
          {status}
        </div>
      )}

      <Link href="/" className="block mt-6 text-green-500 hover:text-green-400">
        &larr; Back to Home
      </Link>
    </div>
  );
}
