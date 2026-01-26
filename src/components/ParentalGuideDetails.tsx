'use client';

import { useState } from 'react';
import type { ParentalGuide } from '@/lib/types';

interface ParentalGuideDetailsProps {
  parentalGuide: ParentalGuide;
}

const CATEGORIES = [
  { key: 'violence', label: 'Violence & Gore', icon: '⚔️' },
  { key: 'sex', label: 'Sex & Nudity', icon: '💋' },
  { key: 'profanity', label: 'Profanity', icon: '🤬' },
  { key: 'alcohol', label: 'Alcohol, Drugs & Smoking', icon: '🍺' },
  { key: 'frightening', label: 'Frightening & Intense Scenes', icon: '😨' },
] as const;

const SEVERITY_LABELS = {
  0: 'None',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
};

export default function ParentalGuideDetails({ parentalGuide }: ParentalGuideDetailsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {CATEGORIES.map(({ key, label, icon }) => {
        const severityKey = `${key}_severity` as keyof ParentalGuide;
        const descriptionKey = `${key}_description` as keyof ParentalGuide;
        const severity = parentalGuide[severityKey] as number;
        const description = parentalGuide[descriptionKey] as string | null;
        const isExpanded = expandedCategory === key;

        return (
          <div key={key} className="bg-slate-700 rounded p-3">
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : key)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="text-white font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  severity === 0 ? 'bg-green-900 text-green-200' :
                  severity === 1 ? 'bg-yellow-900 text-yellow-200' :
                  severity === 2 ? 'bg-orange-900 text-orange-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS]}
                </span>
                <span className="text-slate-400">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </button>

            {isExpanded && description && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <p className="text-slate-300 text-sm whitespace-pre-wrap">
                  {description.split(' | ').map((desc, i) => (
                    <span key={i} className="block mb-2">• {desc}</span>
                  ))}
                </p>
              </div>
            )}

            {isExpanded && !description && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <p className="text-slate-400 text-sm italic">No detailed information available</p>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-slate-500 text-xs">
        Data sourced from IMDb on {new Date(parentalGuide.scraped_at).toLocaleDateString()}
      </p>
    </div>
  );
}
