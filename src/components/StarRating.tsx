'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (!interactive || !onChange) return;
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(newRating);
  };

  const handleMouseMove = (e: React.MouseEvent, starIndex: number) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(isHalf ? starIndex + 0.5 : starIndex + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive || !onChange) return;
    const step = e.shiftKey ? 0.5 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(rating + step, maxRating));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(rating - step, 0.5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(0.5);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(maxRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex"
        {...(interactive
          ? {
              role: 'slider',
              tabIndex: 0,
              'aria-label': 'Your rating',
              'aria-valuemin': 0.5,
              'aria-valuemax': maxRating,
              'aria-valuenow': rating,
              'aria-valuetext': `${rating} out of ${maxRating} stars`,
              onKeyDown: handleKeyDown,
              onBlur: () => setHoverRating(null),
            }
          : { role: 'img', 'aria-label': `${rating.toFixed(1)} out of ${maxRating} stars` })}
      >
        {[...Array(maxRating)].map((_, i) => {
          const fillLevel = Math.min(Math.max(displayRating - i, 0), 1);
          const isFull = fillLevel >= 1;
          const isHalf = fillLevel >= 0.5 && fillLevel < 1;

          return (
            <div
              key={i}
              className={`relative ${interactive ? 'cursor-pointer' : ''} ${sizeClasses[size]}`}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                handleClick(i, x < rect.width / 2);
              }}
            >
              {/* Empty star background */}
              <svg
                className={`absolute inset-0 ${sizeClasses[size]} text-slate-600`}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>

              {/* Filled star (full or half) */}
              {(isFull || isHalf) && (
                <svg
                  className={`absolute inset-0 ${sizeClasses[size]} text-green-400`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-slate-400 text-sm ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
