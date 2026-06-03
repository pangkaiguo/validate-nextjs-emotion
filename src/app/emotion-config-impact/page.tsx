'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

// ============================================================
// 🎯 This page demonstrates the impact of `compiler.emotion: true`
//    in next.config.ts on Emotion components.
//
// ✅ With `compiler.emotion: true`  → Everything works
// ❌ Without it                     → css prop breaks, styled() works
//
// Try it: comment out `emotion: true` in next.config.ts,
// then run `npm run dev` and visit this page.
// ============================================================

// --- CSS Variable helpers for consistent visuals ---
const colors = {
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  bg: '#f8f9fa',
  border: '#dee2e6',
};

// ======================================================
// ✅ WORKS WITHOUT compiler.emotion:
//    styled() is a runtime function — it always runs.
// ======================================================
const Card = styled.div<{ $borderColor: string }>`
  background: white;
  border: 3px solid ${(props) => props.$borderColor};
  border-radius: 12px;
  padding: 24px;
  margin: 12px 0;
  font-family: system-ui, sans-serif;
`;

const Label = styled.span<{ $bg: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${(props) => props.$bg};
  color: white;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #333;
`;

const Desc = styled.p`
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
`;

// ======================================================
// ❌ FAILS WITHOUT compiler.emotion:
//    The `css` prop requires the SWC compiler to transform
//    `<div css={...} />` into valid JSX.
//    Without it, you get: "Unrecognized prop: css"
// ======================================================

const codeStyle = {
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

export default function EmotionConfigImpact() {
  // This styled() call works regardless of config
  // It is a runtime JS function call — no compiler transform needed.
  const WorksAlways = styled.p`
    color: ${colors.success};
    font-weight: 700;
    font-size: 1rem;
    padding: 8px;
    background: #e8f5e9;
    border-radius: 6px;
  `;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: 8 }}>
        ⚙️ Emotion Config Impact Demo
      </h1>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
        Toggle <code>compiler.emotion</code> in{' '}
        <code>next.config.ts</code> and see which parts break.
      </p>

      {/* ── 1. styled() API — Always Works ── */}
      <Card $borderColor={colors.success}>
        <Label $bg={colors.success}>✅ styled() API</Label>
        <Title>styled.div — Runtime Function</Title>
        <Desc>
          <code>styled.div</code> is a plain JavaScript function call.
          It executes at runtime and <strong>always works</strong>,
          regardless of <code>compiler.emotion</code>.
        </Desc>
        <WorksAlways>✓ This component renders with or without emotion compiler</WorksAlways>
        <pre style={codeStyle}>
          {`// ✅ Always works — no compiler transform needed
const Card = styled.div\`
  border: 3px solid \${props => props.$borderColor};
  border-radius: 12px;
\`;`}
        </pre>
      </Card>

      {/* ── 2. css prop — Only With compiler.emotion ── */}
      {/* 🚨 If you comment out compiler.emotion, this block will crash */}
      <Card $borderColor={colors.danger}>
        <Label $bg={colors.danger}>❌ css prop</Label>
        <Title>css prop — SWC Compiler Required</Title>
        <Desc>
          <code>css prop</code> (<code>{"<div css={...} />"}</code>) is{' '}
          <strong>not valid JSX</strong>. It requires the Emotion SWC
          compiler (in <code>next.config.ts</code>) to transform it
          into <code>{'<div className={...} />'}</code>.
        </Desc>

        {/* 🚨 This exact code breaks without compiler.emotion: true */}
        <p
          css={css`
            color: ${colors.danger};
            font-weight: 700;
            font-size: 1rem;
            padding: 8px;
            background: #fbe9e7;
            border-radius: 6px;
            margin-bottom: 12px;
          `}
        >
          🚫 Without compiler.emotion, this text has no red background!
          The browser console shows: &ldquo;Warning: React does not
          recognize the `css` prop on a DOM element&rdquo;
        </p>

        <pre style={codeStyle}>
          {`// 🚨 BREAKS without compiler.emotion:
// "Unrecognized prop: css" error in console

\`import { css } from '@emotion/react';\`

<p css={css\`
  color: \${colors.danger};
  background: #fbe9e7;
  border-radius: 6px;
\`}>This breaks without the compiler</p>`}
        </pre>
      </Card>

      {/* ── 3. Combined Example ── */}
      <Card $borderColor={colors.warning}>
        <Label $bg={colors.warning}>⚠️ Combined Demo</Label>
        <Title>What Happens When css Prop Fails?</Title>
        <Desc>
          When <code>compiler.emotion</code> is off, the <code>css</code> prop is
          passed as an unknown DOM attribute. React logs a warning and{' '}
          <strong>ignores it</strong> — no styling applied. But{' '}
          <code>styled()</code> components nearby continue to work fine.
        </Desc>
        <div
          css={css`
            background: #fff3cd;
            border: 2px solid ${colors.warning};
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 0.85rem;
          `}
        >
          <strong>With compiler:</strong> This box has a yellow background and
          warning border ✅
          <br />
          <strong>Without compiler:</strong> This box has no background/border —
          the entire <code>css</code> prop is discarded 🚫
        </div>
        <pre style={codeStyle}>
          {`// This mix works fine WITH compiler, but ONLY styled() works WITHOUT
const Heading = styled.h2\` font-size: 1.2rem; \`;  // ✅ Always

return (
  <>
    <Heading>Always works</Heading>
    <div css={css\` color: red; \`}>May crash</div>  {/* 🚫 */}
  </>
);`}
        </pre>
      </Card>

      {/* ── 4. Quick Config Check ── */}
      <Card $borderColor={colors.info}>
        <Label $bg={colors.info}>🔧 Your Config</Label>
        <Title>next.config.ts Check</Title>
        <Desc>
          Open <code>next.config.ts</code> and check if{' '}
          <code>compiler.emotion</code> is set:
        </Desc>
        <pre style={codeStyle}>
          {`// next.config.ts
const nextConfig: NextConfig = {
  compiler: {
    emotion: true,     // ← Must be true for css prop
    styledComponents: true,  // ← For styled-components SSR
  },
};`}
        </pre>
        <Desc>
          Both settings are <strong>compile-time only</strong> — zero runtime
          overhead. They instruct the SWC compiler to transform the JSX
          before React runs.
        </Desc>
      </Card>
    </div>
  );
}
