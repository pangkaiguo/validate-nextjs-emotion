'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

// sx Prop SSR/SSG Validation
// Shows MUI-style sx patterns vs Emotion css prop,
// and their relationship with compiler config.

const COLORS = {
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  purple: '#7928ca',
  pink: '#ff0080',
};

// styled components
const Card = styled.div<{ $borderColor: string }>`
  background: white;
  border: 3px solid ${(props) => props.$borderColor};
  border-radius: 12px;
  padding: 24px;
  margin: 12px 0;
  font-family: system-ui, sans-serif;
`;

const Badge = styled.span<{ $bg: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => props.$bg};
  color: white;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 8px;
  border-bottom: 2px solid #7928ca;
  padding-bottom: 8px;
  margin-top: 40px;
`;

const codePre = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '0.8rem',
  fontFamily: 'monospace',
  overflowX: 'auto' as const,
  whiteSpace: 'pre-wrap' as const,
  marginBottom: '12px',
};

export default function SxPropDemo() {
  // Runtime css() calls — simulates MUI sx processing
  const runtimeRed = css({ color: '#dc3545', fontWeight: 700 });
  const runtimeBlue = css({ color: '#2563eb', fontWeight: 700 });
  const runtimeGreen = css({ color: '#28a745', fontWeight: 700 });
  const runtimePurple = css({ color: '#7928ca', fontWeight: 700 });

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: 8 }}>
        sx Prop SSR/SSG Validation
      </h1>
      <p style={{ color: '#666', marginBottom: 8, lineHeight: 1.6 }}>
        MUI-style <code>{'sx={{ ... }}'}</code> props work differently from
        Emotion's <code>css</code> prop. This page validates their SSR/SSG
        behavior and their relationship with Next.js compiler config.
      </p>

      {/* Key Insight Banner */}
      <div
        css={css`
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          color: #856404;
          line-height: 1.6;
        `}
      >
        <strong style={{ fontSize: '1rem' }}>Key Insight</strong>
        <br />
        MUI's <code>sx</code> prop is a <strong>runtime feature</strong>.
        It calls Emotion's <code>css()</code> function at runtime to
        generate class names. This means:
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <code>sx</code> works <strong>regardless</strong> of{' '}
            <code>compiler.emotion</code>
          </li>
          <li>
            SSR/SSG support depends on <strong>EmotionRegistry</strong>
            (CacheProvider), not on compiler settings
          </li>
          <li>
            Emotion's <code>css</code> prop (<code>{'<div css={...} />'}</code>)
            <strong>does</strong> need the SWC compiler transform
          </li>
        </ul>
      </div>

      {/* Section 1: sx vs css prop */}
      <SectionTitle>1. sx vs css Prop — Compiler Dependency</SectionTitle>

      <Card $borderColor={COLORS.success}>
        <Badge $bg={COLORS.success}>sx runtime — NO compiler needed</Badge>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>MUI-style sx Prop (Runtime)</h3>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem' }}>
          MUI's <code>sx</code> calls Emotion's <code>css()</code> at runtime.{' '}
          Works <strong>without</strong> any SWC compiler transform.
          SSR/SSG works via Emotion's CacheProvider.
        </p>

        <div css={runtimeRed} style={{ marginBottom: 8 }}>
          Runtime css() simulates how MUI processes sx prop.
        </div>
        <div css={runtimeBlue} style={{ marginBottom: 8 }}>
          Multiple runtime css() calls — all work without compiler.
        </div>
        <div css={runtimeGreen} style={{ marginBottom: 8 }}>
          SSR/SSG: styles extracted by EmotionRegistry into head.
        </div>

        <pre style={codePre}>
          {`// MUI internal sx processing (simplified):
// <Button sx={{ color: 'red' }}>
//   ↓ MUI calls at RUNTIME:
// css({ color: 'red' }) → className
//
// ✅ No compiler.emotion needed
// ✅ SSR works via CacheProvider`}
        </pre>
      </Card>

      <Card $borderColor={COLORS.warning}>
        <Badge $bg={COLORS.warning}>css prop — COMPILER required</Badge>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Emotion css Prop — Needs SWC Transform</h3>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem' }}>
          Using <code>css</code> directly as a JSX prop requires the SWC
          compiler to transform it. Without{' '}
          <code>compiler.emotion: true</code>, it becomes an unrecognized
          DOM prop.
        </p>

        <div
          css={css`
            color: ${COLORS.warning};
            font-weight: 700;
            background: #fff8e1;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
          `}
        >
          This uses css prop as JSX attribute — needs compiler.emotion: true
        </div>

        <pre style={codePre}>
          {`// ❌ This NEEDS compiler.emotion: true
import { css } from '@emotion/react';

// NOT valid JSX — needs SWC transform:
<div css={css\`
  color: #ffc107;
\`}>Requires compiler</div>

// After SWC transform:
<div className={generatedName}>

// Without compiler: React warning
// "Unrecognized prop: css"`}
        </pre>
      </Card>

      {/* Section 2: SSR/SSG Validation */}
      <SectionTitle>2. SSR/SSG Validation</SectionTitle>

      <Card $borderColor={COLORS.info}>
        <Badge $bg={COLORS.info}>SSR/SSG Test</Badge>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          Verify Styles in Page Source
        </h3>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem' }}>
          All styles below are rendered at build time (SSG). Use{' '}
          <strong>View Page Source</strong> to confirm style tags.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          <div style={{ background: '#f0fff4', border: '2px solid #b7eb8f', borderRadius: 8, padding: 12 }}>
            <Badge $bg={COLORS.success}>styled()</Badge>
            <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
              styled.div — SSR/SSG always works. No compiler needed.
            </div>
          </div>

          <div style={{ background: '#e8f4fd', border: '2px solid #0070f3', borderRadius: 8, padding: 12 }}>
            <Badge $bg={COLORS.info}>css() runtime + className</Badge>
            <div css={runtimePurple} style={{ marginTop: 8, fontSize: '0.9rem' }}>
              css() at runtime — SSR/SSG works via EmotionRegistry.
            </div>
          </div>

          <div
            css={css`
              background: #fce4ec;
              border: 2px solid ${COLORS.pink};
              border-radius: 8px;
              padding: 12px;
            `}
          >
            <Badge $bg={COLORS.pink}>css prop</Badge>
            <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
              css prop — SSR/SSG works WITH compiler.emotion: true.
            </div>
          </div>
        </div>

        <pre style={codePre}>
          {`// View Page Source should show:
// <style data-emotion="css">
//   .css-1a2b3c { color: #28a745; }
//   .css-4d5e6f { color: #7928ca; }
//   .css-7g8h9i { background: #fce4ec; }
// </style>
// All three methods produce styles in <head>
// Only Method 3 (css prop) needs compiler.emotion`}
        </pre>
      </Card>

      {/* Section 3: Config Impact Matrix */}
      <SectionTitle>3. Config Impact Matrix</SectionTitle>

      <Card $borderColor={COLORS.purple}>
        <Badge $bg={COLORS.purple}>Impact Matrix</Badge>
        <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
          How Each Syntax Relates to Compiler Config
        </h3>

        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'left' }}>Syntax</th>
                <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'left' }}>Used By</th>
                <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>Needs emotion: true</th>
                <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>SSR/SSG</th>
                <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>Mechanism</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{'sx={{ color: "red" }}'}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>MUI</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>No</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>Yes</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>Runtime css() + CacheProvider</td>
              </tr>
              <tr>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>css() at runtime (object)</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>Emotion</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>No</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>Yes</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>Runtime css() assigned to variable</td>
              </tr>
              <tr>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{'<div css={...} />'} (JSX prop)</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>Emotion</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#f8d7da' }}>Yes</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>Yes</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>SWC compile-time transform + CacheProvider</td>
              </tr>
              <tr>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>styled.div</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>Emotion / SC</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>No</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center', background: '#d4edda' }}>Yes</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>Runtime function + CacheProvider</td>
              </tr>
            </tbody>
          </table>
        </div>

        <pre style={codePre}>
          {`// next.config.ts — complete configuration
const nextConfig: NextConfig = {
  compiler: {
    emotion: true,          // For Emotion JSX css prop
    styledComponents: true, // For styled-components SSR class names
  },
};
// Both are compile-time only — zero runtime cost`}
        </pre>
      </Card>

      {/* Section 4: MUI sx with SSR */}
      <SectionTitle>4. MUI sx + SSR — Real Scenario</SectionTitle>

      <Card $borderColor={COLORS.purple}>
        <Badge $bg={COLORS.purple}>Real MUI Behavior</Badge>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          How MUI sx Works with SSR
        </h3>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem' }}>
          When using <code>@mui/material</code> in Next.js:
        </p>

        <ol style={{ lineHeight: 2, color: '#555', paddingLeft: 20, margin: '0 0 12px 0' }}>
          <li>
            MUI wraps your app in <code>{'<ThemeProvider>'}</code> +{' '}
            <code>{'<CacheProvider>'}</code> (Emotion)
          </li>
          <li>
            Server renders <code>{'<Button sx={{ color: "red" }}>'}</code>
            {' '}— MUI calls <code>css({'{{ color: "red" }}'})</code> at runtime
          </li>
          <li>
            Emotion stores generated class in cache
          </li>
          <li>
            <code>useServerInsertedHTML</code> injects styles into head
          </li>
          <li>
            Client hydrates — same class name, no mismatch
          </li>
        </ol>

        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16, fontSize: '0.85rem', color: '#555' }}>
          <strong>Bottom Line:</strong> MUI's <code>sx</code> prop works for
          SSR/SSG regardless of <code>compiler.emotion</code>. It processes
          styles at runtime through Emotion's <code>css()</code> function.
          The <code>compiler.emotion</code> config only affects the direct
          <code>{' <div css={...} />'}</code> JSX prop syntax.
        </div>
      </Card>

      {/* Section 5: Summary */}
      <SectionTitle>5. Summary</SectionTitle>

      <Card $borderColor={COLORS.info}>
        <Badge $bg={COLORS.info}>Key Takeaways</Badge>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          sx Prop & Emotion Config — What You Need to Know
        </h3>

        <ul style={{ lineHeight: 2, color: '#555', paddingLeft: 20, margin: 0 }}>
          <li>
            <strong>MUI sx prop</strong> = runtime css() call
            → no compiler dependency → works with SSR/SSG
          </li>
          <li>
            <strong>Emotion css prop</strong> = JSX transform
            → needs compiler.emotion for SSR/SSG
          </li>
          <li>
            <strong>styled()</strong> = runtime function
            → no compiler dependency → always works with SSR/SSG
          </li>
          <li>
            <strong>EmotionRegistry</strong> is key to SSR/SSG
            for ALL Emotion-based styles (sx, styled, css)
          </li>
          <li>
            <strong>compiler.emotion</strong> only affects JSX css prop
            — it's free to enable
          </li>
        </ul>
      </Card>

      {/* Footer */}
      <div style={{ marginTop: 32, padding: 16, background: '#f8f9fa', borderRadius: 8, fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        <strong>Try this:</strong> Open View Page Source and search for{' '}
        <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>data-emotion</code>
        {' '}— all styles are pre-rendered at build time.
      </div>
    </div>
  );
}
