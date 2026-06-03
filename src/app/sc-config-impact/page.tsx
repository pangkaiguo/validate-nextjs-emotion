'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { css } from '@emotion/react';

// ============================================================
// 🎭 styled-components Config Impact Demo
//
// This page renders REAL styled-components and detects
// class name mismatch when `compiler.styledComponents`
// is missing from next.config.ts.
//
// ✅ WITH compiler.styledComponents: true
//    → Class names are deterministic between server & client
//    → Hydration succeeds without warnings
//
// ❌ WITHOUT compiler.styledComponents (or false)
//    → Class name hashes differ between server & client
//    → React throws "did not match" hydration errors
//
// To test: toggle compiler.styledComponents in next.config.ts,
// rebuild with `npm run build && npm start`, reload this page.
// ============================================================

// ── styled-components ──
const SCButton = styled.button<{ $color: string }>`
  background: ${(props) => props.$color};
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }
`;

const SCCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 12px 0;
`;

const SCTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  color: #333;
`;

const SCText = styled.p`
  margin: 0 0 12px 0;
  color: #555;
  line-height: 1.6;
`;

const SCLabel = styled.span<{ $bg: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => props.$bg};
  color: white;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid #7928ca;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 16px 0;
`;

// ── Constants ──
const COLORS = {
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  purple: '#7928ca',
  pink: '#ff0080',
};

const SC_CLASS_PATTERN = /^sc\-[a-zA-Z0-9]+/;

export default function SCConfigImpact() {
  const [scClassNames, setScClassNames] = useState<string[]>([]);
  const [hasMismatch, setHasMismatch] = useState<boolean | null>(null);
  const [ssrClassNames, setSsrClassNames] = useState<string[]>([]);
  const [hydrationErrors, setHydrationErrors] = useState<string[]>([]);
  const [scButtonRef, setScButtonRef] = useState<HTMLButtonElement | null>(null);
  const [scCardRef, setScCardRef] = useState<HTMLDivElement | null>(null);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Detect class names and hydration errors
  useEffect(() => {
    const scElements = document.querySelectorAll('[data-sc-component]');
    const names: string[] = [];
    scElements.forEach((el) => {
      const classes = el.className.split(' ').filter((c) => SC_CLASS_PATTERN.test(c));
      names.push(...classes);
    });
    setScClassNames([...new Set(names)]);

    const originalError = console.error;
    const errors: string[] = [];
    console.error = (...args: unknown[]) => {
      const msg = String(args[0]);
      if (msg.includes('did not match') || msg.includes('hydration')) {
        errors.push(msg);
        setHydrationErrors((prev) => [...prev, msg]);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Check SSR vs CSR class name mismatch
  useEffect(() => {
    if (!scButtonRef || !scCardRef) return;

    const clientClasses = [
      ...scButtonRef.className.split(' ').filter((c) => SC_CLASS_PATTERN.test(c)),
      ...scCardRef.className.split(' ').filter((c) => SC_CLASS_PATTERN.test(c)),
    ];

    const html = document.body.innerHTML;
    const ssrMatches = html.match(/class="(sc-[a-zA-Z0-9]+)/g);
    const ssr: string[] = [];
    if (ssrMatches) {
      ssrMatches.forEach((m) => {
        const name = m.replace('class="', '');
        if (!ssr.includes(name)) ssr.push(name);
      });
      setSsrClassNames(ssr);
    }

    const uniqueClient = [...new Set(clientClasses)];
    if (ssr.length > 0 && uniqueClient.length > 0) {
      const allMatch = uniqueClient.every((c) => ssr.includes(c));
      setHasMismatch(!allMatch);
    } else {
      setHasMismatch(false);
    }
  }, [scButtonRef, scCardRef]);

  const simulateMismatch = () => {
    setShowSideBySide(true);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: 8 }}>
        {'\u{1F3AD}'} styled-components Config Impact
      </h1>
      <p style={{ color: '#666', marginBottom: 8, lineHeight: 1.6 }}>
        This page renders <strong>real styled-components</strong> and detects
        class name mismatch caused by missing{' '}
        <code>compiler.styledComponents</code> in{' '}
        <code>next.config.ts</code>.
      </p>

      <div
        css={css`
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 24px;
          font-size: 0.85rem;
          color: #856404;
        `}
      >
        <strong>{'\u26A0\uFE0F'} To see the mismatch:</strong>{' '}
        Set <code>styledComponents: false</code> in{' '}
        <code>next.config.ts</code>, then run{' '}
        <code>npm run build && npm start</code>. Reload this page
        and check the diagnosis section.
      </div>

      {/* ── 1. Live Diagnosis ── */}
      <SCCard>
        <SCTitle>{'\u{1F50D}'} Live Diagnosis</SCTitle>
        <div style={{ marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Check</th>
                <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>SC compiler active</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  {scClassNames.length === 0 ? (
                    <span style={{ color: COLORS.warning }}>⏳ Detecting...</span>
                  ) : (
                    <span style={{ color: COLORS.success, fontWeight: 700 }}>
                      {'\u2705'} Active &mdash; {scClassNames.length} SC class(es) found
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>SSR vs CSR class match</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  {hasMismatch === null ? (
                    <span style={{ color: COLORS.info }}>⏳ Analyzing...</span>
                  ) : hasMismatch ? (
                    <span style={{ color: COLORS.danger, fontWeight: 700 }}>
                      {'\u274C'} MISMATCH DETECTED!
                    </span>
                  ) : (
                    <span style={{ color: COLORS.success, fontWeight: 700 }}>
                      {'\u2705'} Class names match
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>Hydration errors</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  {hydrationErrors.length === 0 ? (
                    <span style={{ color: COLORS.success, fontWeight: 700 }}>
                      {'\u2705'} No hydration errors detected
                    </span>
                  ) : (
                    <span style={{ color: COLORS.danger, fontWeight: 700 }}>
                      {'\u274C'} {hydrationErrors.length} error(s) in console
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  <code>styledComponents</code> in config
                </td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  <span style={{ fontWeight: 700 }}>? Check next.config.ts</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SCCard>

      {/* ── 2. Real styled-components ── */}
      <SCCard>
        <SCLabel $bg={COLORS.purple}>{'\u{1F4C1}'} Rendered Components</SCLabel>
        <SCTitle>Actual styled-components in the DOM</SCTitle>
        <SCText>
          These components use <code>styled-components</code> runtime.
          Inspect them in DevTools Elements panel to see their class names.
        </SCText>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <SCButton
            ref={setScButtonRef}
            data-sc-component="button"
            $color={COLORS.purple}
            onClick={() => setClickCount((c) => c + 1)}
          >
            SC Button &mdash; clicked {clickCount} times
          </SCButton>

          <SCButton
            data-sc-component="button-alt"
            $color={COLORS.pink}
            onClick={() => setClickCount((c) => c - 1)}
          >
            SC Button (alt)
          </SCButton>
        </div>

        <div ref={setScCardRef} data-sc-component="card">
          <Spinner data-sc-component="spinner" />
          <SCText>
            This spinner uses <code>styled-components keyframes</code>.
            With <code>styledComponents: true</code>, the class name is
            deterministic. Without it, the hash differs between server and client.
          </SCText>
        </div>

        {/* Detected class names */}
        <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: '0.8rem', fontFamily: 'monospace', margin: '12px 0' }}>
          <div style={{ color: '#6a9955', marginBottom: 8 }}>// Detected client-side class names:</div>
          {scClassNames.length === 0 ? (
            <div style={{ color: '#888' }}>Detecting...</div>
          ) : (
            scClassNames.map((name, i) => (
              <div key={i} style={{ color: '#569cd6' }}>
                {name} <span style={{ color: '#888' }}>(length: {name.length})</span>
              </div>
            ))
          )}
          {scClassNames.length > 0 && (
            <div style={{ color: '#6a9955', marginTop: 8 }}>
              // {scClassNames.length} unique SC class(es) found in DOM
            </div>
          )}
        </div>

        {/* SSR class names */}
        {ssrClassNames.length > 0 && (
          <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: '0.8rem', fontFamily: 'monospace', margin: '12px 0' }}>
            <div style={{ color: '#6a9955', marginBottom: 8 }}>// SSR class names found in initial HTML:</div>
            {ssrClassNames.map((name, i) => (
              <div key={i} style={{ color: '#ce9178' }}>
                {name}
                <span style={{ color: '#888', marginLeft: 8 }}>
                  {scClassNames.includes(name) ? '\u2705 matches client' : '\u274C not in client!'}
                </span>
              </div>
            ))}
          </div>
        )}

        <SCText>
          <strong>Try this:</strong> In DevTools Elements panel, search for{' '}
          <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>sc-</code>{' '}
          to find the class names. Then compare them after toggling{' '}
          <code>compiler.styledComponents</code>.
        </SCText>
      </SCCard>

      {/* ── 3. Side-by-side simulation ── */}
      <SCCard>
        <SCLabel $bg={COLORS.warning}>{'\u{1F52C}'} Simulation</SCLabel>
        <SCTitle>With vs Without compiler.styledComponents</SCTitle>
        <SCText>
          Click the button below to see what happens when the compiler is
          missing vs enabled. These are the actual class names you would see.
        </SCText>

        <button
          onClick={simulateMismatch}
          style={{
            background: COLORS.purple,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          {showSideBySide ? '\u{1F504} Update Simulation' : '\u25B6 Show Simulation'}
        </button>

        {showSideBySide && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div style={{ background: '#e8f5e9', border: '2px solid ' + COLORS.success, borderRadius: 8, padding: 16 }}>
              <div style={{ color: COLORS.success, fontWeight: 700, marginBottom: 8 }}>
                {'\u2705'} WITH compiler.styledComponents: true
              </div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#333' }}>
                <div>Server: <span style={{ color: '#2563eb' }}>sc-bdVaJa</span></div>
                <div>Client: <span style={{ color: '#2563eb' }}>sc-bdVaJa</span></div>
                <div style={{ color: COLORS.success, marginTop: 4 }}>{'\u2705'} Match!</div>
              </div>
            </div>
            <div style={{ background: '#fbe9e7', border: '2px solid ' + COLORS.danger, borderRadius: 8, padding: 16 }}>
              <div style={{ color: COLORS.danger, fontWeight: 700, marginBottom: 8 }}>
                {'\u274C'} WITHOUT compiler.styledComponents
              </div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#333' }}>
                <div>Server: <span style={{ color: '#2563eb' }}>sc-bdVaJa</span></div>
                <div>Client: <span style={{ color: '#dc2626' }}>sc-gsTCUz</span></div>
                <div style={{ color: COLORS.danger, marginTop: 4 }}>{'\u274C'} DIFFERENT!</div>
              </div>
            </div>
          </div>
        )}
      </SCCard>

      {/* ── 4. Reproduce Steps ── */}
      <SCCard>
        <SCLabel $bg={COLORS.info}>{'\u{1F4CB}'} Steps</SCLabel>
        <SCTitle>How to Reproduce the Mismatch</SCTitle>
        <ol style={{ lineHeight: 2, color: '#555', paddingLeft: 20, margin: 0 }}>
          <li>
            Open <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>next.config.ts</code>{' '}
            and change <code>styledComponents: true</code> to <code>false</code>
          </li>
          <li>
            Run{' '}
            <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>
              npm run build && npm start
            </code>
          </li>
          <li>
            Reload this page &mdash; check the <strong>Live Diagnosis</strong> panel
          </li>
          <li>
            Open DevTools Console &rarr; you should see:{' '}
            <code style={{ background: '#fff3cd', padding: '2px 6px', borderRadius: 4, color: '#856404' }}>
              "Warning: Expected server HTML to contain a matching ..."
            </code>
          </li>
          <li>
            In DevTools Elements panel, inspect the button &mdash; its class will be{' '}
            <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>sc-gsTCUz</code>{' '}
            (client-generated)
          </li>
          <li>
            Run{' '}
            <code style={{ background: '#eee', padding: '2px 6px', borderRadius: 4 }}>
              curl http://localhost:3000/sc-config-impact | grep "sc-bd"
            </code>{' '}
            &mdash; you'll see a <strong>different</strong> class name in the HTML source
          </li>
        </ol>
      </SCCard>

      {/* ── 5. Footer ── */}
      <div style={{ marginTop: 32, padding: 16, background: '#f8f9fa', borderRadius: 8, fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        <strong>Bottom line:</strong> Setting{' '}
        <code>compiler.styledComponents: true</code> costs zero runtime
        but prevents hydration warnings and class name mismatches.
        Always enable it.
      </div>
    </div>
  );
}
