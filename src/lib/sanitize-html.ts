/**
 * SSR-Safe HTML Sanitization Utility.
 *
 * Uses isomorphic-dompurify which works in both server and client environments.
 * Falls back to a no-op in environments where DOMPurify is unavailable.
 */

import { SANITIZE_CONFIG } from './sanitize-config';
import type DOMPurify from 'dompurify';

let purifyInstance: typeof DOMPurify | null = null;

/**
 * Lazy-loads DOMPurify with SSR compatibility.
 * - Server-side: uses isomorphic-dompurify
 * - Client-side: uses browser dompurify
 */
async function getPurify(): Promise<typeof DOMPurify> {
  if (purifyInstance) return purifyInstance;

  if (typeof window !== 'undefined') {
    // Client-side: use browser DOMPurify
    const dompurify = await import('dompurify');
    purifyInstance = dompurify.default;
  } else {
    // Server-side: use isomorphic-dompurify
    const dompurify = await import('isomorphic-dompurify');
    purifyInstance = dompurify.default as unknown as typeof DOMPurify;
  }

  return purifyInstance;
}

/**
 * Sanitize HTML string for safe rendering (async, SSR-compatible).
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * const clean = await sanitizeHTML(userInput);
 * return <div dangerouslySetInnerHTML={{ __html: clean }} />;
 * ```
 */
export async function sanitizeHTML(html: string): Promise<string> {
  if (!html) return '';

  try {
    const purify = await getPurify();
    const result = purify.sanitize(html, SANITIZE_CONFIG);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error('[sanitizeHTML] DOMPurify sanitization failed:', error);
    return '';
  }
}

/**
 * Synchronous version for use in hooks/memoization.
 * Only works in browser environments.
 */
export function sanitizeHTMLSync(html: string): string {
  if (!html) return '';

  if (typeof window === 'undefined') {
    console.warn(
      '[sanitizeHTMLSync] Called on server. Use sanitizeHTML (async) instead. Returning empty string for safety.'
    );
    return '';
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dompurify = require('dompurify');
    const result = dompurify.sanitize(html, SANITIZE_CONFIG);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error('[sanitizeHTMLSync] DOMPurify sanitization failed:', error);
    return '';
  }
}
