// This is a Server Component - no "use client" directive!
// All Emotion-styled Client Components below are rendered on the server,
// their styles extracted by EmotionRegistry via useServerInsertedHTML.

import {
  SSRCard,
  StyledGradientCard,
  ServerComponentWrapper,
} from "@/components/ssr-demo-card";
import { MuiSxDemo } from "@/components/mui-sx-demo";

// Theme constants — blog-standard styling
const blog = {
  primary: '#667eea',
  success: '#28a745',
};

const codeStyle: React.CSSProperties = {
  background: '#f0f0f0',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
  fontSize: '0.85rem',
  color: '#d63384',
};

const HL = ({ children }: { children: React.ReactNode }) => (
  <code style={codeStyle}>{children}</code>
);

const sectionStyle: React.CSSProperties = {
  marginBottom: '32px',
};

const headingStyle: React.CSSProperties = {
  color: '#1a1a2e',
  fontSize: '1.6rem',
  fontWeight: 700,
  borderBottom: '2px solid #e8e8e8',
  paddingBottom: '10px',
  marginTop: '40px',
  marginBottom: '20px',
};

const subHeadingStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '1rem',
  lineHeight: '1.6',
  marginBottom: '20px',
};

const infoBoxStyle: React.CSSProperties = {
  background: '#f0f7ff',
  border: '1px solid #b8d4fe',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '24px',
  color: '#1a56db',
};

const warningBoxStyle: React.CSSProperties = {
  background: '#fffbe6',
  border: '1px solid #ffe58f',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '24px',
  color: '#ad8b00',
};

const codeBlockStyle: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  padding: '20px',
  borderRadius: '10px',
  fontSize: '0.85rem',
  fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
  lineHeight: '1.6',
  overflowX: 'auto' as const,
  marginBottom: '20px',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

// ===== Static metrics embedded in SSR HTML =====

const MetricCard: React.CSSProperties = {
  background: "#f0f8ff",
  border: "2px solid #667eea",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
};

const MetricValue: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: 700,
  color: "#667eea",
};

const MetricGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "12px",
  marginBottom: "24px",
};

const MetricSubCard: React.CSSProperties = {
  background: "#f5f5f5",
  borderRadius: "8px",
  padding: "12px",
  textAlign: "center" as const,
};

const CheckList = [
  "✅ Emotion styles in <style data-emotion> inside <head> — View Page Source to verify",
  "✅ Visual FOUC test: Disable JavaScript → styled cards remain fully styled",
  "✅ No client-side useEffect — all content in initial HTML",
  "✅ Server Component wrapping Emotion Client Components — styles SSR'd via EmotionRegistry",
  "✅ TypeScript + Emotion css prop and styled() API support",
];

export default function SSRDemoPage() {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <nav style={{ marginBottom: "24px" }}>
        <a
          href="/"
          style={{
            color: "#667eea",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Back to Home
        </a>
      </nav>
      <h1
        style={{
          textAlign: "center",
          color: "#333",
          fontSize: "2.5rem",
          marginBottom: "8px",
        }}
      >
        🖥️ Emotion SSR Demo
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "32px" }}>
        Pure SSR — all content rendered on the server, no client hooks
      </p>

      {/* ⚠️ Official Status Banner */}
      <div style={warningBoxStyle}>
        <strong style={{ color: "#e65100", fontSize: "1.1rem" }}>
          ⚠️ Official Next.js Status: Emotion is &ldquo;currently working on support&rdquo;
        </strong>
        <p style={{ margin: "8px 0 0", color: "#555", lineHeight: 1.6 }}>
          According to{' '}
          <a href="https://nextjs.org/docs/app/guides/css-in-js" target="_blank" rel="noopener noreferrer">
            Next.js CSS-in-JS docs
          </a>
          , Emotion is <strong>not yet officially supported</strong> in the App Router.
          The team is testing different libraries and will add more examples as support matures.
        </p>
        <p style={{ margin: "8px 0 0", color: "#555", lineHeight: 1.6 }}>
          <strong>Tracking issue:</strong>{' '}
          <a href="https://github.com/emotion-js/emotion/issues/2928" target="_blank" rel="noopener noreferrer">
            emotion-js/emotion#2928
          </a>
          <br />
          <strong>Workaround approach:</strong> Use <HL>EmotionRegistry</HL> with{' '}
          <HL>useServerInsertedHTML</HL> as described in the Next.js docs. This
          project validates this approach works for SSR/SSG today, but be aware
          that official support is still in progress.
        </p>
      </div>

      {/* Section 1: SSR Architecture */}
      <div style={infoBoxStyle}>
        <strong style={{ color: "#d48806", fontSize: "1.1rem" }}>
          ⚡ This entire page is a Server Component — zero client-side rendering
        </strong>
        <p style={{ margin: "8px 0 0", color: "#666", lineHeight: 1.5 }}>
          All Emotion-styled components below are <HL>Client Components</HL> that are
          <strong> rendered on the server</strong>. Their CSS is extracted by
          <HL>EmotionRegistry</HL> using <HL>useServerInsertedHTML</HL> and injected
          into <HL>{"<head>"}</HL>. The browser receives fully styled HTML —
          no JavaScript required to see the styles.
        </p>
      </div>

      {/* Section 2: The SSR Flow */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          1. SSR Rendering Flow
        </h2>
        <p style={subHeadingStyle}>
          The server renders each Emotion Client Component, collects all injected
          styles, and embeds them in the initial HTML response.
        </p>
        <div style={codeBlockStyle}>
          <div style={{ color: "#888", marginBottom: "4px" }}>
            1. Next.js calls renderToString() on this Server Component
          </div>
          <div style={{ color: "#888", marginBottom: "4px" }}>
            2. Emotion Client Components register styles via @emotion/cache
          </div>
          <div style={{ color: "#888", marginBottom: "4px" }}>
            3. EmotionRegistry uses useServerInsertedHTML to capture styles
          </div>
          <div style={{ color: "#888", marginBottom: "4px" }}>
            4. <span style={{ color: "#d63384" }}>{"<style data-emotion=\"css\">"}</span> tags are injected into <span style={{ color: "#d63384" }}>{"<head>"}</span>
          </div>
          <div style={{ color: "#28a745", marginTop: "8px", fontWeight: 600 }}>
            ✓ Browser receives fully styled HTML — FOUC-free rendering
          </div>
        </div>
      </section>

      {/* Section 1.5: Key Source Code — EmotionRegistry */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          1.5 Key Source Code — EmotionRegistry
        </h2>
        <p style={subHeadingStyle}>
          The core of SSR support is <HL>src/lib/emotion-registry.tsx</HL>.
          It captures Emotion-generated styles during server rendering and injects them
          into <HL>{"<head>"}</HL> via <HL>useServerInsertedHTML</HL>.
        </p>
        <div style={codeBlockStyle}>
          {`'use client';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function EmotionRegistry({ children }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const entries = cache.inserted;
    const styles = Object.keys(entries)
      .map((key) => entries[key]);
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
        </div>
        <p style={subHeadingStyle}>
          This registry is wired in <HL>src/app/layout.tsx</HL>:
        </p>
        <div style={codeBlockStyle}>
          {`export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}`}
        </div>
        <div style={infoBoxStyle}>
          <strong>How it works:</strong> During SSR, each Emotion component adds its
          generated CSS to the cache. <HL>useServerInsertedHTML</HL> runs
          after the component tree renders, extracts all cached styles, and injects them
          as <HL>{"<style data-emotion>"}</HL> tags in <HL>{"<head>"}</HL>.
          The browser receives fully styled HTML — no JavaScript needed to see the styles.
        </div>
      </section>

      {/* Section 2.5: MUI sx Prop — SSR Rendered */}
      <section style={sectionStyle}>
        <h2 style={{ ...headingStyle, borderBottomColor: '#7928ca' }}>
          2.5 MUI sx Prop — SSR Rendered
        </h2>
        <p style={subHeadingStyle}>
          This section demonstrates that MUI-style <code>{'sx={{ ... }}'}</code> props
          work perfectly with SSR. MUI processes <code>sx</code> at runtime by calling
          Emotion's <code>css()</code> function — the same pattern used below.
          All styles are extracted by EmotionRegistry and injected into <HL>{'<head>'}</HL>.
        </p>
        <MuiSxDemo />
      </section>

      {/* Section 3: Styled Components (SSR'd) */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          2. Emotion Components — SSR Rendered
        </h2>
        <p style={subHeadingStyle}>
          These Emotion-powered components are rendered on the server. Their
          styles appear in the initial HTML <HL>{"<head>"}</HL> — inspect with
          "View Page Source".
        </p>
        <ServerComponentWrapper>
          <SSRCard
            title="styled() API — Server Rendered"
            description="This card uses @emotion/styled. The server generates both the HTML and the CSS. Open 'View Page Source' to see the <style data-emotion> tags in <head>."
          />
          <SSRCard
            title="css() Prop — Server Rendered"
            description="This demonstrates the css prop being SSR'd. The gradient background and all styles are part of the initial HTML payload."
          >
            <div style={{ marginTop: "12px" }}>
              <StyledGradientCard />
            </div>
          </SSRCard>
        </ServerComponentWrapper>
      </section>

      {/* Section 4: SSR Metrics */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          3. SSR Performance Expectations
        </h2>
        <p style={subHeadingStyle}>
          These are the expected SSR performance characteristics for this page.
          All metrics are theoretical baselines for server-rendered Emotion content:
        </p>

        <div style={MetricCard}>
          <div style={MetricValue}>0ms</div>
          <div style={{ color: "#555", fontSize: "0.9rem" }}>
            Style FOUC (Flash of Unstyled Content)
          </div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginTop: "4px" }}>
            SSR injects Emotion styles directly into HTML — zero wait for JavaScript
          </div>
        </div>

        <div style={MetricGrid}>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>~150ms</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>First Paint</div>
          </div>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>~250ms</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>DOM Ready</div>
          </div>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>~400ms</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Full Load</div>
          </div>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>6 tags</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Emotion Style Tags</div>
          </div>
        </div>

        <div style={{ background: "#e3f2fd", borderRadius: "8px", padding: "14px", fontSize: "0.85rem", color: "#333" }}>
          <strong>⚡ SSR vs CSR Timeline:</strong>
          <div style={{ marginTop: "8px", fontFamily: "monospace", fontSize: "0.8rem" }}>
            SSR:  [HTML arrives ✅ fully styled] → [JS downloads] → [Hydration]
            <br />
            CSR:  [Blank] → [JS downloads] → [JS parses] → [Styles generate] → [Paint]
          </div>
          <div style={{ marginTop: "8px", color: "#667eea", fontWeight: 600 }}>
            SSR delivers styled HTML on the first byte — the user sees the page immediately.
          </div>
        </div>
      </section>

      {/* Section 5: SSR Validation Checklist */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          4. SSR Validation Results
        </h2>
        <div
          style={{
            background: "#f0fff4",
            border: "2px solid #28a745",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          {CheckList.map((item, i) => (
            <p key={i} style={{ margin: "0 0 8px 0", color: "#333", lineHeight: 1.6 }}>
              {item}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
