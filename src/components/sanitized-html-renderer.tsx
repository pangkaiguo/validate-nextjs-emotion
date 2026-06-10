'use client';

import React, { useState, useEffect } from 'react';
import { sanitizeHTML, sanitizeHTMLSync } from '@/lib/sanitize-html';

interface SanitizedHTMLRendererProps {
  /**
   * Raw HTML content to sanitize and render.
   * This will be passed through DOMPurify before rendering.
   */
  html: string;

  /**
   * CSS class name for the wrapper div.
   */
  className?: string;

  /**
   * Render mode:
   * - 'auto'  (default): Use async sanitizeHTML() for SSR, fallback to sync
   * - 'ssr'             : Force SSR-compatible async path (content hidden until hydration)
   * - 'client'          : Force client-side sync path (avoids hydration mismatch)
   *
   * @default 'auto'
   */
  mode?: 'auto' | 'ssr' | 'client';
}

/**
 * SanitizedHTMLRenderer
 *
 * Renders user-generated HTML content safely by passing it through DOMPurify
 * before injection. This is the LAST RESORT rendering strategy — prefer
 * StructuredRenderer or MarkdownRenderer whenever possible.
 *
 * When to use:
 * - Legacy CMS content that is stored as HTML
 * - Third-party integrations that return HTML
 * - Migration path to structured content
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║                  SSR BEHAVIOR                            ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║ 1. SSR render: React renders with null content           ║
 * ║ 2. Hydration: Browser receives sanitized HTML            ║
 * ║ 3. Content appears AFTER JS loads + hydrates             ║
 * ║                                                          ║
 * ║ ⚠️  CORS/CSP note: DOMPurify uses DOMParser which may   ║
 * ║    fail in strict CSP environments. Test thoroughly.     ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * @example
 * ```tsx
 * // SSR-safe usage (default)
 * <SanitizedHTMLRenderer html={cmsPage.body} />
 *
 * // Client-only (faster, but SSR renders empty)
 * <SanitizedHTMLRenderer html={cmsPage.body} mode="client" />
 *
 * // Force SSR path with className
 * <SanitizedHTMLRenderer html={cmsPage.body} mode="ssr" className="cms-content" />
 * ```
 */
export function SanitizedHTMLRenderer({
  html,
  className,
  mode = 'auto',
}: SanitizedHTMLRendererProps) {
  // State for SSR-safe content
  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doSanitize() {
      if (mode === 'client') {
        // Client mode: use sync version immediately
        if (!cancelled) {
          setSanitizedHtml(sanitizeHTMLSync(html));
        }
      } else {
        // SSR/auto mode: use async version for server-compatible sanitization
        const clean = await sanitizeHTML(html);
        if (!cancelled) {
          setSanitizedHtml(clean);
        }
      }
    }

    doSanitize();

    return () => {
      cancelled = true;
    };
  }, [html, mode]);

  // SSR render: return null, content appears after hydration
  if (sanitizedHtml === null) {
    return null;
  }

  // Empty after sanitization
  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div
      className={className}
      /**
       * SAFE: Content has been sanitized by DOMPurify with strict allowlists
       * defined in src/lib/sanitize-config.ts. Only safe HTML tags and
       * attributes are allowed. All event handlers and dangerous elements
       * (script, iframe, etc.) are stripped.
       *
       * DOMPurify configuration reference:
       * @see src/lib/sanitize-config.ts
       */
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
