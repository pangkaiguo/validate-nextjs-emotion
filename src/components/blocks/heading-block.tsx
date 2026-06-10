import React from 'react';
import type { HeadingData } from '@/types/content';

interface HeadingBlockProps {
  /** Block data from CMS structured content */
  data: Record<string, unknown>;
}

// ─── Type Definitions ────────────────────────────────────────────────────────

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES: Record<HeadingLevel, React.CSSProperties> = {
  1: { fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 },
  2: { fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.35 },
  3: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 },
  4: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.45 },
  5: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', lineHeight: 1.5 },
  6: { fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', lineHeight: 1.5 },
};

const HEADING_TAG_MAP: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6',
};

/**
 * Clamps a numeric heading level to the valid range [1, 6].
 * If the level is invalid, defaults to 2 (h2).
 */
function clampHeadingLevel(level: number): HeadingLevel {
  const clamped = Math.min(Math.max(Math.round(level), 1), 6) as HeadingLevel;
  return Number.isFinite(level) ? clamped : 2;
}

/**
 * HeadingBlock
 *
 * Renders a heading element (h1 through h6) for the Structured Content
 * rendering strategy. The heading level is clamped to the valid range.
 *
 * ## Security Model
 *
 * The `text` value is rendered as a React text node, not as HTML.
 * React automatically escapes all special characters, preventing XSS.
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * <HeadingBlock data={{ level: 2, text: 'Section Title' }} />
 * <HeadingBlock data={{ level: 1, text: 'Page Title' }} />
 * ```
 */
export function HeadingBlock({ data }: HeadingBlockProps) {
  const { level = 2, text } = data as unknown as HeadingData;

  if (!text) {
    return null;
  }

  const validLevel = clampHeadingLevel(level);
  const Tag = HEADING_TAG_MAP[validLevel];

  return (
    <Tag style={STYLES[validLevel]}>
      {text}
    </Tag>
  );
}
