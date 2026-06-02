'use client';

import React from 'react';
import styled from 'styled-components';

// ==========================================
// Styled-components examples
// These are SSR'd via StyledComponentsRegistry
// styled-components has FIRST-CLASS Next.js support
// ==========================================

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 12px 0;
  border: 2px solid #eaeaea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #7928ca;
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
  background: #7928ca;
  color: white;
`;

const GradientCard = styled.div`
  background: linear-gradient(135deg, #7928ca 0%, #ff0080 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  margin: 12px 0;
`;

const GradientIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 12px;
  display: block;
`;

const GradientTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.4rem;
`;

const GradientText = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #7928ca 0%, #ff0080 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const CounterDisplay = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: #7928ca;
  margin: 0 16px;
`;

// Interactive component
export function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
      <Button onClick={() => setCount(c => c - 1)}>-</Button>
      <CounterDisplay>{count}</CounterDisplay>
      <Button onClick={() => setCount(c => c + 1)}>+</Button>
    </div>
  );
}

export function SCDemoCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <Badge>styled-components ✅ Official Support</Badge>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {children}
    </Card>
  );
}

export function SCGradientCard() {
  return (
    <GradientCard>
      <GradientIcon>🎨</GradientIcon>
      <GradientTitle>styled-components SSR with Next.js</GradientTitle>
      <GradientText>
        This gradient is styled with styled-components — officially supported by Next.js.
        No extra registry configuration needed beyond next.config.ts.
      </GradientText>
    </GradientCard>
  );
}
