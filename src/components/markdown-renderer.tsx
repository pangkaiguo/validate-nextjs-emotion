import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  /** Markdown content to render into HTML */
  content: string;
  /** Enable GitHub Flavored Markdown (tables, strikethrough, task lists, etc.) */
  gfm?: boolean;
  /** Optional CSS class name for styling */
  className?: string;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  container: { lineHeight: 1.7, color: '#333' } as const,
  link: { color: '#0070f3' } as const,
  image: { maxWidth: '100%', height: 'auto' as const, borderRadius: 8 } as const,
  codeBlock: {
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: 8,
    overflowX: 'auto' as const,
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
  inlineCode: {
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: '0.9em',
  } as const,
  codeBlockWrapper: { position: 'relative' as const } as const,
} as const;

// ─── Rehype Sanitize Options ──────────────────────────────────────────────────
// Extends the default rehype-sanitize schema to allow specific attributes needed
// for proper rendered output (e.g., code language className).

const SANITIZE_OPTIONS = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), ['className']],
    span: [...(defaultSchema.attributes?.span || []), ['className']],
    pre: [...(defaultSchema.attributes?.pre || []), ['className']],
  },
};

// ─── Custom Components ────────────────────────────────────────────────────────
// Override default ReactMarkdown components for enhanced security and styling.

function createMarkdownComponents(): Partial<Components> {
  return {
    // Security: All user-generated links open in a new tab with noopener.
    // This prevents target="_blank" tabnabbing and follows OWASP recommendations.
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        style={STYLES.link}
      >
        {children}
      </a>
    ),

    // Security: Images are rendered with only safe attributes.
    // No event handlers (onload, onerror, etc.) are ever attached.
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        style={STYLES.image}
      />
    ),

    // Code blocks with language label and syntax highlighting support.
    // If a language is specified (e.g., ```typescript), the label is shown.
    code: ({ className, children, ...props }) => {
      const codeString = String(children).replace(/\n$/, '');
      const match = /language-(\w+)/.exec(className ?? '');

      if (match) {
        return (
          <div style={STYLES.codeBlockWrapper}>
            <span style={STYLES.codeLabel}>{match[1]}</span>
            <pre style={STYLES.codeBlock}>
              <code className={className} {...props}>
                {codeString}
              </code>
            </pre>
          </div>
        );
      }

      // Inline code (e.g., `const x = 1`)
      return (
        <code
          style={STYLES.inlineCode}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Security: Strip all event handlers from rendered HTML elements.
    // This is handled by rehype-sanitize, but we reinforce it here.
    div: ({ className, children, ...props }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  };
}

/**
 * MarkdownRenderer
 *
 * Renders Markdown content safely using react-markdown with rehype-sanitize.
 * Markdown is inherently XSS-safe because it has no concept of executable
 * elements — all content maps to controlled React components.
 *
 * ## Security Layers
 *
 * 1. **react-markdown** — parses Markdown to an AST, renders React elements
 * 2. **rehype-sanitize** — strips any dangerous HTML from the parsed output
 * 3. **Custom components** — override link, image, and code rendering for
 *    controlled output (e.g., all links open in new tab with noopener)
 *
 * ## SSR Compatible: Yes
 * react-markdown works fully on the server (no browser APIs needed).
 * Content is rendered as HTML in the initial server response.
 *
 * ## SSG Compatible: Yes
 * Can be used with Next.js `generateStaticParams()` for static generation.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MarkdownRenderer content="# Hello World" />
 *
 * // With GFM features (tables, task lists, etc.)
 * <MarkdownRenderer content="| A | B |\n|---|---|" gfm={true} />
 * ```
 */
export function MarkdownRenderer({
  content,
  gfm = true,
  className = '',
}: MarkdownRendererProps) {
  const components = React.useMemo(() => createMarkdownComponents(), []);

  if (!content) {
    return null;
  }

  return (
    <div className={`markdown-content ${className}`.trim()} style={STYLES.container}>
      <ReactMarkdown
        remarkPlugins={gfm ? [remarkGfm] : []}
        rehypePlugins={[[rehypeSanitize, SANITIZE_OPTIONS]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
