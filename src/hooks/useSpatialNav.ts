import { useEffect, useRef } from 'react';
import { normalizeTvKey, TvAction, initTizenKeys } from '../utils/tvKeys';

export interface SpatialNavOptions {
  onBack?: () => void;
  onEnter?: () => void;
  disabled?: boolean;
}

export const useSpatialNav = (options: SpatialNavOptions = {}) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    initTizenKeys();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (optionsRef.current.disabled) return;

      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // If user is currently typing in an input field (Search, username, PIN, etc.):
      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
          return;
        }
        if (e.key === 'Enter') {
          target.blur();
          return;
        }
        // Allow ArrowDown to move focus out of the search bar into list items
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveFocus('DOWN');
          return;
        }
        // Do NOT intercept typing keys (letters, numbers, space, backspace, left/right text navigation)
        return;
      }

      const action = normalizeTvKey(e);

      // Handle BACK
      if (action === 'BACK') {
        e.preventDefault();
        e.stopPropagation();
        if (optionsRef.current.onBack) {
          optionsRef.current.onBack();
        }
        return;
      }

      // Handle Directional Navigation
      if (['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(action)) {
        e.preventDefault();
        moveFocus(action as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT');
        return;
      }

      // Handle ENTER on focused element
      if (action === 'ENTER') {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'BUTTON' || active.tagName === 'A' || active.getAttribute('role') === 'button' || active.classList.contains('tv-focusable'))) {
          // Standard click will fire naturally
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

function moveFocus(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
  const current = document.activeElement as HTMLElement | null;
  const focusables = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"]), .tv-focusable'
    )
  ).filter(el => {
    // Must be visible
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  });

  if (!focusables.length) return;

  if (!current || !focusables.includes(current)) {
    // Focus the first element
    focusables[0].focus();
    return;
  }

  const currentRect = current.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2
  };

  let bestElement: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of focusables) {
    if (el === current) continue;

    const rect = el.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    const dx = center.x - currentCenter.x;
    const dy = center.y - currentCenter.y;

    // Filter by direction
    let isCandidate = false;
    if (direction === 'UP' && dy < -5) isCandidate = true;
    if (direction === 'DOWN' && dy > 5) isCandidate = true;
    if (direction === 'LEFT' && dx < -5) isCandidate = true;
    if (direction === 'RIGHT' && dx > 5) isCandidate = true;

    if (!isCandidate) continue;

    // Distance calculation: penalize orthogonal distance
    let dist = 0;
    if (direction === 'UP' || direction === 'DOWN') {
      dist = Math.abs(dy) + Math.abs(dx) * 2;
    } else {
      dist = Math.abs(dx) + Math.abs(dy) * 2;
    }

    if (dist < bestScore) {
      bestScore = dist;
      bestElement = el;
    }
  }

  if (bestElement) {
    bestElement.focus();
    // Scroll into view if container is scrollable
    bestElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }
}
