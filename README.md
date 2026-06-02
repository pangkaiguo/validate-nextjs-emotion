# Validate Next.js + Emotion

A comprehensive validation project for **Emotion CSS-in-JS** support in **Next.js** (App Router).

This project validates that Emotion-based component libraries (like MUI with `sx` props, or custom `styled()` components) work correctly with **SSR** (Server-Side Rendering) and **SSG** (Static Site Generation) in Next.js.

## 🎯 Purpose

If you have a component library that uses Emotion for styling, this project proves that:

1. **SSR works** — Emotion styles are extracted on the server and injected into the HTML `<head>` via `<style data-emotion>` tags
2. **SSG works** — Emotion styles are baked into static HTML at build time (no server needed)
3. **No FOUC** — Styles are present in the initial HTML, even before JavaScript loads
4. **Hydration works** — Client-side hydration preserves SSR/SSG styles

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — wraps app with EmotionRegistry
│   ├── page.tsx                # Landing page — feature summary & integration guide
│   ├── ssr-demo/page.tsx       # SSR demo — Server Component rendering Emotion components
│   └── ssg-demo/page.tsx       # SSG demo — static generation with Emotion components
├── components/
│   ├── test-components.tsx     # All Emotion feature tests (css, styled, keyframes, etc.)
│   ├── ssr-demo-card.tsx       # SSR demo card components ("use client" + Emotion)
│   └── ssg-demo-card.tsx       # SSG demo card components ("use client" + Emotion)
└── lib/
    └── emotion-registry.tsx    # 📌 Critical: SSR/SSG bridge using useServerInsertedHTML
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

| Page | Route | Description |
|------|-------|-------------|
| Home | [`/`](http://localhost:3000) | Feature summary & integration guide |
| SSR Demo | [`/ssr-demo`](http://localhost:3000/ssr-demo) | Server Component renders Emotion components |
| SSG Demo | [`/ssg-demo`](http://localhost:3000/ssg-demo) | Static Generation with Emotion components |
| Features | [`/`](http://localhost:3000) | All Emotion API tests (styled, css, keyframes, etc.) |

## 🏗️ Production Build

```bash
npm run build
```

You'll see:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /ssg-demo        # ← (Static) pre-rendered at build time
└ ○ /ssr-demo        # ← (Static) auto-static-optimized
```

All pages are marked **(Static)** — meaning Emotion styles are embedded in the static HTML.

## ✅ How It Works — SSR & SSG with Emotion

### 1. Enable Emotion in Next.js config

```ts
// next.config.ts
const nextConfig: NextConfig = {
  compiler: {
    emotion: true,  // SWC transform for Emotion css prop
  },
};
export default nextConfig;
```

### 2. Add EmotionRegistry (the SSR bridge)

```tsx
// src/lib/emotion-registry.tsx
'use client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const entries = cache.inserted;
    const styles = Object.keys(entries).map((key) => entries[key]);
    if (styles.length === 0) return null;

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

**What this does:**

- Creates an Emotion cache on the server
- Collects styles from Emotion-powered Client Components during SSR/SSG
- Injects `<style data-emotion>` tags into HTML `<head>` **before** the client receives it
- On the client, the same cache is used for hydration (no mismatch)

### 3. Wrap layout with EmotionRegistry

```tsx
// src/app/layout.tsx
import EmotionRegistry from "@/lib/emotion-registry";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  );
}
```

### 4. Create Client Components with Emotion styles

```tsx
// src/components/my-button.tsx
'use client';  // ← Required for Emotion runtime

import styled from '@emotion/styled';

export const MyButton = styled.button`
  background: #0070f3;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;

  &:hover {
    background: #0051a2;
  }
`;
```

### 5. Use them in Server Components (SSR or SSG)

```tsx
// src/app/page.tsx — Server Component (no "use client")
import { MyButton } from "@/components/my-button";

export default function Page() {
  return <MyButton>Click me</MyButton>;
  // ✅ Styles are SSR'd or SSG'd automatically
}
```

## 🧪 Emotion Feature Validation Results

| # | Feature | Code | Status |
|---|---------|------|--------|
| 1 | css prop (object syntax) | `css({ ... })` | ✅ |
| 2 | css prop (template literal) | `css\`...\`` | ✅ |
| 3 | styled components | `styled.div\`...\`` | ✅ |
| 4 | styled with props/variants | `styled.div<{ variant }>` | ✅ |
| 5 | styled composition | `const B = styled(A)\`...\`` | ✅ |
| 6 | keyframes animation | `keyframes\`...\`` | ✅ |
| 7 | Global styles | `<Global styles={...} />` | ✅ |
| 8 | Style composition | `css\`${base} ...\`` | ✅ |
| 9 | Nested selectors | `css\`h4 { ... }\`` | ✅ |
| 10 | Media queries | `@media (min-width: 768px) { ... }` | ✅ |

## 🖥️ SSR / SSG Validation Results

| # | Test | Method | Status |
|---|------|--------|--------|
| 1 | Styles in HTML `<head>` via `<style data-emotion>` | View Page Source | ✅ |
| 2 | SSG: styles baked into static `.html` at build time | `npm run build` + check `.next/` | ✅ |
| 3 | Server Component renders Emotion Client Components | `/ssr-demo` page | ✅ |
| 4 | JavaScript disabled: styles still visible (no FOUC) | DevTools → Disable JS + reload | ✅ |
| 5 | TypeScript support with `css` prop | TypeScript compilation | ✅ |
| 6 | Hydration: styles persist after client hydration | Normal page load | ✅ |

## 🔍 How to Verify SSR/SSG

### Method 1: View Page Source

```bash
curl http://localhost:3000/ssr-demo | grep "data-emotion"
```

Expected output:

```
<style data-emotion="css 355nz sflgah 1x3c4ep ...">
```

### Method 2: Check Static Files (SSG)

```bash
# After npm run build, check that .html files exist:
ls -la .next/server/app/ssg-demo/page/
ls -la .next/server/app/ssr-demo/page/
```

### Method 3: Disable JavaScript

1. Open DevTools → `Cmd+Shift+P` → "Disable JavaScript"
2. Reload the page
3. All styled components should still have full styling

## 📦 Using with External Emotion Libraries (e.g., MUI)

If you're using a component library that uses Emotion internally (like MUI v5 with `sx` prop), the same setup works:

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  compiler: {
    emotion: true,
  },
};

// src/app/page.tsx
'use client';
import Button from '@mui/material/Button';

export default function Page() {
  return (
    <Button sx={{ m: 2, bgcolor: 'primary.main' }}>
      MUI Button with Emotion SSR
    </Button>
  );
}
```

**Important:** For external libraries like MUI, you may also need their own `ThemeProvider` + `CacheProvider` setup. The `EmotionRegistry` in this project handles the SSR injection, but MUI requires additional configuration for server-side class name generation.

## ❓ FAQ

### Why do Emotion components need `"use client"`?

Emotion's `styled()` and `css()` are **runtime JavaScript functions**. They must execute in the browser to handle hydration, dynamic styles, pseudo-classes (`:hover`), animations, and prop-based styling. However:

- **Style extraction** happens on the server (SSR) or at build time (SSG)
- **CSS injection** into `<head>` happens on the server (via `useServerInsertedHTML`)
- **Runtime execution** happens in the browser (via `"use client"`)

This means: **SSR/SSG generates the CSS, `"use client"` hydrates the component**. Both are needed.

### Is there a zero-runtime alternative?

If you want to avoid `"use client"` entirely, consider:

- **Linaria** — Zero-runtime CSS-in-JS (uses build-time extraction)
- **Vanilla Extract** — Type-safe CSS modules with zero runtime
- **CSS Modules** — Built-in Next.js support

But you'll lose runtime features like dynamic prop-based styles and `keyframes`.

### Why `suppressHydrationWarning`?

Browser extensions (Grammarly, etc.) can inject attributes into `<html>`/`<body>` that differ between server and client renders. `suppressHydrationWarning` tells React to ignore these differences.

## 📊 Tech Stack

- **Next.js 16** — App Router
- **React 19**
- **Emotion 11** — `@emotion/react`, `@emotion/styled`, `@emotion/cache`
- **TypeScript** — Full type support for Emotion `css` prop
- **SWC** — Emotion compiler plugin via `next.config.ts`

---

## 📝 License

MIT
