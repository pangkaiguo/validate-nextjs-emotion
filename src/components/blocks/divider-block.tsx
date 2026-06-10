import React from 'react';

interface DividerBlockProps {
  /** Block data from CMS structured content (unused — divider has no data) */
  data: Record<string, unknown>;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  hr: {
    margin: '2rem 0',
    border: 'none',
    borderTop: '1px solid #eaeaea',
  } as const,
};

/**
 * DividerBlock
 *
 * Renders a horizontal divider (thematic break) for the Structured Content
 * rendering strategy. This is a purely visual element that renders no user
 * data — making it the safest block type in terms of XSS risk.
 *
 * ## Security Model
 *
 * No user data is rendered. The component produces a static <hr> element
 * with no content, no event handlers, and no attributes derived from input.
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * <DividerBlock data={{}} />
 * ```
 */
export function DividerBlock({ data: _data }: DividerBlockProps) {
  return <hr style={STYLES.hr} />;
}
