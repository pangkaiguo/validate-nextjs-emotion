'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

// ==========================================
// SSG Demo Components
// These are used in the /ssg-demo page to show
// Emotion styles rendered during static generation
// ==========================================

const CardWrapper = styled.div<{ accent?: string }>`
  background: ${(props) => props.accent || 'white'};
  border-radius: 12px;
  padding: 24px;
  margin: 12px 0;
  border: 2px solid #eaeaea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #28a745;
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

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: #28a745;
  color: white;
`;

const gradientCardStyle = css`
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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

export function SSGCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <CardWrapper accent="white">
      <Badge>SSG Client Component</Badge>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {children}
    </CardWrapper>
  );
}

export function StyledSSGCard() {
  return (
    <div css={gradientCardStyle}>
      <span css={iconStyle}>{'\u{1F9F1}'}</span>
      <h3 css={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
        Emotion SSG Gradient
      </h3>
      <p css={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
        This gradient was rendered at build time and embedded in the static HTML.
        No server needed to serve this page!
      </p>
    </div>
  );
}
