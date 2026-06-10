import React from 'react';
import type { CodeData } from '@/types/content';

interface CodeBlockProps {
  /** Block data from CMS structured content */
  data: Record<string, unknown>;
}

// ─── Style Constants ─────────────────────────────────────────────────────────

const STYLES = {
  wrapper: {
    position: 'relative' as const,
    marginBottom: '1rem',
  },
  pre: {
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: 8,
    overflowX: 'auto' as const,
    fontSize: '0.85rem',
    lineHeight: 1.5,
  } as const,
  languageLabel: {
    position: 'absolute' as const,
    top: 8,
    right: 12,
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'uppercase' as const,
  },
  lineNumber: {
    color: '#555',
    marginRight: 16,
    userSelect: 'none' as const,
    display: 'inline-block' as const,
    width: 24,
  },
} as const;

/**
 * CodeBlock
 *
 * Renders a code block with optional language label and line numbers
 * for the Structured Content rendering strategy.
 *
 * ## Security Model
 *
 * The `code` value is rendered as a React text node inside <pre>/<code>
 * elements. React automatically escapes all HTML entities, preventing
 * any embedded markup or script execution.
 *
 * ## SSR Compatible: Yes
 * ## SSG Compatible: Yes
 *
 * @example
 * ```tsx
 * <CodeBlock data={{
 *   language: 'typescript',
 *   code: 'const x: number = 42;',
 *   showLineNumbers: true,
 * }} />
 * ```
 */
export function CodeBlock({ data }: CodeBlockProps) {
  const { language, code, showLineNumbers = false } = data as unknown as CodeData;

  if (!code) {
    return null;
  }

  const renderLineNumbers = (codeString: string) => {
    const lines = codeString.split('\n');
    return lines.map((line: string, index: number) => (
      <React.Fragment key={index}>
        <span style={STYLES.lineNumber}>
          {String(index + 1).padStart(2, ' ')}
        </span>
        {line}
        {'\n'}
      </React.Fragment>
    ));
  };

  return (
    <div style={STYLES.wrapper}>
      {language && (
        <span style={STYLES.languageLabel}>{language}</span>
      )}
      <pre style={STYLES.pre}>
        <code>
          {showLineNumbers ? renderLineNumbers(code) : code}
        </code>
      </pre>
    </div>
  );
}
