'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

// ==========================================
// Client Component with Emotion styles
// These styles will be SSR'd via EmotionRegistry
// ==========================================

const CardWrapper = styled.div<{ color?: string }>`
  background: ${(props) => props.color || 'white'};
  border-radius: 12px;
  padding: 24px;
  margin: 12px 0;
  border: 2px solid #eaeaea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #0070f3;
  }
`;

const Title = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin: 0 0 8px 0;
  font-weight: 600;
`;

const Description = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
`;

const Badge = styled.span<{ type: 'server' | 'client' | 'ssr' }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: ${(props) =>
    props.type === 'server' ? '#0070f3' : props.type === 'client' ? '#28a745' : '#ff6b6b'};
  color: white;
`;

const cardStyle = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  margin: 12px 0;
`;

const iconStyle = css`
  font-size: 2.5rem;
  margin-bottom: 12px;
  display: block;
`;

const serverStyles = css`
  background: #f0f8ff;
  border: 2px dashed #0070f3;
  padding: 16px;
  border-radius: 8px;
  margin: 8px 0;
  font-family: monospace;
  font-size: 0.85rem;

  code {
    background: #e3e8ee;
    padding: 2px 6px;
    border-radius: 4px;
    color: #d63384;
  }
`;

export function SSRCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <CardWrapper>
      <Badge type="ssr">SSR Client Component</Badge>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {children}
    </CardWrapper>
  );
}

export function StyledGradientCard() {
  return (
    <div css={cardStyle}>
      <span css={iconStyle}>🎨</span>
      <h3 css={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
        Emotion SSR Gradient
      </h3>
      <p css={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
        This gradient background and all styles here are rendered on the
        server via Emotion SSR, then hydrated on the client.
      </p>
    </div>
  );
}

export function ServerComponentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div css={serverStyles}>
      <span style={{ fontWeight: 700, color: '#0070f3' }}>📦 Server Component</span>
      <p style={{ margin: '8px 0 4px', color: '#333' }}>
        This wrapper is rendered on the server. It contains Emotion-powered
        client components below:
      </p>
      <code>Server Component → Client Components (with SSR styles)</code>
      {children}
    </div>
  );
}
