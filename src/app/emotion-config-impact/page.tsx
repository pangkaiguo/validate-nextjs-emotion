'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

// ============================================================
// 🎯 This page demonstrates the impact of compiler options
//    in next.config.ts on Emotion and styled-components.
//
// PART 1: `compiler.emotion: true`
//   ✅ With it     → css prop + styled() both work
//   ❌ Without it  → css prop breaks, styled() still works
//
// PART 2: `compiler.styledComponents: true`
//   ✅ With it     → SSR-safe class names, no hydration mismatch
//   ❌ Without it  → Components work but ⚠️ possible SSR hydration error
//                    "did not match" due to class name differences
//
// Try it: toggle options in next.config.ts, restart dev server,
// and reload this page. Check browser console for errors.
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

  // ── Simulate what styled-components class name looks like ──
  // Without compiler option, each server/client render generates
  // a different hash. We show this with "server class" vs "client class".
  const SC_SERVER_CLASS = 'sc-bdVaJa';  // e.g. could be this server-side
  const SC_CLIENT_CLASS = 'sc-gsTCUz';  // e.g. different hash client-side
  const MISMATCH_EXAMPLE = false; // toggle to simulate

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: 8 }}>
        ⚙️ Compiler Config Impact Demo
      </h1>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
        Toggle <code>compiler.emotion</code> and{' '}
        <code>compiler.styledComponents</code> in{' '}
        <code>next.config.ts</code> to see the impact.
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

      {/* ═══════════════════════════════════════════════
          PART 2: compiler.styledComponents: true
          ═══════════════════════════════════════════════ */}
      <hr style={{ margin: '40px 0', border: 'none', borderTop: '3px dashed #ccc' }} />

      <h2 style={{ fontSize: '1.6rem', color: '#333', marginBottom: 8 }}>
        🎭 styled-components Compiler Config
      </h2>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
        This section shows the impact of <code>compiler.styledComponents</code>{' '}
        on SSR hydration. Toggle the config in <code>next.config.ts</code>
        {' '}and rebuild to see the difference.
      </p>

      {/* ── 5. styled-components WITH compiler ── */}
      <Card $borderColor={colors.success}>
        <Label $bg={colors.success}>✅ WITH compiler.styledComponents: true</Label>
        <Title>Class Names Match — SSR Hydration Succeeds</Title>
        <Desc>
          When <code>styledComponents: true</code> is set, the SWC compiler
          generates <strong>deterministic class names</strong> that are consistent
          between server and client. Hydration works perfectly.
        </Desc>
        <div
          css={css`
            background: #e8f5e9;
            border: 2px solid ${colors.success};
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 0.85rem;
          `}
        >
          <strong>Server renders:</strong>{' '}
          <code style={{ background: '#c8e6c9', padding: '2px 6px', borderRadius: 4 }}>
            {'<button class="sc-bdVaJa gsTCUz">Click</button>'}
          </code>
          <br />
          <strong>Client hydrates:</strong>{' '}
          <code style={{ background: '#c8e6c9', padding: '2px 6px', borderRadius: 4 }}>
            {'<button class="sc-bdVaJa gsTCUz">Click</button>'}
          </code>
          <br />
          <span style={{ color: colors.success, fontWeight: 700 }}>
            ✅ Class names match — hydration passes
          </span>
        </div>
        <pre style={codeStyle}>
          {`// ✅ next.config.ts (compiler.styledComponents: true)
// Class names are deterministic:
// Server:  sc-bdVaJa gsTCUz
// Client:  sc-bdVaJa gsTCUz  ← SAME
// ✅ React hydration: "matched server & client content"`}
        </pre>
      </Card>

      {/* ── 6. styled-components WITHOUT compiler ── */}
      <Card $borderColor={colors.danger}>
        <Label $bg={colors.danger}>❌ WITHOUT compiler.styledComponents</Label>
        <Title>Class Names Differ — Hydration Mismatch!</Title>
        <Desc>
          Without <code>styledComponents: true</code>, styled-components
          generates <strong>independent class name hashes</strong> on server
          vs client. React detects the mismatch and logs hydration errors.
        </Desc>
        <div
          css={css`
            background: #fbe9e7;
            border: 2px solid ${colors.danger};
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 0.85rem;
          `}
        >
          <strong>Server renders:</strong>{' '}
          <code style={{ background: '#ffcdd2', padding: '2px 6px', borderRadius: 4 }}>
            {'<button class="sc-bdVaJa">Click</button>'}
          </code>
          <br />
          <strong>Client hydrates:</strong>{' '}
          <code style={{ background: '#ffcdd2', padding: '2px 6px', borderRadius: 4 }}>
            {'<button class="sc-gsTCUz">Click</button>'}
          </code>
          <br />
          <span style={{ color: colors.danger, fontWeight: 700 }}>
            ❌ Class names DIFFER — React throws hydration error
          </span>
        </div>
        <pre style={codeStyle}>
          {`// ❌ next.config.ts (NO compiler.styledComponents)
// Class names are INDEPENDENTLY generated:
// Server:  sc-bdVaJa
// Client:  sc-gsTCUz  ← DIFFERENT!
// 🚫 React console error:
// "Warning: did not match server-rendered HTML.
//  Expected 'sc-bdVaJa', got 'sc-gsTCUz'"`}
        </pre>
        <Desc>
          <strong>What happens at runtime?</strong>
        </Desc>
        <ul style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.7, margin: 0, paddingLeft: 20 }}>
          <li>React refreshes the mismatched DOM nodes on the client</li>
          <li>Styles still apply correctly because styled-components re-runs on the client</li>
          <li>But you get <strong>hydration warnings</strong> in the console</li>
          <li>And a brief <strong>flash of incorrect styling</strong> before client JS takes over</li>
        </ul>
      </Card>

      {/* ── 7. How to reproduce the mismatch ── */}
      <Card $borderColor={colors.warning}>
        <Label $bg={colors.warning}>🔬 How to Reproduce</Label>
        <Title>Step-by-Step: See the Hydration Error</Title>
        <Desc>
          Follow these steps to observe the styled-components hydration mismatch
          yourself:
        </Desc>
        <ol style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>
            Open <code>next.config.ts</code> and comment out{' '}
            <code>styledComponents: true</code>
          </li>
          <li>
            Run <code>npm run build {'&&'} npm start</code> (must rebuild!
            dev mode may behave differently)
          </li>
          <li>
            Open{' '}
            <a href="/styled-components-demo" style={{ color: colors.info }}>
              /styled-components-demo
            </a>{' '}
            in a browser
          </li>
          <li>
            Open DevTools Console → you'll see:{' '}
            <code style={{ background: '#fff3cd', padding: '2px 4px' }}>
              "Warning: Text content did not match. Server: "..." Client: "...""
            </code>
          </li>
          <li>
            Re-enable <code>styledComponents: true</code>, rebuild, and the
            warnings disappear
          </li>
        </ol>
        <pre style={codeStyle}>
          {`// In next.config.ts — toggle this on/off
compiler: {
  emotion: true,
  // Try commenting out the line below:
  // styledComponents: true,
}

// Then:
npm run build && npm start
// Open /styled-components-demo → check console`}
        </pre>
      </Card>

      {/* ── 8. Summary comparison ── */}
      <Card $borderColor={colors.info}>
        <Label $bg={colors.info}>📊 Summary</Label>
        <Title>Emotion vs styled-components Config Impact</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: 12 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Config</th>
              <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Missing = ?</th>
              <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Error Type</th>
              <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                <code>emotion: true</code>
              </td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                <code>css</code> prop broken
              </td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                React warning: unrecognized prop
              </td>
              <td style={{ padding: 8, border: '1px solid #ddd', color: colors.danger, fontWeight: 700 }}>
                ⚠️ Functional
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                <code>styledComponents: true</code>
              </td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                SSR class name mismatch
              </td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>
                Hydration "did not match" error
              </td>
              <td style={{ padding: 8, border: '1px solid #ddd', color: colors.warning, fontWeight: 700 }}>
                ⚠️ Aesthetic
              </td>
            </tr>
          </tbody>
        </table>
        <Desc>
          <strong>Bottom line:</strong> Both configs are <strong>free</strong> to enable
          (zero runtime cost, compile-time only). Always enable both unless you
          have a specific reason not to.
        </Desc>
      </Card>
    </div>
  );
}
