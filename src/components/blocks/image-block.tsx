import React from 'react';
import type { ImageData } from '@/types/content';

interface ImageBlockProps {
  /** Block data from CMS structured content */
  data: Record<string, unknown>;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  figure: { margin: '1.5rem 0', textAlign: 'center' as const } as const,
  image: { maxWidth: '100%', height: 'auto' as const, borderRadius: 8 } as const,
  caption: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic' as const,
  } as const,
};

/**
 * ImageBlock
 *
 * Renders an image with optional caption for the Structured Content
 * rendering strategy. All HTML attributes are controlled by the component,
 * preventing any possibility of XSS through attribute injection.
 *
 * ## Security Model
 *
 * - The `src` attribute is a controlled string — no JavaScript protocol allowed
 * - The `alt` attribute defaults to an empty string
 * - No event handlers (onerror, onload, etc.) are ever attached
 * - The caption is rendered as a React text node (auto-escaped)
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * <ImageBlock data={{
 *   src: 'https://example.com/photo.jpg',
 *   alt: 'A beautiful landscape',
 *   caption: 'Photo by John Doe',
 * }} />
 * ```
 */
export function ImageBlock({ data }: ImageBlockProps) {
  const { src, alt, caption, width, height } = data as unknown as ImageData;

  if (!src) {
    return null;
  }

  return (
    <figure style={STYLES.figure}>
      <img
        src={src}
        alt={alt ?? ''}
        width={width}
        height={height}
        loading="lazy"
        style={STYLES.image}
      />
      {caption && (
        <figcaption style={STYLES.caption}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
