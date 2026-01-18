'use client';

import type { ParentalGuide } from '@/lib/types';

interface ParentalGuideBadgeProps {
  parentalGuide: ParentalGuide | null | undefined;
  compact?: boolean;
}

const SEVERITY_COLORS = {
  0: 'bg-green-900 text-green-200',
  1: 'bg-yellow-900 text-yellow-200',
  2: 'bg-orange-900 text-orange-200',
  3: 'bg-red-900 text-red-200',
};

const SEVERITY_LABELS = {
  0: 'None',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
};

const CATEGORY_ICONS = {
  violence: '⚔️',
  sex: '💋',
  profanity: '🤬',
  alcohol: '🍺',
  frightening: '😨',
};

export default function ParentalGuideBadge({ parentalGuide, compact = false }: ParentalGuideBadgeProps) {
  if (!parentalGuide) {
    return null;
  }

  const maxSeverity = Math.max(
    parentalGuide.violence_severity,
    parentalGuide.sex_severity,
    parentalGuide.profanity_severity,
    parentalGuide.alcohol_severity,
    parentalGuide.frightening_severity
  ) as keyof typeof SEVERITY_COLORS;

  // TV rating equivalent
  const tvRating = maxSeverity === 0 ? 'TV-G' : maxSeverity === 1 ? 'TV-PG' : maxSeverity === 2 ? 'TV-14' : 'TV-MA';

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${SEVERITY_COLORS[maxSeverity]}`}>
          {tvRating}
        </span>
        {parentalGuide.violence_severity > 0 && <span title="Violence" className="text-xs">⚔️</span>}
        {parentalGuide.sex_severity > 0 && <span title="Sexual content" className="text-xs">💋</span>}
        {parentalGuide.profanity_severity > 0 && <span title="Profanity" className="text-xs">🤬</span>}
        {parentalGuide.alcohol_severity > 0 && <span title="Alcohol/Drugs" className="text-xs">🍺</span>}
        {parentalGuide.frightening_severity > 0 && <span title="Frightening" className="text-xs">😨</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-sm px-3 py-1 rounded font-semibold ${SEVERITY_COLORS[maxSeverity]}`}>
          {tvRating}
        </span>
        <span className="text-slate-400 text-xs">Content Rating</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <CategoryBadge
          icon={CATEGORY_ICONS.violence}
          label="Violence"
          severity={parentalGuide.violence_severity as keyof typeof SEVERITY_LABELS}
        />
        <CategoryBadge
          icon={CATEGORY_ICONS.sex}
          label="Sexual"
          severity={parentalGuide.sex_severity as keyof typeof SEVERITY_LABELS}
        />
        <CategoryBadge
          icon={CATEGORY_ICONS.profanity}
          label="Profanity"
          severity={parentalGuide.profanity_severity as keyof typeof SEVERITY_LABELS}
        />
        <CategoryBadge
          icon={CATEGORY_ICONS.alcohol}
          label="Drugs"
          severity={parentalGuide.alcohol_severity as keyof typeof SEVERITY_LABELS}
        />
        <CategoryBadge
          icon={CATEGORY_ICONS.frightening}
          label="Frightening"
          severity={parentalGuide.frightening_severity as keyof typeof SEVERITY_LABELS}
        />
      </div>
    </div>
  );
}

interface CategoryBadgeProps {
  icon: string;
  label: string;
  severity: keyof typeof SEVERITY_LABELS;
}

function CategoryBadge({ icon, label, severity }: CategoryBadgeProps) {
  return (
    <div className={`text-center p-2 rounded text-xs ${SEVERITY_COLORS[severity]}`}>
      <div className="mb-1">{icon}</div>
      <div className="font-medium">{label}</div>
      <div className="text-xs opacity-75">{SEVERITY_LABELS[severity]}</div>
    </div>
  );
}
