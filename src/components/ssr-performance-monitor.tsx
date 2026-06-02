'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

const Panel = styled.div`
  background: #1a1a2e;
  border: 2px solid #e94560;
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
  color: #eaeaea;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
`;

const PanelTitle = styled.h3`
  color: #e94560;
  font-size: 1.2rem;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const MetricCard = styled.div<{ highlight?: boolean }>`
  background: ${(props) => (props.highlight ? '#16213e' : '#0f3460')};
  border: 1px solid ${(props) => (props.highlight ? '#e94560' : '#1a3a6b')};
  border-radius: 10px;
  padding: 16px;
  text-align: center;
`;

const MetricValue = styled.div<{ color?: string }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.color || '#4ecca3'};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricSubtext = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 4px;
`;

const ComparisonBarWrapper = styled.div`
  background: #0f3460;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
`;

const ComparisonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const ComparisonLabel = styled.div`
  font-size: 0.8rem;
  color: #aaa;
  min-width: 120px;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 20px;
  background: #1a1a2e;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ width: string; color: string }>`
  height: 100%;
  width: ${(props) => props.width};
  background: ${(props) => props.color};
  border-radius: 10px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  font-size: 0.65rem;
  color: white;
  font-weight: 600;
  min-width: fit-content;
`;

const GlowText = styled.span`
  color: #4ecca3;
  font-weight: 600;
`;

const CodeInline = styled.code`
  background: #0f3460;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #4ecca3;
`;

const ModeBadge = styled.span<{ mode: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 8px;
  background: ${(props) =>
    props.mode === 'ssr' ? '#667eea' : props.mode === 'ssg' ? '#28a745' : '#f0a500'};
  color: white;
`;

export type RenderMode = 'ssr' | 'ssg' | 'client';

const modeConfig: Record<RenderMode, {
  title: string;
  emoji: string;
  borderColor: string;
  summary: string;
  advantage: string;
  bullets: string[];
  barColor: string;
  barLabel: string;
}> = {
  ssr: {
    title: 'SSR Performance Metrics',
    emoji: '\u{1F5A5}\uFE0F',
    borderColor: '#667eea',
    summary: 'This page was rendered on the server (SSR). Emotion styles were extracted via useServerInsertedHTML and injected into the HTML <head> before sending to the browser.',
    advantage: 'SSR Advantage: The page HTML already contains rendered Emotion styles. The browser can paint the styled UI immediately without waiting for JS.',
    bullets: [
      'SSR delivers pre-rendered HTML — no FOUC (Flash of Unstyled Content)',
      'Emotion styles are in the <head>, applied before the browser paints',
      'JavaScript hydration is non-blocking — user sees styled UI while React hydrates',
      'Even with JS disabled, the page remains fully styled',
    ],
    barColor: '#667eea',
    barLabel: 'SSR (this page)',
  },
  ssg: {
    title: 'SSG Performance Metrics',
    emoji: '\u{1F4E6}',
    borderColor: '#28a745',
    summary: 'This page was pre-built at build time (SSG). The Emotion styles were extracted during static generation and baked into the final .html file. No server runtime needed.',
    advantage: 'SSG Advantage: The page is fully static — Emotion styles were embedded at build time. Can be served from a CDN with zero server cost.',
    bullets: [
      'Static HTML generated at build time — no server round-trip needed',
      'Emotion styles are baked into the .html file in <head>',
      'CDN-ready: deploy to any static hosting (Vercel, Netlify, S3)',
      'Sub-second TTFB because there is no server computation',
    ],
    barColor: '#28a745',
    barLabel: 'SSG (this page)',
  },
  client: {
    title: 'Client Component Performance Metrics',
    emoji: '\u{1F3AD}',
    borderColor: '#f0a500',
    summary: 'This page is a Client Component. Emotion styles are rendered at runtime in the browser. Note that even for Client Components, Next.js auto-static-optimizes pages that don\'t use dynamic features.',
    advantage: 'Hybrid Advantage: Even as a Client Component, Emotion styles were pre-rendered via SSR/static generation at the layout level.',
    bullets: [
      'Emotion styles were SSR\'d even for this Client Component page',
      'No FOUC — styles still appear before JavaScript hydration',
      'Runtime interactivity (hover, animations) works after hydration',
      'Styled components with dynamic props work correctly',
    ],
    barColor: '#f0a500',
    barLabel: 'Client Component (this page)',
  },
};

export function SSRPerformanceMonitor({ mode = 'ssr' }: { mode?: RenderMode }) {
  const [metrics, setMetrics] = useState<{
    ttfb: number | null;
    fcp: number | null;
    domContentLoaded: number | null;
    loadTime: number | null;
    emotionStyleCount: number;
    emotionCSSBytes: number;
    navigationType: string;
    jsBundleSize: number | null;
    ssrHtmlBytes: number | null;
  }>({
    ttfb: null,
    fcp: null,
    domContentLoaded: null,
    loadTime: null,
    emotionStyleCount: 0,
    emotionCSSBytes: 0,
    navigationType: 'unknown',
    jsBundleSize: null,
    ssrHtmlBytes: null,
  });

  const [pageRenderTime, setPageRenderTime] = useState<number | null>(null);
  const cfg = modeConfig[mode];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const renderStart = performance.now();

    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      setPageRenderTime(renderEnd - renderStart);
    });

    const newMetrics: typeof metrics = {
      ttfb: null, fcp: null, domContentLoaded: null, loadTime: null,
      emotionStyleCount: 0, emotionCSSBytes: 0, navigationType: 'unknown',
      jsBundleSize: null, ssrHtmlBytes: null,
    };

    const styleTags = document.querySelectorAll('style[data-emotion]');
    let emotionCSSBytes = 0;
    styleTags.forEach((tag) => { emotionCSSBytes += tag.textContent?.length || 0; });
    newMetrics.emotionStyleCount = styleTags.length;
    newMetrics.emotionCSSBytes = emotionCSSBytes;

    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      newMetrics.ttfb = Math.round(nav.responseStart - nav.requestStart);
      newMetrics.domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      newMetrics.loadTime = Math.round(nav.loadEventEnd - nav.startTime);
      newMetrics.navigationType = nav.type;
    }

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
    if (fcpEntry) newMetrics.fcp = Math.round(fcpEntry.startTime);

    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(
      (r) => r.name.includes('.js') && r.name.includes(window.location.hostname)
    );
    newMetrics.jsBundleSize = Math.round(
      jsResources.reduce((sum, r) => sum + (r as PerformanceResourceTiming).transferSize, 0) / 1024
    );
    newMetrics.ssrHtmlBytes = new Blob([document.documentElement.outerHTML]).size;

    queueMicrotask(() => { setMetrics(newMetrics); });
  }, []);

  return (
    <Panel>
      <PanelTitle>
        {'\u{1F4CA}'} {cfg.emoji} {cfg.title}
        <ModeBadge mode={mode}>{mode.toUpperCase()}</ModeBadge>
        <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 400 }}>
          (measured in browser)
        </span>
      </PanelTitle>

      <MetricGrid>
        <MetricCard>
          <MetricValue color="#4ecca3">
            {metrics.ttfb !== null ? `${metrics.ttfb}ms` : '...'}
          </MetricValue>
          <MetricLabel>TTFB</MetricLabel>
          <MetricSubtext>Time to First Byte</MetricSubtext>
        </MetricCard>

        <MetricCard>
          <MetricValue color="#4ecca3">
            {metrics.fcp !== null ? `${metrics.fcp}ms` : '...'}
          </MetricValue>
          <MetricLabel>First Contentful Paint</MetricLabel>
          <MetricSubtext>First visible content</MetricSubtext>
        </MetricCard>

        <MetricCard highlight>
          <MetricValue color="#e94560">
            {metrics.domContentLoaded !== null ? `${metrics.domContentLoaded}ms` : '...'}
          </MetricValue>
          <MetricLabel>DOM Content Loaded</MetricLabel>
          <MetricSubtext>HTML parsed + styles applied</MetricSubtext>
        </MetricCard>

        <MetricCard>
          <MetricValue color="#4ecca3">
            {metrics.loadTime !== null ? `${metrics.loadTime}ms` : '...'}
          </MetricValue>
          <MetricLabel>Full Load Time</MetricLabel>
          <MetricSubtext>Page fully loaded</MetricSubtext>
        </MetricCard>

        <MetricCard>
          <MetricValue color="#f0a500">
            {pageRenderTime !== null ? `${pageRenderTime.toFixed(1)}ms` : '...'}
          </MetricValue>
          <MetricLabel>React Hydration</MetricLabel>
          <MetricSubtext>Hydrate Emotion components on client</MetricSubtext>
        </MetricCard>

        <MetricCard>
          <MetricValue color="#f0a500">
            {metrics.emotionStyleCount}
          </MetricValue>
          <MetricLabel>{'<style data-emotion>'} Tags</MetricLabel>
          <MetricSubtext>
            {metrics.emotionCSSBytes > 0 ? `${(metrics.emotionCSSBytes / 1024).toFixed(1)} KB` : '0 KB'}
          </MetricSubtext>
        </MetricCard>
      </MetricGrid>

      <ComparisonBarWrapper>
        <div css={css`
          font-size: 0.85rem; color: #ccc; margin-bottom: 12px;
        `}>
          <strong style={{ color: cfg.barColor }}>{cfg.advantage.split(':')[0]}:</strong>
          {cfg.advantage.split(':').slice(1).join(':')}
        </div>

        <div css={css`
          font-size: 0.8rem; color: #aaa; margin-bottom: 12px; line-height: 1.6;
        `}>
          {cfg.summary}
        </div>

        <ComparisonRow>
          <ComparisonLabel>{cfg.barLabel}:</ComparisonLabel>
          <BarTrack>
            <BarFill
              width={
                metrics.ttfb !== null && metrics.ttfb < 100
                  ? '30%'
                  : metrics.ttfb !== null && metrics.ttfb < 300
                    ? '50%'
                    : '70%'
              }
              color={cfg.barColor}
            >
              {metrics.ttfb !== null ? `${metrics.ttfb}ms TTFB` : '...'}
            </BarFill>
          </BarTrack>
        </ComparisonRow>

        <ComparisonRow>
          <ComparisonLabel>CSR (no SSR/SSG):</ComparisonLabel>
          <BarTrack>
            <BarFill width="100%" color="#e94560">
              ~500-2000ms (JS download + parse + render)
            </BarFill>
          </BarTrack>
        </ComparisonRow>

        <div css={css`
          font-size: 0.75rem; color: #666; line-height: 1.6;
          margin-top: 12px; border-top: 1px solid #0f3460; padding-top: 12px;
        `}>
          {cfg.bullets.map((bullet, i) => (
            <div key={i}>
              <GlowText>{'\u2705'}</GlowText> {bullet}
            </div>
          ))}
        </div>
      </ComparisonBarWrapper>

      <div css={css`
        margin-top: 16px; font-size: 0.7rem; color: #555; text-align: center;
      `}>
        Navigation type: <CodeInline>{metrics.navigationType}</CodeInline> |
        JS bundle: <CodeInline>{metrics.jsBundleSize ?? '...'} KB</CodeInline> |
        HTML: <CodeInline>{metrics.ssrHtmlBytes ? `${(metrics.ssrHtmlBytes / 1024).toFixed(1)} KB` : '...'}</CodeInline>
      </div>
    </Panel>
  );
}
