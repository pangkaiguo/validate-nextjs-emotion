'use client';

import React from 'react';
import { StructuredRenderer } from '@/components/structured-renderer';
import { SanitizedHTMLRenderer } from '@/components/sanitized-html-renderer';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { RTERenderer } from '@/components/rte-renderer';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ContentBlock } from '@/types/content';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const Section = styled.div<{ accent?: string }>`
  border: 2px solid ${(props) => props.accent || '#0070f3'};
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 32px;
  background: #fff;
`;

const SectionTitle = styled.h2<{ color?: string }>`
  font-size: 1.4rem;
  color: ${(props) => props.color || '#0070f3'};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionBadge = styled.span<{ bg: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${(props) => props.bg};
  color: white;
  margin-left: 12px;
  vertical-align: middle;
`;

const SectionDesc = styled.p`
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const DemoBox = styled.div<{ bg?: string; borderColor?: string }>`
  background: ${(props) => props.bg || '#f8f9fa'};
  border: 1px solid ${(props) => props.borderColor || '#eaeaea'};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;

const DemoLabel = styled.div<{ color?: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(props) => props.color || '#666'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const CodeBlock = styled.pre`
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  overflow-x: auto;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const ComparisonGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`;

const DangerTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  background: #dc3545;
  color: white;
`;

const SafeTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  background: #28a745;
  color: white;
`;

const WarningTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  background: #ffc107;
  color: #333;
`;

const XSSDemoBox = styled.div`
  background: #fff5f5;
  border: 2px dashed #dc3545;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

// ============================================================================
// Sample Data
// ============================================================================

/** Simulated user input containing XSS attempts — for demo purposes only */
const MALICIOUS_HTML = `
  <h2>Welcome to Our CMS</h2>
  <p>This is a <strong>great</strong> article about security.</p>
  <script>alert('XSS Attack!')</script>
  <img src="x" onerror="alert('XSS via onerror!')" />
  <p>Another paragraph with <a href="javascript:alert(1)">malicious link</a>.</p>
  <iframe src="https://evil.com"></iframe>
  <p onmouseover="alert('XSS via event!')">Hover me if you dare!</p>
  <style>body { background: red; }</style>
`;

/** Sanitized output — what DOMPurify would produce */
const SAFE_EXPECTED_OUTPUT = `
  <h2>Welcome to Our CMS</h2>
  <p>This is a <strong>great</strong> article about security.</p>
  <p>Another paragraph with <a target="_blank">malicious link</a>.</p>
`;

/** Structured content for the StructuredRenderer demo */
const STRUCTURED_CONTENT = {
  blocks: [
    {
      id: '1',
      type: 'heading' as const,
      data: { level: 2, text: 'The Future of Web Security' },
    },
    {
      id: '2',
      type: 'paragraph' as const,
      data: { text: 'In today\'s digital landscape, XSS (Cross-Site Scripting) remains one of the most prevalent security threats. By using structured data rendering, we can eliminate entire classes of vulnerabilities.', alignment: 'left' },
    },
    {
      id: '3',
      type: 'image' as const,
      data: { src: 'https://picsum.photos/800/400', alt: 'Web security concept illustration' },
    },
    {
      id: '4',
      type: 'heading' as const,
      data: { level: 3, text: 'Key Security Principles' },
    },
    {
      id: '5',
      type: 'list' as const,
      data: { items: ['Never trust user input', 'Sanitize everything at the boundary', 'Use structured data over raw HTML', 'Implement defense in depth'], ordered: false },
    },
    {
      id: '6',
      type: 'quote' as const,
      data: { text: 'The only secure system is the one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards.', author: 'Gene Spafford' },
    },
    {
      id: '7',
      type: 'code' as const,
      data: { language: 'typescript', code: '// Safe rendering with structured data\nfunction SafeRenderer({ block }: { block: ContentBlock }) {\n  const Component = BLOCK_REGISTRY[block.type];\n  return <Component data={block.data} />;\n}', showLineNumbers: true },
    },
    {
      id: '8',
      type: 'divider' as const,
      data: {},
    },
    {
      id: '9',
      type: 'paragraph' as const,
      data: { text: 'By adopting structured content rendering, your CMS becomes inherently resistant to XSS attacks. No HTML injection is possible because there is no HTML to inject.', alignment: 'center' },
    },
  ],
};

/** Markdown sample content */
const MARKDOWN_CONTENT = `# Getting Started with Secure CMS

**Cross-Site Scripting (XSS)** is a type of security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users.

## Why Markdown is Safer

- Markdown has no way to execute JavaScript
- No event handlers (onclick, onerror, etc.)
- All content is rendered as text nodes

### Code Example

\`\`\`javascript
// This code is rendered as a text node — never executed
const xss = '<script>alert("safe")</script>';
console.log(xss);
\`\`\`

> Markdown is the safest format for user-generated content.
> — Security Best Practices Guide

[Learn more about XSS Prevention](https://owasp.org/www-community/attacks/xss/)
`;

/** TipTap-compatible JSON content for RTE demo */
const RTE_JSON_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Rich Text Editor Output' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Rich Text Editors like TipTap output structured JSON instead of raw HTML. This makes them inherently safe against XSS attacks.' }] },
    { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Bold text' }, { type: 'text', text: ' and ' }, { type: 'text', marks: [{ type: 'italic' }], text: 'italic text' }, { type: 'text', text: ' are rendered as React elements.' }] },
    {
      type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'JSON AST — no HTML injection possible' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Each node maps to a controlled React component' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Text is automatically escaped by React' }] }] },
      ]
    },
    { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'JSON is the safest format for rich text content.' }] }] },
    { type: 'codeBlock', attrs: { language: 'json' }, content: [{ type: 'text', text: '{ "type": "doc", "content": [] }' }] },
    { type: 'horizontalRule' },
    { type: 'paragraph', content: [{ type: 'text', text: 'All content above was rendered from JSON — zero XSS risk.' }] },
  ],
};

/** CSS-in-JS SSR demo — the pattern used in emotion-registry.tsx */
const SSR_CSS_CONTENT = `.css-abc123 {
  color: #0070f3;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}
.css-def456 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
}`;

// ============================================================================
// Main Demo Page
// ============================================================================

export default function DangerousHTMLDemoPage() {
  return (
    <Container>
      {/* Back to Home */}
      <nav style={{ marginBottom: '24px' }}>
        <a
          href="/"
          style={{
            color: '#dc3545',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Back to Home
        </a>
      </nav>

      {/* Page Header */}
      <PageTitle>🔒 dangerouslySetInnerHTML: Security Solutions</PageTitle>
      <PageSubtitle>
        A comprehensive demonstration of all strategies to safely handle HTML content
        in a CMS environment. Each section shows a different scenario with before/after comparison.
      </PageSubtitle>

      {/* ================================================================ */}
      {/* SCENARIO 1: CSS-in-JS SSR Style Injection (Emotion Registry) */}
      {/* ================================================================ */}
      <Section accent="#6f42c1">
        <SectionTitle color="#6f42c1">
          🎨 Scenario 1: CSS-in-JS SSR Style Injection
          <SectionBadge bg="#6f42c1">VERDICT: SAFE ✅</SectionBadge>
        </SectionTitle>
        <SectionDesc>
          This is the pattern used in <code>src/lib/emotion-registry.tsx</code>. The content is
          Emotion-generated CSS, not user input. <strong>No action needed</strong> — this usage
          is correct and safe.
        </SectionDesc>

        <ComparisonGrid>
          <DemoBox bg="#fff5f5" borderColor="#dc3545">
            <DemoLabel color="#dc3545">
              <DangerTag>UNSAFE</DangerTag> If this were user input
            </DemoLabel>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 8 }}>
              If the HTML contained user input (e.g., a blog post), it would be vulnerable to XSS.
              But in the Emotion Registry, the content is:
            </p>
            <ul style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
              <li>✅ Generated by Emotion library's internal cache</li>
              <li>✅ Pure CSS — no HTML elements</li>
              <li>✅ No user involvement</li>
            </ul>
          </DemoBox>

          <DemoBox bg="#f0fff4" borderColor="#28a745">
            <DemoLabel color="#28a745">
              <SafeTag>SAFE</SafeTag> Actual Emotion Registry Output
            </DemoLabel>
            <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: 8 }}>
              The <code>dangerouslySetInnerHTML</code> receives only CSS from Emotion cache:
            </p>
            <CodeBlock>{SSR_CSS_CONTENT}</CodeBlock>
            <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
              React SSR cannot use <code>children</code> for {'<style>'} tags — CSS special
              characters like {'>'} would be escaped. This is a React limitation.
            </p>
          </DemoBox>
        </ComparisonGrid>

        <DemoBox bg="#fff8e1" borderColor="#ffc107">
          <DemoLabel color="#856404">
            <WarningTag>RECOMMENDATION</WarningTag> Add safety annotation
          </DemoLabel>
          <CodeBlock>{`// In src/lib/emotion-registry.tsx, add:
/**
 * SAFE: Content is Emotion-generated CSS, not user input.
 * React SSR escapes children, breaking CSS syntax.
 */
// eslint-disable-next-line react/no-danger
dangerouslySetInnerHTML={{ __html: styles.join('') }}`}</CodeBlock>
        </DemoBox>
      </Section>

      {/* ================================================================ */}
      {/* SCENARIO 2: CMS User-Generated HTML + DOMPurify */}
      {/* ================================================================ */}
      <Section accent="#dc3545">
        <SectionTitle color="#dc3545">
          ⚠️ Scenario 2: CMS User-Generated HTML (DOMPurify)
          <SectionBadge bg="#28a745">SOLUTION: SanitizedHTMLRenderer ✅</SectionBadge>
        </SectionTitle>
        <SectionDesc>
          This is the <strong>most dangerous scenario</strong>. When CMS content comes from untrusted
          users, NEVER pass it directly to <code>dangerouslySetInnerHTML</code>.
          Always sanitize with DOMPurify first.
        </SectionDesc>

        <XSSDemoBox>
          <DemoLabel color="#dc3545">
            <DangerTag>XSS ATTACK VECTORS</DangerTag> Simulated malicious input
          </DemoLabel>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
            This HTML includes <strong>5 XSS attack vectors</strong> that would execute
            if passed directly to <code>dangerouslySetInnerHTML</code>:
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#721c24', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
            <li>🔴 {'<script>'} — Direct script injection</li>
            <li>🔴 {'<img onerror>'} — Event handler XSS</li>
            <li>🔴 <code>javascript:</code> URI — Protocol-based attack</li>
            <li>🔴 {'<iframe>'} — Clickjacking / embedded content</li>
            <li>🔴 {'<p onmouseover>'} — Inline event handler XSS</li>
            <li>🔴 {'<style>'} — CSS injection / data exfiltration</li>
          </ul>
        </XSSDemoBox>

        <ComparisonGrid>
          <DemoBox bg="#fff5f5" borderColor="#dc3545">
            <DemoLabel color="#dc3545">
              <DangerTag>BEFORE</DangerTag> Raw user input (unsafe)
            </DemoLabel>
            <CodeBlock>{MALICIOUS_HTML.trim()}</CodeBlock>
          </DemoBox>

          <DemoBox bg="#f0fff4" borderColor="#28a745">
            <DemoLabel color="#28a745">
              <SafeTag>AFTER</SafeTag> DOMPurify sanitized output
            </DemoLabel>
            <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: 8 }}>
              All XSS vectors removed. Only safe tags remain.
            </p>
            <div
              style={{
                border: '2px dashed #28a745',
                borderRadius: 8,
                padding: 16,
                background: '#f8f9fa',
              }}
            >
              <SanitizedHTMLRenderer html={MALICIOUS_HTML} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
              ✓ Script removed | ✓ onerror removed | ✓ javascript: URI removed |
              ✓ iframe removed | ✓ onmouseover removed | ✓ style removed
            </p>
          </DemoBox>
        </ComparisonGrid>

        <DemoBox bg="#fff8e1" borderColor="#ffc107">
          <DemoLabel color="#856404">
            <WarningTag>IMPLEMENTATION</WarningTag> How to use
          </DemoLabel>
          <CodeBlock>{`// ✅ Safe: Sanitize with DOMPurify
import { SanitizedHTMLRenderer } from '@/components/sanitized-html-renderer';

<SanitizedHTMLRenderer html={userContent} />

// DOMPurify config in src/lib/sanitize-config.ts
// - Only allows: p, strong, em, a, img, ul, ol, li, h1-h6, etc.
// - Blocks: script, iframe, style, form, input, on*, javascript:
// - Add default: rel="noopener", target="_blank"`}</CodeBlock>
        </DemoBox>
      </Section>

      {/* ================================================================ */}
      {/* SCENARIO 3: Structured Content (Primary CMS Strategy) */}
      {/* ================================================================ */}
      <Section accent="#28a745">
        <SectionTitle color="#28a745">
          🏗️ Scenario 3: Structured Content Rendering
          <SectionBadge bg="#28a745">RECOMMENDED ✅</SectionBadge>
        </SectionTitle>
        <SectionDesc>
          The <strong>best architecture</strong> for new CMS systems. Store content as
          structured JSON blocks, each rendered by a controlled React component.
          <strong> No dangerouslySetInnerHTML needed at all.</strong>
        </SectionDesc>

        <ComparisonGrid>
          <DemoBox bg="#fff5f5" borderColor="#dc3545">
            <DemoLabel color="#dc3545">
              <DangerTag>OLD WAY</DangerTag> HTML string from CMS
            </DemoLabel>
            <CodeBlock>{`// CMS stores HTML — XSS risk!
"<h2>Title</h2>
<p>Content <script>alert(1)</script></p>
<img src=x onerror=alert(1)>"`}</CodeBlock>
          </DemoBox>

          <DemoBox bg="#f0fff4" borderColor="#28a745">
            <DemoLabel color="#28a745">
              <SafeTag>NEW WAY</SafeTag> JSON blocks — no XSS possible
            </DemoLabel>
            <CodeBlock>{`// CMS stores structured JSON — inherently safe!
{
  "blocks": [
    {
      "id": "1",
      "type": "heading",
      "data": { "level": 2, "text": "Title" }
    },
    {
      "id": "2",
      "type": "paragraph",
      "data": { "text": "Content" }
    }
  ]
}`}</CodeBlock>
          </DemoBox>
        </ComparisonGrid>

        <DemoBox bg="#f0fff4" borderColor="#28a745">
          <DemoLabel color="#28a745">
            <SafeTag>LIVE DEMO</SafeTag> StructuredRenderer in action
          </DemoLabel>
          <div
            style={{
              border: '2px solid #28a745',
              borderRadius: 8,
              padding: 20,
              background: '#fafafa',
            }}
          >
            <StructuredRenderer content={STRUCTURED_CONTENT} />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 8 }}>
            ✓ All text is React text nodes | ✓ Each block type has a controlled component |
            ✓ No HTML injection possible
          </p>
        </DemoBox>

        <DemoBox bg="#e3f2fd" borderColor="#0070f3">
          <DemoLabel color="#0070f3">
            <SafeTag>ARCHITECTURE</SafeTag> Block type → Component mapping
          </DemoLabel>
          <CodeBlock>{`// src/lib/content-registry.tsx
export const BLOCK_REGISTRY = {
  paragraph: ParagraphBlock,  // Renders <p>{text}</p>
  heading: HeadingBlock,      // Renders <h1-h6>{text}</h1-h6>
  image: ImageBlock,          // Renders <img> with controlled attrs
  code: CodeBlock,            // Renders <pre><code>{text}</code></pre>
  list: ListBlock,            // Renders <ul>/<ol> with items
  quote: QuoteBlock,          // Renders <blockquote>{text}</blockquote>
  divider: DividerBlock,      // Renders <hr />
};`}</CodeBlock>
        </DemoBox>
      </Section>

      {/* ================================================================ */}
      {/* SCENARIO 4: Markdown Rendering */}
      {/* ================================================================ */}
      <Section accent="#17a2b8">
        <SectionTitle color="#17a2b8">
          📝 Scenario 4: Markdown Content
          <SectionBadge bg="#17a2b8">BEST FOR BLOGS ✅</SectionBadge>
        </SectionTitle>
        <SectionDesc>
          Markdown is the <strong>safest text format</strong> for user-generated content.
          It has no native XSS surface — can't execute scripts, no event handlers,
          no inline HTML unless explicitly enabled. Combined with <code>rehype-sanitize</code>,
          it's impenetrable.
        </SectionDesc>

        <ComparisonGrid>
          <DemoBox bg="#fff5f5" borderColor="#dc3545">
            <DemoLabel color="#dc3545">
              <DangerTag>UNSAFE HTML</DangerTag> Could contain XSS
            </DemoLabel>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
              HTML format allows arbitrary script execution:
            </p>
            <CodeBlock>{`<p>Hello</p>
<script>stealCookies()</script>
<img src=x onerror="hack()">`}</CodeBlock>
          </DemoBox>

          <DemoBox bg="#f0fff4" borderColor="#17a2b8">
            <DemoLabel color="#17a2b8">
              <SafeTag>SAFE MARKDOWN</SafeTag> No XSS possible
            </DemoLabel>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
              Markdown renders everything as text — scripts can't run:
            </p>
            <CodeBlock>{`# Hello
**This is bold text**
\`\`\`javascript
// Code shown, not executed
console.log("safe");
\`\`\`
[Safe link](https://example.com)`}</CodeBlock>
          </DemoBox>
        </ComparisonGrid>

        <DemoBox bg="#f8f9fa" borderColor="#17a2b8">
          <DemoLabel color="#17a2b8">
            <SafeTag>LIVE DEMO</SafeTag> MarkdownRenderer
          </DemoLabel>
          <div
            style={{
              border: '2px solid #17a2b8',
              borderRadius: 8,
              padding: 20,
              background: '#fff',
            }}
          >
            <MarkdownRenderer content={MARKDOWN_CONTENT} />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 8 }}>
            ✓ All links open in new tab with noopener | ✓ Code is syntax highlighted |
            ✓ rehype-sanitize strips any dangerous HTML
          </p>
        </DemoBox>
      </Section>

      {/* ================================================================ */}
      {/* SCENARIO 5: Rich Text Editor (TipTap JSON) */}
      {/* ================================================================ */}
      <Section accent="#e83e8c">
        <SectionTitle color="#e83e8c">
          ✏️ Scenario 5: Rich Text Editor Integration
          <SectionBadge bg="#e83e8c">MODERN APPROACH ✅</SectionBadge>
        </SectionTitle>
        <SectionDesc>
          Modern Rich Text Editors (TipTap, Slate, Lexical) output <strong>JSON AST</strong>,
          not HTML. This makes them naturally XSS-safe when rendered with controlled React
          components. <strong>Never use <code>editor.getHTML()</code></strong> — always use
          the JSON output.
        </SectionDesc>

        <ComparisonGrid>
          <DemoBox bg="#fff5f5" borderColor="#dc3545">
            <DemoLabel color="#dc3545">
              <DangerTag>WRONG WAY</DangerTag> Using editor.getHTML()
            </DemoLabel>
            <CodeBlock>{`// ❌ DANGEROUS: If user types HTML, it executes!
const html = editor.getHTML();
<div dangerouslySetInnerHTML={{ __html: html }} />

// User can type: <img src=x onerror="alert('XSS')">
// This WILL execute!`}</CodeBlock>
          </DemoBox>

          <DemoBox bg="#f0fff4" borderColor="#e83e8c">
            <DemoLabel color="#e83e8c">
              <SafeTag>RIGHT WAY</SafeTag> Using editor.getJSON()
            </DemoLabel>
            <CodeBlock>{`// ✅ SAFE: JSON AST → React elements
const json = editor.getJSON();
<RTERenderer content={json} />

// JSON is serialized data, never HTML
// Each node maps to a controlled React component
// Text is automatically escaped by React`}</CodeBlock>
          </DemoBox>
        </ComparisonGrid>

        <DemoBox bg="#f8f9fa" borderColor="#e83e8c">
          <DemoLabel color="#e83e8c">
            <SafeTag>LIVE DEMO</SafeTag> RTERenderer — TipTap JSON to React
          </DemoLabel>
          <div
            style={{
              border: '2px solid #e83e8c',
              borderRadius: 8,
              padding: 20,
              background: '#fff',
            }}
          >
            <RTERenderer content={RTE_JSON_CONTENT} />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 8 }}>
            ✓ All above content rendered from TipTap JSON | ✓ Zero XSS risk |
            ✓ SSR / SSG compatible
          </p>
        </DemoBox>
      </Section>

      {/* ================================================================ */}
      {/* SUMMARY & ARCHITECTURE DECISION MATRIX */}
      {/* ================================================================ */}
      <Section accent="#333">
        <SectionTitle color="#333">
          📊 Decision Matrix: Which Strategy to Use?
        </SectionTitle>
        <SectionDesc>
          Choose the right strategy based on your use case and content source.
          The principle: <strong>Structured data first, Markdown second, Sanitized HTML last.</strong>
        </SectionDesc>

        <div style={{ overflowX: 'auto' }}>
          <table
            css={css`
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;

              th, td {
                padding: 12px 16px;
                text-align: left;
                border-bottom: 1px solid #eaeaea;
              }

              th {
                background: #f8f9fa;
                font-weight: 600;
                color: #333;
              }

              tr:hover {
                background: #f5f5f5;
              }
            `}
          >
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Component</th>
                <th>Use Case</th>
                <th>XSS Safety</th>
                <th>Complexity</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Structured JSON</strong></td>
                <td><code>StructuredRenderer</code></td>
                <td>New CMS content</td>
                <td><SafeTag>EXCELLENT</SafeTag></td>
                <td>🟡 Medium</td>
                <td>🥇 Primary</td>
              </tr>
              <tr>
                <td><strong>Markdown</strong></td>
                <td><code>MarkdownRenderer</code></td>
                <td>Blogs, docs, articles</td>
                <td><SafeTag>EXCELLENT</SafeTag></td>
                <td>🟢 Low</td>
                <td>🥇 Primary</td>
              </tr>
              <tr>
                <td><strong>RTE JSON</strong></td>
                <td><code>RTERenderer</code></td>
                <td>Rich text editor output</td>
                <td><SafeTag>EXCELLENT</SafeTag></td>
                <td>🟡 Medium</td>
                <td>🥇 Primary</td>
              </tr>
              <tr>
                <td><strong>DOMPurify + HTML</strong></td>
                <td><code>SanitizedHTMLRenderer</code></td>
                <td>Legacy HTML migration</td>
                <td><WarningTag>GOOD</WarningTag></td>
                <td>🟢 Low</td>
                <td>🥈 Fallback</td>
              </tr>
              <tr>
                <td><strong>Emotion SSR</strong></td>
                <td><code>emotion-registry.tsx</code></td>
                <td>CSS-in-JS style injection</td>
                <td><SafeTag>SAFE ✅</SafeTag></td>
                <td>🟢 Low</td>
                <td>🟢 Keep</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer
        css={css`
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 0.9rem;
          border-top: 1px solid #eaeaea;
          margin-top: 40px;
        `}
      >
        <p>
          🔒 dangerouslySetInnerHTML Security Solutions — Next.js + Emotion Validation Suite
        </p>
        <p css={{ marginTop: '4px', fontSize: '0.8rem' }}>
          Reference implementation for secure CMS content rendering.
          See <code>DangerousHTML_Solution.md</code> for complete architecture documentation.
        </p>
      </footer>
    </Container>
  );
}
