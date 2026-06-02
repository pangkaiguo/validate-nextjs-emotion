// SSG Demo - Server Component that generates static HTML at build time
// This page uses `export const dynamic = "force-static"` to force SSG
// or we rely on Next.js automatic static optimization (no dynamic functions)

import { SSGCard, StyledSSGCard } from "@/components/ssg-demo-card";

// Force static generation (SSG) - this page will be pre-rendered at build time
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
  <code
    style={{
      background: "#e3e8ee",
      padding: "2px 6px",
      borderRadius: "4px",
      fontFamily: "monospace",
      fontSize: "0.85rem",
    }}
  >
    {children}
  </code>
);

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
        Demonstrating Static Site Generation (SSG) of Emotion CSS-in-JS
      </p>

      {/* Section 1: Explanation */}
      <div style={infoBoxStyle}>
        <strong style={{ color: "#2e7d32", fontSize: "1.1rem" }}>
          {"\u26A1"} This page uses SSG (Static Site Generation)
        </strong>
        <p style={{ margin: "8px 0 0", color: "#333", lineHeight: 1.5 }}>
          The page is configured with <Highlight>export const dynamic = "force-static"</Highlight>,
          which means it is pre-rendered into static HTML at <strong>build time</strong>.
          When you run <Highlight>npm run build</Highlight>, Next.js generates:
        </p>
        <ul style={{ lineHeight: 1.8, marginTop: "8px" }}>
          <li>
            <strong>.html</strong> - Static HTML file with Emotion styles embedded
          </li>
          <li>
            <strong>.json</strong> - RSC Payload for client navigation
          </li>
          <li>
            <strong>.js</strong> - Client component JavaScript for hydration
          </li>
        </ul>
        <p style={{ margin: "8px 0 0", color: "#333", lineHeight: 1.5 }}>
          The Emotion styles are captured by <Highlight>EmotionRegistry</Highlight> during
          static generation, just like SSR. The resulting HTML can be served from a CDN
          without a Node.js server!
        </p>
      </div>

      {/* Section 2: SSG Emotion Components */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          1. SSG + Emotion Client Components
        </h2>
        <p
          style={{
            color: "#555",
            fontSize: "1rem",
            lineHeight: "1.6",
            marginBottom: "20px",
          }}
        >
          These Emotion-powered components are rendered during <strong>static generation</strong>.
          Their styles are extracted and embedded in the static HTML output.
        </p>
        <SSGCard
          title="Styled with styled() API"
          description="This component uses @emotion/styled. Its styles were extracted at build time and baked into the static HTML file."
        />
        <SSGCard
          title="Styled with css() prop"
          description="This demonstrates the css prop being generated statically. The styles are part of the pre-built HTML."
        >
          <div style={{ marginTop: "12px" }}>
            <StyledSSGCard />
          </div>
        </SSGCard>
      </section>

      {/* Section 3: Build Output Analysis */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          2. Build Output Analysis (SSG vs SSR)
        </h2>
        <div style={codeBlockStyle}>
          <div style={{ fontWeight: 700, marginBottom: "8px", color: "#333" }}>
            {"$"} npm run build
          </div>
          <div style={{ color: "#888" }}>{">"} next build</div>
          <div style={{ color: "#28a745", marginTop: "8px" }}>
            {"\u2713"} Route (app)
          </div>
          <div style={{ color: "#555" }}>{"\u2514"} {"\u25CB"} /</div>
          <div style={{ color: "#555" }}>
            {"\u2514"} {"u25CB"} /ssg-demo {"  "}
            <span style={{ color: "#0070f3" }}>{"(Static)"}</span>
          </div>
          <div style={{ color: "#555" }}>
            {"\u2514"} {"\u25CB"} /ssr-demo {"  "}
            <span style={{ color: "#0070f3" }}>{"(Static)"}</span>
          </div>
          <div style={{ color: "#888", marginTop: "12px" }}>
            Note: Both SSR and SSG pages show "(Static)" because they don't use
            dynamic features like cookies/headers. Next.js auto-static-optimizes
            SSR pages too.
          </div>
        </div>
      </section>

      {/* Section 4: Build Output Files */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          3. Generated Files (in .next/server/app/)
        </h2>
        <div style={codeBlockStyle}>
          <div style={{ color: "#555" }}>
            .next/server/app/ssg-demo/
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u251C\u2500\u2500"} page.html{" "}
            <span style={{ color: "#888" }}>
              {"// "}Static HTML with Emotion styles embedded
            </span>
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u251C\u2500\u2500"} page.json{" "}
            <span style={{ color: "#888" }}>
              {"// "}RSC Payload
            </span>
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u2514\u2500\u2500"} page.js{" "}
            <span style={{ color: "#888" }}>
              {"// "}Client component bundle
            </span>
          </div>
          <div style={{ color: "#555", marginTop: "12px" }}>
            .next/server/app/ssr-demo/
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u251C\u2500\u2500"} page.html{" "}
            <span style={{ color: "#888" }}>
              {"// "}Same structure (auto-static-optimized)
            </span>
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u251C\u2500\u2500"} page.json
          </div>
          <div style={{ color: "#d63384", paddingLeft: "16px" }}>
            {"\u2514\u2500\u2500"} page.js
          </div>
        </div>
      </section>

      {/* Section 4: Verification */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          4. Verify SSG is Working
        </h2>
        <div
          style={{
            background: "#f0fff4",
            border: "2px solid #28a745",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <p style={{ margin: 0, color: "#333", lineHeight: 1.6 }}>
            <strong style={{ color: "#28a745" }}>{"\u2705"}</strong> Run{" "}
            <Highlight>npm run build</Highlight> and check the output:{" "}
            <Highlight>/ssg-demo</Highlight> should show{" "}
            <Highlight>(Static)</Highlight> and{" "}
            <Highlight>{"\u25CB"} (prerendered)</Highlight>.
            <br />
            <br />
            <strong style={{ color: "#28a745" }}>{"\u2705"}</strong> Check the
            generated file:{" "}
            <Highlight>
              .next/server/app/ssg-demo/page.html
            </Highlight>{" "}
            - it contains Emotion <Highlight>{"<style data-emotion>"}</Highlight>{" "}
            tags in the <Highlight>{"<head>"}</Highlight>.
            <br />
            <br />
            <strong style={{ color: "#28a745" }}>{"\u2705"}</strong> Serve with{" "}
            <Highlight>npm start</Highlight> and disable JavaScript - the Emotion
            styles are still visible because they were baked into the static HTML
            at build time.
          </p>
        </div>
      </section>
    </div>
  );
}
