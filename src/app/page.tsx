'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ClientPerformanceMonitor } from "@/components/perf-monitor-client";

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.8rem;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const NavCard = styled.div<{ gradient: string }>`
  background: ${(props) => props.gradient};
  border-radius: 16px;
  padding: 32px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: block;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const NavTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 1.6rem;
`;

const NavDesc = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const NavTag = styled.span<{ bg: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => props.bg};
  color: white;
  margin-bottom: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.4rem;
  border-bottom: 2px solid #0070f3;
  padding-bottom: 8px;
  margin-bottom: 24px;
`;

const TestItem = styled.li<{ pass: boolean }>`
  padding: 12px 16px;
  background: ${(props) => (props.pass ? '#f0fff4' : '#fff5f5')};
  border: 1px solid ${(props) => (props.pass ? '#b7eb8f' : '#feb2b2')};
  border-radius: 8px;
  margin-bottom: 8px;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${(props) => (props.pass ? '#2d6a4f' : '#c53030')};
`;

const TestList = styled.ul`
  padding: 0;
  margin: 0;
`;

export default function Home() {
  return (
    <Container>
      <Title>{'\u{1F9EA}'} Next.js + Emotion Validation</Title>
      <Subtitle>
        A comprehensive validation project for Emotion CSS-in-JS support in Next.js
        (App Router) — covering SSR, SSG, and all major Emotion features.
      </Subtitle>

      {/* Navigation Cards */}
      <Grid>
        <a href="/ssr-demo" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{1F5A5}\uFE0F'} Server Component
            </NavTag>
            <NavTitle>SSR Demo</NavTitle>
            <NavDesc>
              See how Emotion styles are extracted on the server and injected into
              the HTML {'<head>'}. Verify with View Page Source.
            </NavDesc>
          </NavCard>
        </a>

        <a href="/ssg-demo" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{1F4E6}'} Static Generation
            </NavTag>
            <NavTitle>SSG Demo</NavTitle>
            <NavDesc>
              Emotion styles pre-rendered at build time into static HTML. No server
              needed — works with CDN deployment.
            </NavDesc>
          </NavCard>
        </a>

        <a href="/styled-components-demo" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #7928ca 0%, #ff0080 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{1F49C}'} Official Support
            </NavTag>
            <NavTitle>Styled-Components Demo</NavTitle>
            <NavDesc>
              See why styled-components is the recommended CSS-in-JS solution for
              Next.js App Router — with first-class SSR/SSG support.
            </NavDesc>
          </NavCard>
        </a>

        <a href="/emotion-config-impact" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{2699}\uFE0F'} Emotion Config
            </NavTag>
            <NavTitle>Emotion Config Impact</NavTitle>
            <NavDesc>
              See what happens when <code>compiler.emotion</code> is missing
              — css prop breaks, styled() survives. Hands-on config troubleshooting.
            </NavDesc>
          </NavCard>
        </a>

        <a href="/sc-config-impact" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{1F3AD}'} SC Config
            </NavTag>
            <NavTitle>Styled-Components Config Impact</NavTitle>
            <NavDesc>
              Live detection of <code>compiler.styledComponents</code> impact.
              Renders real SC components & detects SSR class name mismatches.
              Toggle config and see hydration errors in real time.
            </NavDesc>
          </NavCard>
        </a>

        <a href="/sx-prop-demo" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #667eea 0%, #11998e 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{1F3A8}'} sx Prop
            </NavTag>
            <NavTitle>MUI sx Prop SSR/SSG Validation</NavTitle>
            <NavDesc>
              Validates MUI-style <code>{'sx={{ ... }}'}</code> runtime pattern.
              Confirms sx works with SSR/SSG <strong>without</strong> compiler.emotion.
              Includes config impact matrix.
            </NavDesc>
          </NavCard>
        </a>

        <a href="/" style={{ textDecoration: 'none' }}>
          <NavCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <NavTag bg="rgba(255,255,255,0.25)">
              {'\u{1F3AD}'} Feature Tests
            </NavTag>
            <NavTitle>Emotion Features</NavTitle>
            <NavDesc>
              Comprehensive test of all Emotion APIs: css prop, styled, keyframes,
              Global, composition, nesting, media queries.
            </NavDesc>
          </NavCard>
        </a>
      </Grid>

      {/* Test Summary */}
      <SectionTitle>{'\u{2705}'} Emotion Feature Validation Results</SectionTitle>
      <TestList>
        <TestItem pass={true}>
          {'\u2705'} css prop (object syntax) — <code>css({'{ ... }'})</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} css prop (template literal) — <code>css`...`</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} styled components — <code>styled.div`...`</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} styled with props/variants — <code>styled.div{'\u003C'}{'{ variant }'}{'\u003E'}</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} styled composition — <code>const B = styled(A)`...`</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} keyframes animation — <code>keyframes`...`</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} Global styles — <code>{'<Global styles={...} />'}</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} Style composition — <code>css`{'${base}'} ...`</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} Nested selectors — <code>css`{'{ h4 { ... } }'}`</code>
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} Media queries — <code>@media (min-width: 768px) {'{ ... }'}</code>
        </TestItem>
      </TestList>

      <SectionTitle>{'\u{1F4A1}'} SSR / SSG Validation Results</SectionTitle>
      <TestList>
        <TestItem pass={true}>
          {'\u2705'} SSR: Emotion styles in HTML {'<head>'} via {'<style data-emotion>'}
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} SSG: Emotion styles baked into static HTML at build time
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} Server Component renders Emotion Client Components
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} JavaScript disabled: styles still visible (no FOUC)
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} TypeScript support with css prop type declarations
        </TestItem>
        <TestItem pass={true}>
          {'\u2705'} Hydration: styles persist after client hydration
        </TestItem>
      </TestList>

      {/* How to Use Component Libraries Section */}
      <SectionTitle>{'\u{1F3E0}'} Using Emotion-based Component Libraries</SectionTitle>
      <div
        css={css`
          background: #f0f8ff;
          border: 2px solid #0070f3;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          font-size: 0.95rem;
          line-height: 1.7;
        `}
      >
        <p css={{ margin: '0 0 12px 0', fontWeight: 700, color: '#0070f3' }}>
          If you have a component library that uses Emotion (like MUI sx props, or custom
          styled components), here's how to make it work with Next.js SSR/SSG:
        </p>

        <h4 css={{ margin: '0 0 8px 0' }}>Step 1: Enable Emotion in next.config.ts</h4>
        <pre
          css={css`
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            overflow-x: auto;
            margin-bottom: 16px;
          `}
        >
          {`// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    emotion: true,  // Enable Emotion SWC transform
  },
};

export default nextConfig;`}
        </pre>

        <h4 css={{ margin: '0 0 8px 0' }}>Step 2: Add EmotionRegistry (SSR bridge)</h4>
        <pre
          css={css`
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            overflow-x: auto;
            margin-bottom: 16px;
          `}
        >
          {`// src/lib/emotion-registry.tsx
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
    const entries = cache.inserted;
    const styles = Object.keys(entries).map((key) => entries[key]);
    if (styles.length === 0) return null;

    return (
      <style
        data-emotion={\`\${cache.key} \${Object.keys(entries).join(' ')}\`}
        dangerouslySetInnerHTML={{ __html: styles.join('') }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}`}
        </pre>

        <h4 css={{ margin: '0 0 8px 0' }}>Step 3: Wrap layout with EmotionRegistry</h4>
        <pre
          css={css`
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            overflow-x: auto;
            margin-bottom: 16px;
          `}
        >
          {`// src/app/layout.tsx
import EmotionRegistry from "@/lib/emotion-registry";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  );
}`}
        </pre>

        <h4 css={{ margin: '0 0 8px 0' }}>Step 4: Use your Emotion components</h4>
        <pre
          css={css`
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            overflow-x: auto;
            margin-bottom: 16px;
          `}
        >
          {`// src/app/page.tsx (Server Component)
import { YourLibraryButton, YourLibraryCard } from "your-emotion-library";

export default function Page() {
  return (
    <div>
      <YourLibraryButton variant="contained">Click me</YourLibraryButton>
      <YourLibraryCard sx={{ padding: 2, backgroundColor: 'primary.main' }}>
        Content
      </YourLibraryCard>
    </div>
  );
}

// ✅ SSR: Styles injected into HTML <head>
// ✅ SSG: Styles baked into static HTML at build time
// ✅ Hydration: Styles persist after JS loads`}
        </pre>

        <p
          css={css`
            margin: 16px 0 0 0;
            color: #666;
            font-style: italic;
          `}
        >
          {'\u{1F4D6}'} That's it! The three steps above are all you need. Emotion styles
          from your component library will be automatically SSR'd and SSG'd by Next.js.
        </p>
      </div>

      {/* Performance Metrics (Home Page - Client Component) */}
      <SectionTitle>{'\u{1F4CA}'} Performance Metrics (Home Page)</SectionTitle>
      <p
        css={css`
          color: #555;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 20px;
        `}
      >
        Real-time performance measurements collected from the browser's
        Performance API. This home page is a {"'use client'"} component
        with the Emotion runtime enabled. All styled components below use
        Emotion's styled and css APIs.
      </p>
      <ClientPerformanceMonitor />

      {/* Footer */}
      <footer
        css={css`
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 0.9rem;
          border-top: 1px solid #eaeaea;
          margin-top: 40px;
        `}
      >
        <p>
          Next.js {16} + Emotion {11} Validation Suite
        </p>
        <p css={{ marginTop: '4px' }}>
          SSR {'\u2705'} | SSG {'\u2705'} | Client Components {'\u2705'} | TypeScript{' '}
          {'\u2705'}
        </p>
      </footer>
    </Container>
  );
}
