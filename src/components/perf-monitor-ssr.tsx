'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

const Panel = styled.div`
  background: #1a1a2e;
  border: 2px solid #667eea;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
  color: #eaeaea;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
`;

const Title = styled.h3`
  color: #667eea;
  font-size: 1.1rem;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  color: #888;
  font-size: 0.75rem;
  margin: 0 0 16px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
`;

const Card = styled.div`
  background: #0f3460;
  border: 1px solid #1a3a6b;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
`;

const Value = styled.div<{ color: string }>`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${(p) => p.color};
  margin-bottom: 2px;
`;

const Label = styled.div`
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Hint = styled.div`
  font-size: 0.65rem;
  color: #555;
  margin-top: 2px;
`;

const NoteBox = styled.div`
  background: #0f3460;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.75rem;
  color: #aaa;
  line-height: 1.6;
`;

const Highlight = styled.span`
  color: #4ecca3;
  font-weight: 600;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`;

const BarLabel = styled.div`
  font-size: 0.7rem;
  color: #aaa;
  min-width: 90px;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 18px;
  background: #1a1a2e;
  border-radius: 9px;
  overflow: hidden;
`;

const BarFill = styled.div<{ w: string }>`
  height: 100%;
  width: ${(p) => p.w};
  background: #667eea;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  font-size: 0.6rem;
  color: #fff;
  font-weight: 600;
  min-width: fit-content;
`;

export function SSRPerformanceMonitor() {
  const [ttfb, setTtfb] = useState<number | null>(null);
  const [fcp, setFcp] = useState<number | null>(null);
  const [domLoaded, setDomLoaded] = useState<number | null>(null);
  const [fullLoad, setFullLoad] = useState<number | null>(null);
  const [hydration, setHydration] = useState<number | null>(null);
  const [styleTags, setStyleTags] = useState(0);
  const [cssKB, setCssKB] = useState('0');
  const [jsKB, setJsKB] = useState<number | null>(null);
  const [htmlKB, setHtmlKB] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const start = performance.now();

    requestAnimationFrame(() => {
      setHydration(Math.round(performance.now() - start));
    });

    queueMicrotask(() => {
      // TTFB & navigation
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        setTtfb(Math.round(nav.responseStart - nav.requestStart));
        setDomLoaded(Math.round(nav.domContentLoadedEventEnd - nav.startTime));
        setFullLoad(Math.round(nav.loadEventEnd - nav.startTime));
      }

      // FCP
      const paints = performance.getEntriesByType('paint');
      const f = paints.find((e) => e.name === 'first-contentful-paint');
      if (f) setFcp(Math.round(f.startTime));

      // Emotion styles
      const tags = document.querySelectorAll('style[data-emotion]');
      let bytes = 0;
      tags.forEach((t) => { bytes += t.textContent?.length || 0; });
      setStyleTags(tags.length);
      setCssKB((bytes / 1024).toFixed(1));

      // JS bundle
      const resources = performance.getEntriesByType('resource');
      const js = resources.filter(
        (r) => r.name.includes('.js') && r.name.includes(location.hostname)
      );
      setJsKB(Math.round(js.reduce((s, r) => s + (r as PerformanceResourceTiming).transferSize, 0) / 1024));

      // HTML size
      setHtmlKB(Math.round(new Blob([document.documentElement.outerHTML]).size / 1024));
    });
  }, []);

  return (
    <Panel>
      <Title>🖥️ SSR Performance Metrics</Title>
      <Subtitle>Real server-rendered page — styles injected via useServerInsertedHTML</Subtitle>

      <Grid>
        <Card>
          <Value color="#4ecca3">{ttfb !== null ? `${ttfb}ms` : '...'}</Value>
          <Label>TTFB</Label>
          <Hint>Server response time</Hint>
        </Card>
        <Card>
          <Value color="#4ecca3">{fcp !== null ? `${fcp}ms` : '...'}</Value>
          <Label>First Paint</Label>
          <Hint>First visible content</Hint>
        </Card>
        <Card>
          <Value color="#e94560">{domLoaded !== null ? `${domLoaded}ms` : '...'}</Value>
          <Label>DOM Ready</Label>
          <Hint>HTML + CSS parsed</Hint>
        </Card>
        <Card>
          <Value color="#4ecca3">{fullLoad !== null ? `${fullLoad}ms` : '...'}</Value>
          <Label>Full Load</Label>
          <Hint>Page fully loaded</Hint>
        </Card>
        <Card>
          <Value color="#f0a500">{hydration !== null ? `${hydration}ms` : '...'}</Value>
          <Label>Hydration</Label>
          <Hint>React hydrates components</Hint>
        </Card>
        <Card>
          <Value color="#f0a500">{styleTags}</Value>
          <Label>Style Tags</Label>
          <Hint>{cssKB} KB of Emotion CSS</Hint>
        </Card>
      </Grid>

      <BarRow>
        <BarLabel>SSR (this page):</BarLabel>
        <BarTrack>
          <BarFill w={ttfb !== null && ttfb < 100 ? '28%' : ttfb !== null && ttfb < 300 ? '48%' : '68%'}>
            {ttfb !== null ? `${ttfb}ms TTFB` : '...'}
          </BarFill>
        </BarTrack>
      </BarRow>
      <BarRow>
        <BarLabel>CSR (no SSR):</BarLabel>
        <BarTrack>
          <div css={css`height:100%;width:100%;background:#e94560;border-radius:9px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:0.6rem;color:#fff;font-weight:600;`}>
            ~500-2000ms (download + parse + render)
          </div>
        </BarTrack>
      </BarRow>

      <NoteBox>
        <Highlight>✅ SSR Advantage:</Highlight> The server generated this HTML with Emotion styles
        already in <code style={{ color: '#4ecca3' }}>{'<head>'}</code>. The browser paints the styled UI
        immediately — no waiting for JS.
        <div css={{ marginTop: 6 }}>
          JS bundle: <Highlight>{jsKB ?? '...'} KB</Highlight> |
          HTML size: <Highlight>{htmlKB ?? '...'} KB</Highlight>
        </div>
      </NoteBox>
    </Panel>
  );
}
