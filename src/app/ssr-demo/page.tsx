// This is a Server Component - no "use client" directive!
// It can render Emotion-powered Client Components inside it,
// and those styles will be SSR'd thanks to EmotionRegistry in layout.tsx

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
        Demonstrating Server-Side Rendering of Emotion CSS-in-JS
      </p>

      {/* Section 1: Explanation */}
      <div style={infoBoxStyle}>
        <strong style={{ color: "#d48806", fontSize: "1.1rem" }}>
          ⚡ This entire page is a Server Component!
        </strong>
        <p style={{ margin: "8px 0 0", color: "#666", lineHeight: 1.5 }}>
          All the styled cards below are Client Components rendered on the server.
          Their Emotion styles are extracted and injected into the HTML <HL>{"<head>"}</HL> via <HL>EmotionRegistry</HL> + <HL>useServerInsertedHTML</HL>. Open "View Page Source" to see the injected <HL>{"<style data-emotion>"}</HL> tags!
        </p>
      </div>

      {/* Section 2: Server Component wrapping Emotion Client Components */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>
          1. Server Component {">"} Emotion Client Components
        </h2>
        <p style={subHeadingStyle}>
          A Server Component (this page) renders Client Components that use
          Emotion. The styles are extracted during SSR and sent with the initial
          HTML.
        </p>
        <ServerComponentWrapper>
          <SSRCard
            title="Styled with styled() API"
            description="This component uses @emotion/styled. Its styles are compiled on the server and included in the initial HTML payload. No flash of unstyled content!"
          />
          <SSRCard
            title="Styled with css() prop"
            description="This demonstrates the css prop being SSR'd. Hover over this card to see the transition - it works without JavaScript too (if the CSS is embedded)."
          >
            <div style={{ marginTop: "12px" }}>
              <StyledGradientCard />
            </div>
          </SSRCard>
        </ServerComponentWrapper>
      </section>

      {/* Section 3: How it works */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. How Emotion SSR Works</h2>
        <div style={codeBlockStyle}>
          <div style={{ color: "#888", marginBottom: "8px" }}>
            {"// 1. layout.tsx wraps children with EmotionRegistry (Client Component)"}
          </div>
          <div style={{ color: "#d63384" }}>{"<EmotionRegistry>"}</div>
          <div style={{ color: "#888", marginBottom: "8px" }}>
            {"  // 2. EmotionRegistry creates an @emotion/cache instance"}
          </div>
          <div style={{ color: "#888", marginBottom: "8px" }}>
            {"  // 3. It uses useServerInsertedHTML to collect styles"}
          </div>
          <div style={{ color: "#0070f3" }}>
            {"  <YourApp />  // Client Components with Emotion styles"}
          </div>
          <div style={{ color: "#d63384" }}>{"</EmotionRegistry>"}</div>
          <div style={{ color: "#888", marginTop: "12px" }}>
            {'// 4. Result: <style data-emotion="css">injected styles</style>'}
          </div>
          <div style={{ color: "#888" }}>
            {"//    appears in the HTML <head> before client hydration"}
          </div>
        </div>
      </section>

      {/* Section 4: Verification instructions */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. Verify SSR is Working</h2>
        <div
          style={{
            background: "#f0fff4",
            border: "2px solid #28a745",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <p style={{ margin: 0, color: "#333", lineHeight: 1.6 }}>
            <strong style={{ color: "#28a745" }}>{"\u2705"}</strong> Right-click {">"}{" "}
            <strong>"View Page Source"</strong> and search for <HL>data-emotion</HL>. You should see <HL>{"<style data-emotion=\"css ...\">"}</HL> tags containing all the CSS rules for the styled components above.
            <br />
            <br />
            <strong style={{ color: "#28a745" }}>{"\u2705"}</strong> Disable JavaScript in DevTools (Cmd+Shift+P {">"} "Disable JavaScript") and reload. The styled cards should still be fully styled because their CSS was already injected in the initial server response!
          </p>
        </div>
      </section>
    </div>
  );
}
