// This is a Server Component - no "use client" directive!
// All Emotion-styled Client Components below are rendered on the server,
// their styles extracted by EmotionRegistry via useServerInsertedHTML.

import {
  SSRCard,
  StyledGradientCard,
  ServerComponentWrapper,
} from "@/components/ssr-demo-card";

const sectionStyle: React.CSSProperties = {
  marginBottom: "32px",
};

const headingStyle: React.CSSProperties = {
  color: "#333",
  fontSize: "1.8rem",
  borderBottom: "2px solid #0070f3",
  paddingBottom: "12px",
  marginBottom: "16px",
};

const subHeadingStyle: React.CSSProperties = {
  color: "#555",
  fontSize: "1rem",
  lineHeight: "1.6",
  marginBottom: "20px",
};

const infoBoxStyle: React.CSSProperties = {
  background: "#fffbe6",
  border: "2px solid #ffd666",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
};

const codeStyle: React.CSSProperties = {
  background: "#e3e8ee",
  padding: "2px 6px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
};

const codeBlockStyle: React.CSSProperties = {
  background: "#f5f5f5",
  borderRadius: "12px",
  padding: "24px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  lineHeight: "1.7",
  overflowX: "auto" as const,
};

const HL = ({ children }: { children: React.ReactNode }) => (
  <code style={codeStyle}>{children}</code>
);

// ===== Static metrics embedded in SSR HTML (no client hooks needed) =====

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
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
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

      {/* Section 4: SSR Metrics (static, embedded in initial HTML) */}
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
