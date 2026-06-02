// Server Component — pure SSR
// Styled-components rendered on the server via StyledComponentsRegistry

import { SCDemoCard, SCGradientCard, Counter } from "@/components/styled-components-demo";

const sectionStyle: React.CSSProperties = {
  marginBottom: "32px",
};

const headingStyle: React.CSSProperties = {
  color: "#333",
  fontSize: "1.8rem",
  borderBottom: "2px solid #7928ca",
  paddingBottom: "12px",
  marginBottom: "16px",
};

const successBoxStyle: React.CSSProperties = {
  background: "#f3e5f5",
  border: "2px solid #7928ca",
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

const CheckList = [
  "✅ styled-components is officially supported by Next.js (unlike Emotion which is 'working on support')",
  "✅ SSR styles injected via StyledComponentsRegistry + useServerInsertedHTML",
  "✅ All styles in initial HTML response — zero FOUC",
  "✅ Interactive Counter component with styled-button works after hydration",
  "✅ No runtime CSS-in-JS overhead — styles extracted at build/SSR time",
];

export default function SCDemoPage() {
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
        💜 Styled-components SSR Demo
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "32px" }}>
        Officially supported by Next.js — the recommended CSS-in-JS solution for App Router
      </p>

      {/* ✅ Official Status Banner */}
      <div style={successBoxStyle}>
        <strong style={{ color: "#6a1b9a", fontSize: "1.1rem" }}>
          ✅ Next.js First-Class Support
        </strong>
        <p style={{ margin: "8px 0 0", color: "#333", lineHeight: 1.6 }}>
          According to{' '}
          <a href="https://nextjs.org/docs/app/guides/css-in-js" target="_blank" rel="noopener noreferrer">
            Next.js CSS-in-JS docs
          </a>
          , styled-components is one of the <strong>recommended</strong> CSS-in-JS libraries
          for the App Router. Unlike Emotion (which is &ldquo;currently working on support&rdquo;),
          styled-components works out of the box with:
        </p>
        <ul style={{ marginTop: "8px", color: "#555", lineHeight: 1.8 }}>
          <li><HL>next.config.ts</HL> — <HL>compiler.styledComponents = true</HL></li>
          <li><HL>StyledComponentsRegistry</HL> — <HL>useServerInsertedHTML</HL> for SSR/SSG</li>
          <li>React 18+ Server Components & App Router</li>
        </ul>
      </div>

      {/* Section 1: Setup */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Setup Comparison</h2>
        <div style={codeBlockStyle}>
          <div style={{ color: "#888", marginBottom: "8px" }}>
            {/* next.config.ts */}{" "}
            <span style={{ color: "#555" }}>Commented for reference:</span>
          </div>
          <div style={{ color: "#7928ca", marginBottom: "4px" }}>
            compiler: {'{'}
          </div>
          <div style={{ color: "#7928ca", paddingLeft: "16px", marginBottom: "4px" }}>
            emotion: true{' '}
            <span style={{ color: "#888" }}>{'// '}⚠️ Not officially supported</span>
          </div>
          <div style={{ color: "#28a745", paddingLeft: "16px" }}>
            styledComponents: true{' '}
            <span style={{ color: "#888" }}>{'// '}✅ First-class support</span>
          </div>
          <div style={{ color: "#7928ca" }}>{'}'}</div>
        </div>
      </section>

      {/* Section 2: Styled Components */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Styled Components</h2>
        <SCDemoCard
          title="styled.div — SSR Rendered"
          description="This card uses styled.div from 'styled-components'. All styles are extracted by StyledComponentsRegistry and injected into <head> during SSR/SSG."
        />
        <SCDemoCard
          title="Gradient Card — SSR Rendered"
          description="Styled gradient background, rendered on the server. View page source to see the <style> tags in <head>."
        >
          <div style={{ marginTop: "12px" }}>
            <SCGradientCard />
          </div>
        </SCDemoCard>
        <SCDemoCard
          title="Interactive Counter — with Hydration"
          description="A counter component using styled.button and styled.span. It hydrates on the client for interactivity, but the initial HTML is fully styled from the server."
        >
          <Counter />
        </SCDemoCard>
      </section>

      {/* Section 3: SSC vs Emotion */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. Why styled-components is recommended over Emotion</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#f3e5f5", borderRadius: "12px", padding: "16px", border: "2px solid #7928ca" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#6a1b9a" }}>💜 styled-components</h3>
            <ul style={{ margin: 0, paddingLeft: "16px", color: "#555", lineHeight: 1.8, fontSize: "0.85rem" }}>
              <li>Next.js official support</li>
              <li>Active maintenance</li>
              <li>SSR/SSG with built-in compiler</li>
              <li>React 18+ compatible</li>
              <li>TypeScript support</li>
            </ul>
          </div>
          <div style={{ background: "#fff3e0", borderRadius: "12px", padding: "16px", border: "2px solid #ff9800" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#e65100" }}>🎨 Emotion</h3>
            <ul style={{ margin: 0, paddingLeft: "16px", color: "#555", lineHeight: 1.8, fontSize: "0.85rem" }}>
              <li>&ldquo;Currently working on support&rdquo;</li>
              <li>Issue #{' '}
                <a href="https://github.com/emotion-js/emotion/issues/2928">2928</a>
              </li>
              <li>SSR works with workaround</li>
              <li>SSG works with workaround</li>
              <li>Future support promised</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Validation */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. Validation Results</h2>
        <div style={{ background: "#f3e5f5", border: "2px solid #7928ca", borderRadius: "12px", padding: "20px" }}>
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
