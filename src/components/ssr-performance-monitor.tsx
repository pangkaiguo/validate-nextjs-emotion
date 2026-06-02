'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

// ==========================================
// SSR Performance Monitor
// Shows real-time metrics for SSR performance
// Measures: TTFB, FCP, DOM Content Loaded, Emotion styles
// ==========================================

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

const WarningText = styled.span`
  color: #e94560;
  font-weight: 600;
`;

const CodeInline = styled.code`
  background: #0f3460;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #4ecca3;
`;

export function SSRPerformanceMonitor() {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const renderStart = performance.now();

    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      setPageRenderTime(renderEnd - renderStart);
    });

    // Collect all metrics in one pass
    const newMetrics: typeof metrics = {
      ttfb: null,
      fcp: null,
      domContentLoaded: null,
      loadTime: null,
      emotionStyleCount: 0,
      emotionCSSBytes: 0,
      navigationType: 'unknown',
      jsBundleSize: null,
      ssrHtmlBytes: null,
    };

    // Count Emotion styles
    const styleTags = document.querySelectorAll('style[data-emotion]');
    let emotionCSSBytes = 0;
    styleTags.forEach((tag) => {
      emotionCSSBytes += tag.textContent?.length || 0;
    });
    newMetrics.emotionStyleCount = styleTags.length;
    newMetrics.emotionCSSBytes = emotionCSSBytes;

    // Navigation timing
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      newMetrics.ttfb = Math.round(nav.responseStart - nav.requestStart);
      newMetrics.domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      newMetrics.loadTime = Math.round(nav.loadEventEnd - nav.startTime);
      newMetrics.navigationType = nav.type;
    }

    // FCP from Paint Timing API
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(
      (entry) => entry.name === 'first-contentful-paint'
    );
    if (fcpEntry) {
      newMetrics.fcp = Math.round(fcpEntry.startTime);
    }

    // Estimate JS bundle size
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(
      (r) =>
        r.name.includes('.js') &&
        r.name.includes(window.location.hostname)
    );
    newMetrics.jsBundleSize = Math.round(
      jsResources.reduce((sum, r) => sum + (r as PerformanceResourceTiming).transferSize, 0) / 1024
    );

    // SSR HTML body size
    newMetrics.ssrHtmlBytes = new Blob([document.documentElement.outerHTML]).size;

    // Defer setState to avoid cascading render warning
    // (We're reading browser APIs, not synchronizing React state)
    queueMicrotask(() => {
      setMetrics(newMetrics);
    });
  }, []);

  // Simulated CSR baseline for comparison
  // In a real CSR scenario, the page would need to:
  // 1. Download JS bundles
  // 2. Parse & execute React
  // 3. Generate styles at runtime

  return (
    <Panel>
      <PanelTitle>
        {'\u{1F4CA}'} SSR Performance Metrics
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
          <MetricSubtext>Time to First Byte (server response)</MetricSubtext>
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
            {metrics.domContentLoaded !== null
              ? `${metrics.domContentLoaded}ms`
              : '...'}
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
            {pageRenderTime !== null
              ? `${pageRenderTime.toFixed(1)}ms`
              : '...'}
          </MetricValue>
          <MetricLabel>React Hydration</MetricLabel>
          <MetricSubtext>Time for React to hydrate Emotion components</MetricSubtext>
        </MetricCard>

        <MetricCard>
          <MetricValue color="#f0a500">
            {metrics.emotionStyleCount}
          </MetricValue>
          <MetricLabel>
            {'<style data-emotion>'} Tags
          </MetricLabel>
          <MetricSubtext>
            {metrics.emotionCSSBytes > 0
              ? `${(metrics.emotionCSSBytes / 1024).toFixed(1)} KB of CSS`
              : '0 KB'}
          </MetricSubtext>
        </MetricCard>
      </MetricGrid>

      {/* What SSR Means For Performance */}
      <ComparisonBarWrapper>
        <div
          css={css`
            font-size: 0.85rem;
            color: #ccc;
            margin-bottom: 12px;
          `}
        >
          <strong style={{ color: '#4ecca3' }}>SSR Advantage:</strong> With SSR,
          the page HTML already contains the rendered Emotion styles. The browser
          can paint the styled UI <GlowText>immediately</GlowText> without waiting
          for JavaScript to parse and inject CSS.
        </div>

        <ComparisonRow>
          <ComparisonLabel>SSR (this page):</ComparisonLabel>
          <BarTrack>
            <BarFill
              width={
                metrics.ttfb !== null && metrics.ttfb < 100
                  ? '30%'
                  : metrics.ttfb !== null && metrics.ttfb < 300
                    ? '50%'
                    : '70%'
              }
              color="#4ecca3"
            >
              {metrics.ttfb !== null ? `${metrics.ttfb}ms TTFB` : '...'}
            </BarFill>
          </BarTrack>
        </ComparisonRow>

        <ComparisonRow>
          <ComparisonLabel>CSR (no SSR):</ComparisonLabel>
          <BarTrack>
            <BarFill width="100%" color="#e94560">
              ~500-2000ms (JS download + parse + render)
            </BarFill>
          </BarTrack>
        </ComparisonRow>

        <div
          css={css`
            font-size: 0.75rem;
            color: #666;
            line-height: 1.6;
            margin-top: 12px;
            border-top: 1px solid #0f3460;
            padding-top: 12px;
          `}
        >
          <div>
            <GlowText>{'\u2705'}</GlowText> SSR delivers pre-rendered HTML — no
            flash of unstyled content (FOUC).
          </div>
          <div>
            <GlowText>{'\u2705'}</GlowText> Emotion styles are in the{' '}
            <CodeInline>{'<head>'}</CodeInline>, applied before the browser
            paints.
          </div>
          <div>
            <GlowText>{'\u2705'}</GlowText> JavaScript hydration is
            non-blocking — the user sees the styled UI while React hydrates in
            the background.
          </div>
          <div>
            <GlowText>{'\u2705'}</GlowText> Even with JS disabled, the page
            remains fully styled because CSS was injected at the server level.
          </div>
        </div>
      </ComparisonBarWrapper>

      {/* Navigation info */}
      <div
        css={css`
          margin-top: 16px;
          font-size: 0.7rem;
          color: #555;
          text-align: center;
        `}
      >
        Navigation type: <CodeInline>{metrics.navigationType}</CodeInline> |
        Estimated JS bundle: <CodeInline>{metrics.jsBundleSize ?? '...'} KB</CodeInline> |
        HTML size: <CodeInline>
          {metrics.ssrHtmlBytes
            ? `${(metrics.ssrHtmlBytes / 1024).toFixed(1)} KB`
            : '...'}
        </CodeInline>
      </div>
    </Panel>
  );
}
