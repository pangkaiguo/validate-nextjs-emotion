import React from 'react';
import type { QuoteData } from '@/types/content';

interface QuoteBlockProps {
  /** Block data from CMS structured content */
  data: Record<string, unknown>;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  blockquote: {
    borderLeft: '4px solid #0070f3',
    margin: '1.5rem 0',
    padding: '1rem 1.5rem',
    background: '#f8f9fa',
    borderRadius: '0 8px 8px 0' as const,
    fontStyle: 'italic' as const,
    lineHeight: 1.7,
  } as const,
  text: { margin: 0 } as const,
  author: {
    marginTop: '0.75rem',
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'normal' as const,
  } as const,
};

/**
 * QuoteBlock
 *
 * Renders a blockquote with optional author attribution for the Structured
 * Content rendering strategy. Both the quote text and author are rendered
 * as React text nodes, automatically escaped by React.
 *
 * ## Security Model
 *
 * Both `text` and `author` values are rendered as React text nodes.
 * React automatically escapes all HTML entities, preventing XSS.
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * <QuoteBlock data={{
 *   text: 'The only way to do great work is to love what you do.',
 *   author: 'Steve Jobs',
 * }} />
 * ```
 */
export function QuoteBlock({ data }: QuoteBlockProps) {
  const { text, author } = data as unknown as QuoteData;

  if (!text) {
    return null;
  }

  return (
    <blockquote style={STYLES.blockquote}>
      <p style={STYLES.text}>{text}</p>
      {author && (
        <footer style={STYLES.author}>
          — {author}
        </footer>
      )}
    </blockquote>
  );
}
