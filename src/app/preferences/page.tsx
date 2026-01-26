'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PreferencesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [filterEnabled, setFilterEnabled] = useState(false);
  const [maxViolence, setMaxViolence] = useState(3);
  const [maxSex, setMaxSex] = useState(3);
  const [maxProfanity, setMaxProfanity] = useState(3);
  const [maxAlcohol, setMaxAlcohol] = useState(3);
  const [maxFrightening, setMaxFrightening] = useState(3);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchPreferences = async () => {
      try {
        const res = await fetch('/api/user/parental-preferences');
        if (res.ok) {
          const data = await res.json();
          const prefs = data.preferences;
          setFilterEnabled(prefs.filter_enabled);
          setMaxViolence(prefs.max_violence);
          setMaxSex(prefs.max_sex);
          setMaxProfanity(prefs.max_profanity);
          setMaxAlcohol(prefs.max_alcohol);
          setMaxFrightening(prefs.max_frightening);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/parental-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter_enabled: filterEnabled,
          max_violence: maxViolence,
          max_sex: maxSex,
          max_profanity: maxProfanity,
          max_alcohol: maxAlcohol,
          max_frightening: maxFrightening,
        }),
      });

      if (res.ok) {
        setMessage('Preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save preferences.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block">
        &larr; Back to episodes
      </Link>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-6">Parental Guide Preferences</h1>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="filter-enabled"
              checked={filterEnabled}
              onChange={(e) => setFilterEnabled(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-green-500 focus:ring-green-500"
            />
            <label htmlFor="filter-enabled" className="text-white font-medium">
              Enable automatic content filtering
            </label>
          </div>

          <p className="text-slate-400 text-sm">
            When enabled, episodes will be automatically filtered based on your maximum content thresholds.
            You can override these settings using search filters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <PreferenceSlider
              label="Violence & Gore"
              icon="⚔️"
              value={maxViolence}
              onChange={setMaxViolence}
            />
            <PreferenceSlider
              label="Sex & Nudity"
              icon="💋"
              value={maxSex}
              onChange={setMaxSex}
            />
            <PreferenceSlider
              label="Profanity"
              icon="🤬"
              value={maxProfanity}
              onChange={setMaxProfanity}
            />
            <PreferenceSlider
              label="Alcohol, Drugs & Smoking"
              icon="🍺"
              value={maxAlcohol}
              onChange={setMaxAlcohol}
            />
            <PreferenceSlider
              label="Frightening & Intense Scenes"
              icon="😨"
              value={maxFrightening}
              onChange={setMaxFrightening}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>

            {message && (
              <span className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PreferenceSliderProps {
  label: string;
  icon: string;
  value: number;
  onChange: (value: number) => void;
}

function PreferenceSlider({ label, icon, value, onChange }: PreferenceSliderProps) {
  const severityLabels = ['None', 'Mild', 'Moderate', 'Severe'];

  return (
    <div>
      <label className="text-white font-medium mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </label>
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="3"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          {severityLabels.map((label, i) => (
            <span key={i} className={value === i ? 'text-green-400 font-semibold' : ''}>
              {label}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-300">
          Maximum: <span className="font-semibold text-green-400">{severityLabels[value]}</span>
        </p>
      </div>
    </div>
  );
}
