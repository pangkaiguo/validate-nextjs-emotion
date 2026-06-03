'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';

/**
 * MUI sx Prop Simulation — Client Component
 *
 * This component simulates how MUI processes the `sx` prop internally.
 * MUI calls Emotion's `css()` at runtime and assigns the generated class name.
 *
 * WHY this needs to be a Client Component:
 *   - MUI sx is a runtime feature — it calls css() during render
 *   - EmotionRegistry + useServerInsertedHTML captures these styles on the server
 *   - This exact same mechanism works for both SSR and SSG
 *
 * HOW MUI sx works internally (simplified):
 *   1. <Button sx={{ color: 'red' }}> is rendered
 *   2. MUI calls emotionCss({ color: 'red' }) → generates className
 *   3. EmotionRegistry inserts <style data-emotion> into <head>
 *   4. Browser gets fully styled HTML — no JS needed for initial paint
 */

// ── MUI-like sx style object helpers ──
// These simulate MUI's internal sx processing:
// MUI sx → emotion css() → className

function sx(obj: Record<string, unknown>) {
  return css(obj as any);
}

// ── Styled wrapper for visual card layout ──
const DemoCard = styled.div<{ $accent: string }>`
  border: 2px solid ${(p) => p.$accent};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  background: white;
`;

const Badge = styled.span<{ $bg: string }>`
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  background: ${(p) => p.$bg};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 14px;
`;

export function MuiSxDemo() {
  // ── MUI sx simulation: sx={{ color: 'red', fontWeight: 700 }} ──
  // In real MUI: <Button sx={{ color: 'red' }}>
  // MUI internally does: css({ color: 'red' })
  const sxRed = useMemo(() => sx({ color: '#d32f2f', fontWeight: 700 }), []);
  const sxBlue = useMemo(() => sx({ color: '#1976d2', fontWeight: 700 }), []);
  const sxGreen = useMemo(() => sx({ color: '#2e7d32', fontWeight: 700 }), []);

  // ── Complex sx object (like MUI's sx prop supports) ──
  const sxCardStyle = useMemo(
    () =>
      css({
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '28px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      }),
    []
  );

  const sxButtonStyle = useMemo(
    () =>
      css({
        background: 'rgba(255, 255, 255, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '8px',
        color: 'white',
        padding: '8px 20px',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        ':hover': { background: 'rgba(255, 255, 255, 0.3)' },
      }),
    []
  );

  const sxTitleStyle = useMemo(
    () =>
      css({
        fontSize: '1.5rem',
        fontWeight: 800,
        margin: '0 0 6px 0',
        letterSpacing: '-0.3px',
      }),
    []
  );

  const sxSubtitleStyle = useMemo(
    () =>
      css({
        fontSize: '0.9rem',
        opacity: 0.85,
        margin: '0 0 14px 0',
        lineHeight: 1.5,
      }),
    []
  );

  return (
    <div>
      {/* ── Example 1: Real MUI-style sx object ── */}
      <DemoCard $accent="#667eea">
        <Badge $bg="#667eea">{'1. sx={{ ... }} — Object Syntax'}</Badge>
        <h3 style={{ margin: '0 0 6px 0', color: '#333', fontSize: '1.1rem' }}>
          MUI sx Prop Simulation
        </h3>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
          This is how MUI processes <code>{'sx={{ color: "red" }}'}</code> internally.
          MUI calls <code>css({'{{ color: "red" }}'})</code> at runtime and assigns
          the generated class name. The style is SSR/SSG-safe.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span css={sxRed}>{'sx={{ color: "#d32f2f", fontWeight: 700 }}'}</span>
          <span css={sxBlue}>{'sx={{ color: "#1976d2", fontWeight: 700 }}'}</span>
          <span css={sxGreen}>{'sx={{ color: "#2e7d32", fontWeight: 700 }}'}</span>
        </div>
      </DemoCard>

      {/* ── Example 2: Complex MUI Card with multiple sx props ── */}
      <DemoCard $accent="#28a745">
        <Badge $bg="#28a745">{'2. Complex MUI Card — Multiple sx Props'}</Badge>
        <h3 style={{ margin: '0 0 6px 0', color: '#333', fontSize: '1.1rem' }}>
          MUI Paper/Card with sx
        </h3>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Real-world MUI usage: <code>{'<Paper sx={{ borderRadius: 2, p: 3 }}>'}</code>.
          Each sx object becomes a <code>css()</code> call at runtime.
        </p>
        <div css={sxCardStyle}>
          <div css={sxTitleStyle}>MUI Card with sx</div>
          <div css={sxSubtitleStyle}>
            This card is styled entirely through <code>sx</code>-style object syntax.
            Everything is SSR/SSG rendered — check View Page Source.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button css={sxButtonStyle}>Action 1</button>
            <button css={sxButtonStyle}>Action 2</button>
          </div>
        </div>
      </DemoCard>

      {/* ── Example 3: Summary of what this proves ── */}
      <div
        css={css`
          background: #f0f8ff;
          border: 2px solid #1976d2;
          border-radius: 10px;
          padding: 16px;
          font-size: 0.85rem;
          color: #333;
          line-height: 1.6;
        `}
      >
        <strong style={{ color: '#1976d2' }}>
          {'\u2705'} All styles above are SSR/SSG-rendered
        </strong>
        <br />
        MUI <code>sx</code> = runtime <code>css()</code> call → no compiler dependency →
        works with SSR/SSG via EmotionRegistry. Open View Page Source and search for
        {' '}<code style={{ background: '#e3f2fd', padding: '1px 4px', borderRadius: 3 }}>data-emotion</code>.
      </div>
    </div>
  );
}
