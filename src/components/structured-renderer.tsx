import React from 'react';
import type { ContentBlock, StructuredContent } from '@/types/content';
import { BLOCK_REGISTRY } from '@/lib/content-registry';

interface StructuredRendererProps {
  /** CMS structured content (array of typed data blocks) */
  content: StructuredContent;
  /** Optional CSS class name for styling */
  className?: string;
}

// ─── Error Boundary Styles ────────────────────────────────────────────────────

const UNKNOWN_BLOCK_STYLE: React.CSSProperties = {
  padding: '1rem',
  background: '#fff3cd',
  borderRadius: 8,
  color: '#856404',
  marginBottom: '0.5rem',
  border: '1px solid #ffc107',
  fontSize: '0.9rem',
};

// ─── Block Renderer ───────────────────────────────────────────────────────────
// Internal recursive component that resolves each block to its registered React
// component from the content registry.

/**
 * Recursively renders a single ContentBlock by looking up its registered
 * React component from the BLOCK_REGISTRY.
 *
 * If the block type is not recognized, a warning is logged and a fallback
 * UI is rendered (in development mode) or silently skipped (in production).
 */
function BlockRenderer({ block }: { block: ContentBlock }): React.ReactNode {
  const Component = BLOCK_REGISTRY[block.type];

  if (!Component) {
    // In development, show a visible fallback for debugging.
    // In production, silently skip unknown block types.
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[StructuredRenderer] Unknown block type: "${block.type}". ` +
        `Available types: ${Object.keys(BLOCK_REGISTRY).join(', ')}`
      );
      return (
        <div style={UNKNOWN_BLOCK_STYLE} data-block-type={block.type}>
          <strong>Unknown block type:</strong> <code>{block.type}</code>
        </div>
      );
    }
    return null;
  }

  return (
    <Component data={block.data}>
      {block.children?.map((child) => (
        <BlockRenderer key={child.id} block={child} />
      ))}
    </Component>
  );
}

/**
 * StructuredRenderer
 *
 * Renders CMS content by mapping each ContentBlock to its registered React component
 * from the BLOCK_REGISTRY pattern. This is the **primary rendering strategy** for
 * managing user-generated content in a CMS context.
 *
 * ## Security Model
 *
 * This component is the safest rendering strategy available. Because content flows
 * as structured JSON data (not HTML strings), there is no opportunity for XSS:
 *
 * - Each block type has a dedicated React component that controls its own rendering
 * - Text content is rendered as React text nodes (automatically escaped by React)
 * - No HTML strings are ever concatenated or passed to dangerouslySetInnerHTML
 * - TypeScript validates data shapes at compile time
 *
 * ## SSR Compatible: Yes
 * This is a **Server Component** (no 'use client' directive). It renders on the
 * server, producing full HTML with all content embedded in the initial payload.
 * No client-side JavaScript is needed for content display.
 *
 * ## SSG Compatible: Yes
 * Can be used with Next.js `generateStaticParams()` for static generation.
 *
 * @example
 * ```tsx
 * // Server Component usage
 * import { StructuredRenderer } from '@/components/structured-renderer';
 *
 * export default async function Page() {
 *   const content = await fetchCMSContent();
 *   return <StructuredRenderer content={content} />;
 * }
 * ```
 */
export function StructuredRenderer({
  content,
  className = '',
}: StructuredRendererProps) {
  if (!content?.blocks || content.blocks.length === 0) {
    return null;
  }

  return (
    <div className={`structured-content ${className}`.trim()}>
      {content.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
