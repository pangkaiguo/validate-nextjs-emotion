import React from 'react';
import type { ParagraphData } from '@/types/content';

interface ParagraphBlockProps {
  /** Block data from CMS structured content */
  data: Record<string, unknown>;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  paragraph: {
    marginBottom: '1rem',
    lineHeight: 1.7,
  } as const,
};

/**
 * ParagraphBlock
 *
 * Renders a paragraph of text for the Structured Content rendering strategy.
 * Text content is rendered as React text nodes, which are automatically
 * escaped by React — making this inherently XSS-safe.
 *
 * ## Security Model
 *
 * The `text` value is rendered as a React text node, not as HTML.
 * React automatically escapes `<`, `>`, `&`, `"`, and `'` characters,
 * preventing any embedded markup from executing.
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * <ParagraphBlock data={{ text: 'Hello, world!', alignment: 'center' }} />
 * ```
 */
export function ParagraphBlock({ data }: ParagraphBlockProps) {
  // Type assertion at the component boundary — the ONLY place we interpret
  // the raw data shape. All child rendering uses typed, controlled output.
  const { text, alignment = 'left' } = data as unknown as ParagraphData;

  if (!text) {
    return null;
  }

  return (
    <p
      style={{
        ...STYLES.paragraph,
        textAlign: alignment as React.CSSProperties['textAlign'],
      }}
    >
      {text}
    </p>
  );
}
