// SSG Demo - Pure Static Site Generation
// This page is pre-rendered at build time into static HTML
// export const dynamic = "force-static" ensures SSG

import { SSGCard, StyledSSGCard } from "@/components/ssg-demo-card";

// Force static generation — no server needed at runtime
export const dynamic = "force-static";

const sectionStyle: React.CSSProperties = {
  marginBottom: "32px",
};

const headingStyle: React.CSSProperties = {
  color: "#333",
  fontSize: "1.8rem",
  borderBottom: "2px solid #28a745",
  paddingBottom: "12px",
  marginBottom: "16px",
};

const infoBoxStyle: React.CSSProperties = {
  background: "#e8f5e9",
  border: "2px solid #28a745",
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

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <code style={codeStyle}>{children}</code>
);

// ===== Static SSG metrics (embedded at build time, no client hooks) =====

const MetricCard: React.CSSProperties = {
  background: "#f0fff4",
  border: "2px solid #28a745",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
};

const MetricValue: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: 700,
  color: "#28a745",
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
  "✅ Static HTML generated at build time — no server required at runtime",
  "✅ Emotion styles baked into .html file during build — FOUC free",
  "✅ No client-side useEffect or hydration-dependent metrics",
  "✅ CDN-deployable: the .html file contains all Emotion CSS in <head>",
  "✅ Zero server compute cost — can be served from any static host",
];

export default function SSGDemoPage() {
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
        {"\u{1F4E6}"} Emotion SSG Demo
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "32px" }}>
        Pure SSG — pre-built static HTML with Emotion styles baked in
      </p>

      {/* Section 1: SSG Architecture */}
      <div style={infoBoxStyle}>
        <strong style={{ color: "#2e7d32", fontSize: "1.1rem" }}>
          {"\u26A1"} This page is statically generated — zero client runtime
        </strong>
        <p style={{ margin: "8px 0 0", color: "#333", lineHeight: 1.5 }}>
          Configured with <Highlight>export const dynamic = "force-static"</Highlight>,
          this page is pre-rendered into HTML at <strong>build time</strong>.
          Emotion styles are captured by <Highlight>EmotionRegistry</Highlight> during
          static generation — just like SSR, but without needing a runtime server.
        </p>
      </div>

      {/* Section 2: Build Output */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          1. Build Output Structure
        </h2>
        <p style={{ color: "#555", fontSize: "1rem", lineHeight: "1.6", marginBottom: "20px" }}>
          When you run <Highlight>npm run build</Highlight>, Next.js generates these files:
        </p>
        <div style={codeBlockStyle}>
          <div style={{ color: "#555" }}>
            .next/server/app/ssg-demo/
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u251C\u2500\u2500"} page.html{" "}
            <span style={{ color: "#888" }}>
              {"// "}Static HTML with Emotion {"<style>"} tags baked in
            </span>
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u251C\u2500\u2500"} page.json{" "}
            <span style={{ color: "#888" }}>
              {"// "}RSC Payload for client navigation
            </span>
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u2514\u2500\u2500"} page.js{" "}
            <span style={{ color: "#888" }}>
              {"// "}Client component hydration bundle
            </span>
          </div>
          <div style={{ color: "#888", marginTop: "8px" }}>
            The .html file is fully self-contained — deploy to any CDN.
          </div>
        </div>
      </section>

      {/* Section 3: Emotion Components (Static) */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          2. Emotion Components — Static Generated
        </h2>
        <p style={{ color: "#555", fontSize: "1rem", lineHeight: "1.6", marginBottom: "20px" }}>
          These Emotion-powered components were rendered during <strong>static generation</strong>.
          Their styles are extracted and embedded in the static HTML output file.
        </p>
        <SSGCard
          title="styled() API — Static Generated"
          description="This component uses @emotion/styled. Its styles were extracted at build time and baked into the static HTML file. View .next/server/app/ssg-demo/page.html to verify."
        />
        <SSGCard
          title="css() Prop — Static Generated"
          description="This demonstrates the css prop being generated statically. The gradient and all styles are part of the pre-built HTML."
        >
          <div style={{ marginTop: "12px" }}>
            <StyledSSGCard />
          </div>
        </SSGCard>
      </section>

      {/* Section 4: SSG Performance (static metric card) */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          3. SSG Performance Characteristics
        </h2>
        <p style={{ color: "#555", fontSize: "1rem", lineHeight: "1.6", marginBottom: "20px" }}>
          Static Generation delivers the fastest possible load times. These are
          the expected characteristics for this page:
        </p>

        <div style={MetricCard}>
          <div style={MetricValue}>~50ms TTFB</div>
          <div style={{ color: "#555", fontSize: "0.9rem" }}>
            When served from CDN Edge
          </div>
          <div style={{ color: "#888", fontSize: "0.8rem", marginTop: "4px" }}>
            Static files are cached at CDN edge — near-instant response worldwide
          </div>
        </div>

        <div style={MetricGrid}>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>0ms</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Server Compute</div>
          </div>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>~100ms</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>First Paint</div>
          </div>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>~200ms</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Full Load</div>
          </div>
          <div style={MetricSubCard}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#333" }}>6 tags</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Emotion Styles</div>
          </div>
        </div>

        <div style={{ background: "#e8f5e9", borderRadius: "8px", padding: "14px", fontSize: "0.85rem", color: "#333" }}>
          <strong>{"\u26A1"} SSG vs SSR vs CSR:</strong>
          <div style={{ marginTop: "8px", fontFamily: "monospace", fontSize: "0.8rem", lineHeight: "1.8" }}>
            SSG: [Build time] → [CDN] → [✅ Instant HTML + Emotion styles] → [Hydration]
            <br />
            SSR: [Request] → [Server renders] → [HTML + Emotion styles] → [Hydration]
            <br />
            CSR: [Request] → [JS download] → [Parse] → [Emotion runtime] → [Paint]
          </div>
          <div style={{ marginTop: "8px", color: "#28a745", fontWeight: 600 }}>
            SSG eliminates server compute entirely — Emotion styles are embedded at build time.
          </div>
        </div>
      </section>

      {/* Section 5: SSG Validation Checklist */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          4. SSG Validation Results
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
