import React from 'react';
import type { ListData } from '@/types/content';

interface ListBlockProps {
  /** Block data from CMS structured content */
  data: Record<string, unknown>;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  list: {
    paddingLeft: '1.5rem',
    marginBottom: '1rem',
    lineHeight: 1.8,
  } as const,
  listItem: {
    marginBottom: '0.25rem',
  } as const,
};

/**
 * ListBlock
 *
 * Renders an ordered (ol) or unordered (ul) list for the Structured Content
 * rendering strategy. Each list item is rendered as a React text node,
 * which is automatically escaped by React — no XSS risk.
 *
 * ## Security Model
 *
 * Each `item` value is rendered as a React text node inside an <li> element.
 * React automatically escapes `<`, `>`, `&`, `"`, and `'` characters,
 * preventing any embedded markup from executing.
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * // Unordered list
 * <ListBlock data={{
 *   items: ['First item', 'Second item', 'Third item'],
 *   ordered: false,
 * }} />
 *
 * // Ordered list
 * <ListBlock data={{
 *   items: ['Step 1', 'Step 2', 'Step 3'],
 *   ordered: true,
 * }} />
 * ```
 */
export function ListBlock({ data }: ListBlockProps) {
  const { items, ordered = false } = data as unknown as ListData;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag style={STYLES.list}>
      {items.map((item: string, index: number) => (
        <li key={index} style={STYLES.listItem}>
          {item}
        </li>
      ))}
    </ListTag>
  );
}
