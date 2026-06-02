'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { keyframes, Global } from '@emotion/react';

// ==========================================
// Test 1: css prop (object syntax)
// ==========================================
const boxStyle = css({
  backgroundColor: '#0070f3',
  color: 'white',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
});

// ==========================================
// Test 2: css prop (template literal syntax)
// ==========================================
const gradientBox = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-top: 16px;
`;

// ==========================================
// Test 3: styled components
// ==========================================
const StyledCard = styled.div`
  background: white;
  border: 2px solid #eaeaea;
  border-radius: 12px;
  padding: 24px;
  margin-top: 16px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const StyledTitle = styled.h3`
  color: #333;
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  font-weight: 600;
`;

const StyledText = styled.p<{ variant?: 'primary' | 'secondary' }>`
  color: ${(props) => (props.variant === 'primary' ? '#0070f3' : '#666')};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

// ==========================================
// Test 4: styled components with attrs
// ==========================================
const StyledButton = styled.button`
  background: #0070f3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.2s, transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background: #0051a2;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(StyledButton)`
  background: #28a745;

  &:hover {
    background: #1e7e34;
  }
`;

// ==========================================
// Test 5: keyframes animation
// ==========================================
const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

const AnimatedDiv = styled.div`
  animation: ${bounce} 1s ease infinite;
  display: inline-block;
  background: #ff6b6b;
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 16px;
`;

// ==========================================
// Test 6: Composing styles
// ==========================================
const base = css`
  color: turquoise;
`;

const composed = css`
  ${base}
  background-color: #333;
  padding: 8px 16px;
  border-radius: 4px;
`;

// ==========================================
// Test 7: Nested selectors
// ==========================================
const nestedStyles = css`
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;

  h4 {
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #666;

    &.highlight {
      color: #0070f3;
      font-weight: bold;
    }
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 4px 0;
      color: #444;

      &:before {
        content: '✓ ';
        color: #28a745;
      }

      &.important {
        color: #ff6b6b;
        font-weight: bold;

        &:before {
          content: '★ ';
          color: #ff6b6b;
        }
      }
    }
  }
`;

// ==========================================
// Test 8: Media queries
// ==========================================
const responsiveBox = css`
  background: #0070f3;
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 16px;

  @media (min-width: 768px) {
    background: #28a745;
    font-size: 1.5rem;
    padding: 40px;
  }

  @media (min-width: 1024px) {
    background: #ff6b6b;
    font-size: 2rem;
    padding: 60px;
  }
`;

export default function TestComponents() {
  return (
    <div css={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Global styles test */}
      <Global
        styles={css`
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              sans-serif;
            background: #f0f0f0;
          }
        `}
      />

      <h1
        css={{
          textAlign: 'center',
          color: '#333',
          fontSize: '2.5rem',
          marginBottom: '8px',
        }}
      >
        🧪 Emotion CSS-in-JS Validation
      </h1>
      <p
        css={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '32px',
        }}
      >
        Testing various Emotion features in Next.js (App Router)
      </p>

      {/* Test 1: Object Syntax */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #0070f3', paddingBottom: '8px' }}>
          1. CSS Prop (Object Syntax)
        </h2>
        <div css={boxStyle}>This box uses object-style CSS prop</div>
      </section>

      {/* Test 2: Template Literal Syntax */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
          2. CSS Prop (Template Literal Syntax)
        </h2>
        <div css={gradientBox}>
          This box uses template literal CSS prop with gradient
        </div>
      </section>

      {/* Test 3: Styled Components */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
          3. Styled Components
        </h2>
        <StyledCard>
          <StyledTitle>Styled Card Title</StyledTitle>
          <StyledText>
            This is a styled component with base styling. Hover over this card to see the
            transition effect.
          </StyledText>
          <StyledText variant="primary">
            This text uses the "primary" variant prop.
          </StyledText>
          <StyledText variant="secondary">
            This text uses the "secondary" variant prop.
          </StyledText>
        </StyledCard>
      </section>

      {/* Test 4: Styled Components with Composition */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #ff6b6b', paddingBottom: '8px' }}>
          4. Styled Component Composition & Button States
        </h2>
        <div css={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <StyledButton>Default Button</StyledButton>
          <PrimaryButton>Primary Button</PrimaryButton>
          <StyledButton disabled>Disabled Button</StyledButton>
        </div>
      </section>

      {/* Test 5: Keyframes Animation */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #ff6b6b', paddingBottom: '8px' }}>
          5. Keyframes Animation
        </h2>
        <AnimatedDiv>Bouncing Animation!</AnimatedDiv>
      </section>

      {/* Test 6: Composing Styles */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid turquoise', paddingBottom: '8px' }}>
          6. Style Composition
        </h2>
        <div css={composed}>
          This text combines base color with additional styles
        </div>
      </section>

      {/* Test 7: Nested Selectors */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #764ba2', paddingBottom: '8px' }}>
          7. Nested Selectors
        </h2>
        <div css={nestedStyles}>
          <h4>Nested Selectors Demo</h4>
          <p>Regular paragraph text</p>
          <p className="highlight">This paragraph uses .highlight class</p>
          <ul>
            <li>List item with checkmark</li>
            <li>Another list item</li>
            <li className="important">Important item with star</li>
          </ul>
        </div>
      </section>

      {/* Test 8: Media Queries */}
      <section css={{ marginBottom: '32px' }}>
        <h2 css={{ color: '#333', borderBottom: '2px solid #ff6b6b', paddingBottom: '8px' }}>
          8. Media Queries (Resize browser to see changes)
        </h2>
        <div css={responsiveBox}>
          This box changes color and size based on viewport width
        </div>
      </section>

      {/* Test 9: Server vs Client Component */}
      <section css={{ marginBottom: '32px' }}>
        <h2
          css={{
            color: '#333',
            borderBottom: '2px solid #333',
            paddingBottom: '8px',
          }}
        >
          9. Component Types
        </h2>
        <StyledCard>
          <StyledTitle>✅ Client Component</StyledTitle>
          <StyledText>
            This page is a "use client" component which works with Emotion
            by default. For server components, you'd need a separate approach.
          </StyledText>
        </StyledCard>
      </section>

      {/* Footer */}
      <footer
        css={{
          textAlign: 'center',
          padding: '20px',
          color: '#999',
          fontSize: '0.9rem',
          borderTop: '1px solid #eaeaea',
          marginTop: '40px',
        }}
      >
        <p>Next.js + Emotion Validation Suite • Built with Next.js 16</p>
        <p css={{ marginTop: '4px' }}>
          Testing: css prop • styled API • keyframes • Global • Composition
        </p>
      </footer>
    </div>
  );
}
