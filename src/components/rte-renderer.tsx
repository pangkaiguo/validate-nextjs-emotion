'use client';

import React from 'react';
import type { JSONContent } from '@tiptap/react';

/**
 * TipTap JSON AST node type representing structured editor content.
 * Each node has a type, optional content (children), text, marks, and attributes.
 *
 * @see https://prosemirror.net/docs/ref/#model.Node
 */
interface TipTapNode {
  /** Node type identifier (e.g., 'doc', 'paragraph', 'heading', 'text') */
  type: string;
  /** Child nodes (if this is a container node) */
  content?: TipTapNode[];
  /** Plain text content (only on text nodes) */
  text?: string;
  /** Inline formatting marks applied to text */
  marks?: TipTapMark[];
  /** Node-specific attributes (e.g., heading level, image src) */
  attrs?: Record<string, unknown>;
}

/**
 * Inline formatting mark applied to a text node.
 * Examples: bold, italic, link, code, strike.
 */
interface TipTapMark {
  /** Mark type identifier (e.g., 'bold', 'italic', 'link') */
  type: string;
  /** Mark-specific attributes (e.g., link href) */
  attrs?: Record<string, unknown>;
}

interface RTERendererProps {
  /** TipTap-compatible JSONContent from a rich text editor */
  content: JSONContent;
  /** Optional CSS class name for styling */
  className?: string;
}

// ─── Style Constants ─────────────────────────────────────────────────────────
// Centralized style definitions for consistent rendering across all node types.

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];

const HEADING_STYLES: Record<HeadingLevel, React.CSSProperties> = {
  1: { fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' },
  2: { fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' },
  3: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' },
  4: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' },
  5: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' },
  6: { fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' },
};

const STYLES = {
  container: { lineHeight: 1.7, color: '#333' } as const,
  paragraph: { marginBottom: '1rem', lineHeight: 1.7 } as const,
  list: { paddingLeft: '1.5rem', marginBottom: '1rem', lineHeight: 1.8 } as const,
  listItem: { marginBottom: '0.25rem' } as const,
  blockquote: {
    borderLeft: '4px solid #0070f3',
    padding: '1rem 1.5rem',
    margin: '1.5rem 0',
    background: '#f8f9fa',
    borderRadius: '0 8px 8px 0',
    fontStyle: 'italic',
    lineHeight: 1.7,
  } as const,
  codeBlock: {
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: 8,
    overflowX: 'auto',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    marginBottom: '1rem',
  } as const,
  codeLabel: {
    position: 'absolute' as const,
    top: 8,
    right: 12,
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'uppercase' as const,
  },
  image: {
    maxWidth: '100%',
    height: 'auto' as const,
    borderRadius: 8,
    margin: '1rem 0',
  } as const,
  horizontalRule: {
    margin: '2rem 0',
    border: 'none',
    borderTop: '1px solid #eaeaea',
  } as const,
  inlineCode: {
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: '0.9em',
  } as const,
  link: { color: '#0070f3' } as const,
  codeBlockWrapper: { position: 'relative' as const },
} as const;

// ─── Mark Rendering ───────────────────────────────────────────────────────────
// Renders inline formatting marks by wrapping text content in appropriate elements.

/**
 * Renders text content with applied marks.
 * Each mark wraps its text in the corresponding HTML element (e.g., <strong>, <em>).
 *
 * Security: All text content is rendered as React text nodes, which are
 * automatically escaped by React. No user text can become executable markup.
 */
function renderTextWithMarks(
  text: string,
  marks: TipTapMark[] | undefined,
  key: number
): React.ReactNode {
  if (!marks || marks.length === 0) {
    return <React.Fragment key={key}>{text}</React.Fragment>;
  }

  // Process marks from innermost to outermost (reverse order)
  let content: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        content = <strong key={key}>{content}</strong>;
        break;
      case 'italic':
        content = <em key={key}>{content}</em>;
        break;
      case 'underline':
        content = <u key={key}>{content}</u>;
        break;
      case 'strike':
        content = <s key={key}>{content}</s>;
        break;
      case 'code':
        content = (
          <code key={key} style={STYLES.inlineCode}>
            {content}
          </code>
        );
        break;
      case 'link': {
        const href = mark.attrs?.href as string | undefined;
        content = (
          <a
            key={key}
            href={href || '#'}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={STYLES.link}
          >
            {content}
          </a>
        );
        break;
      }
      case 'subscript':
        content = <sub key={key}>{content}</sub>;
        break;
      case 'superscript':
        content = <sup key={key}>{content}</sup>;
        break;
      // Unknown marks are silently ignored (preserve content)
    }
  }

  return content;
}

// ─── Node Rendering ───────────────────────────────────────────────────────────
// Recursively renders JSON AST nodes into React elements.

/**
 * Recursively renders a TipTap JSON node into its corresponding React element.
 *
 * @param node - The AST node to render
 * @param key - Unique key for React reconciliation
 * @returns A React element or null if the node cannot be rendered
 */
function renderNode(node: TipTapNode, key: number): React.ReactNode {
  const nodeKey = `rte-node-${key}`;

  // ── Base Case: Text Node ──────────────────────────────────────────────
  if (node.type === 'text') {
    const text = node.text ?? '';
    return renderTextWithMarks(text, node.marks, key);
  }

  // ── Recursive Case: Container Node ────────────────────────────────────
  // Process children first, then wrap in the appropriate element.
  const children = node.content
    ?.map((child, index) => renderNode(child, index))
    .filter(Boolean);

  // React helper: creates a key prop + data attribute object for DOM elements.
  // IMPORTANT: `key` must NOT be spread into DOM elements — it's a React-only prop.
  const dataAttrs = { 'data-node-type': node.type };

  switch (node.type) {
    case 'doc':
      return <div key={nodeKey} {...dataAttrs}>{children}</div>;

    case 'paragraph':
      return <p key={nodeKey} {...dataAttrs} style={STYLES.paragraph}>{children}</p>;

    case 'heading': {
      const level = Math.min(
        Math.max((node.attrs?.level as number) || 2, 1),
        6
      ) as HeadingLevel;
      const headingTagMap = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const;
      const Tag = headingTagMap[level];
      return React.createElement(
        Tag,
        { key: nodeKey, ...dataAttrs, style: HEADING_STYLES[level] },
        children
      );
    }

    case 'bulletList':
      return <ul key={nodeKey} {...dataAttrs} style={STYLES.list}>{children}</ul>;

    case 'orderedList':
      return <ol key={nodeKey} {...dataAttrs} style={STYLES.list}>{children}</ol>;

    case 'listItem':
      return <li key={nodeKey} {...dataAttrs} style={STYLES.listItem}>{children}</li>;

    case 'blockquote':
      return <blockquote key={nodeKey} {...dataAttrs} style={STYLES.blockquote}>{children}</blockquote>;

    case 'codeBlock': {
      const language = (node.attrs?.language as string) || '';
      return (
        <div key={nodeKey} {...dataAttrs} style={STYLES.codeBlockWrapper}>
          {language && <span style={STYLES.codeLabel}>{language}</span>}
          <pre style={STYLES.codeBlock}>
            <code>{children}</code>
          </pre>
        </div>
      );
    }

    case 'horizontalRule':
      return <hr key={nodeKey} {...dataAttrs} style={STYLES.horizontalRule} />;

    case 'image': {
      const { src, alt } = node.attrs || {};
      if (!src) return null;
      return (
        <img
          key={nodeKey}
          src={src as string}
          alt={(alt as string) || ''}
          loading="lazy"
          style={STYLES.image}
        />
      );
    }

    case 'hardBreak':
      return <br key={nodeKey} />;

    default:
      // Unknown/unsupported node type — render children if present, otherwise skip.
      if (children) {
        return <div key={nodeKey} {...dataAttrs}>{children}</div>;
      }
      // Silently skip unsupported leaf nodes (e.g., 'mention', 'emoji')
      return null;
  }
}

/**
 * RTERenderer
 *
 * Renders TipTap-compatible JSON content as React elements.
 * This lightweight renderer converts a JSON AST into controlled DOM components
 * without requiring the full @tiptap/react editor runtime.
 *
 * ## Security Model
 *
 * All content is rendered as React text nodes or controlled React elements.
 * No HTML strings are concatenated or injected into the DOM via
 * dangerouslySetInnerHTML. Each node type maps to a specific React component
 * that controls its own rendering.
 *
 * ## SSR Compatible: Yes
 * The component receives serializable JSONContent as props and returns
 * standard React elements. No browser APIs are required for rendering.
 *
 * ## SSG Compatible: Yes
 * Can be used with Next.js `generateStaticParams()` for static generation.
 *
 * @example
 * ```tsx
 * import { RTERenderer } from '@/components/rte-renderer';
 *
 * const content = {
 *   type: 'doc',
 *   content: [
 *     { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Hello World' }] },
 *     { type: 'paragraph', content: [{ type: 'text', text: 'This is a paragraph.' }] },
 *   ],
 * };
 *
 * <RTERenderer content={content} />
 * ```
 */
export function RTERenderer({ content, className = '' }: RTERendererProps) {
  if (!content) {
    return null;
  }

  const rendered = renderNode(content as unknown as TipTapNode, 0);

  return (
    <div className={`rte-content ${className}`.trim()} style={STYLES.container}>
      {rendered}
    </div>
  );
}
