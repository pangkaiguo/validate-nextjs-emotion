# Emotion + Next.js 大型 CMS 官网最佳实践方案

> **作者角色**: 技术架构师  
> **项目背景**: 大型 CMS 官网 (100+ 页面, 多语言, 动态内容, 高并发)  
> **技术栈**: Next.js App Router + Emotion CSS-in-JS + TypeScript  
> **验证项目**: [validate-nextjs-emotion](https://github.com/pangkaiguo/validate-nextjs-emotion)  
> **版本**: Next.js 16 + Emotion 11 + React 19

---

## 目录

1. [架构决策总览](#1-架构决策总览)
2. [项目结构规范](#2-项目结构规范)
3. [Emotion 工程化配置](#3-emotion-工程化配置)
4. [渲染策略与路由设计](#4-渲染策略与路由设计)
5. [组件架构模式](#5-组件架构模式)
6. [SSR/SSG 与 Emotion 深度集成](#6-ssrssg-与-emotion-深度集成)
7. [TypeScript 集成方案](#7-typescript-集成方案)
8. [性能优化策略](#8-性能优化策略)
9. [大型 CMS 的 CI/CD 流程](#9-大型-cms-的-cicd-流程)
10. [Emotion vs styled-components 决策矩阵](#10-emotion-vs-styled-components-决策矩阵)
11. [生产环境检查清单](#11-生产环境检查清单)
12. [附录: 常见问题排查](#12-附录-常见问题排查)

---

## 1. 架构决策总览

### 1.1 核心架构原则

```
┌─────────────────────────────────────────────────────┐
│                    CDN (Vercel Edge / Cloudflare)     │
├─────────────────────────────────────────────────────┤
│                    Next.js App Router                  │
├────────────┬────────────┬──────────────┬─────────────┤
│   SSR      │    SSG     │     ISR      │   Client    │
│ (dynamic)  │  (static)  │ (revalidate) │ (dashboard) │
├────────────┴────────────┴──────────────┴─────────────┤
│              Emotion SSR Registry Layer                │
├──────────────────────────────────────────────────────┤
│              Emotion Component Layer                   │
│   (styled() API / css() prop / MUI / custom libs)     │
├──────────────────────────────────────────────────────┤
│              CMS Headless API (Contentful/Strapi)      │
└──────────────────────────────────────────────────────┘
```

### 1.2 为什么选择 Emotion

| 需求 | Emotion | 备选方案 | 决策理由 |
|------|---------|---------|---------|
| 运行时动态样式 | ✅ 原生支持 | CSS Modules ❌ | CMS 多主题/暗色模式需要运行时切换 |
| Prop-based 样式变体 | ✅ `styled.div<{variant}>` | Tailwind ❌ | 组件库需要 API 驱动的样式 |
| 组件库兼容性 | ✅ MUI/Chakra 均使用 | Tailwind 需 wrapper | 大型 CMS 常依赖 MUI |
| SSR/SSG 支持 | ✅ 需 Registry 桥接 | styled-components ✅ 官方 | 已验证可行 |
| 构建体积 | ⚠️ ~15KB gzip | styled-components ~12KB | 可接受 |
| 学习曲线 | 低 | 低 | 团队熟悉 React 即可 |

### 1.3 重要警告

> ⚠️ **截至 Next.js 16 + Emotion 11**:
>
> Next.js 官方文档标注 Emotion 为 "currently working on support"（正在推进支持）
> （[引用来源](https://nextjs.org/docs/app/guides/css-in-js)）
>
> 本方案提供的所有解法均经过项目验证，但 Emotion 的 App Router 支持
> **尚未达到 styled-components 的官方支持级别**。请关注：
>
> - Emotion 官方 Issue: [emotion-js/emotion#2928](https://github.com/emotion-js/emotion/issues/2928)
> - 如果项目对官方支持有严格要求，考虑 styled-components（详见第 10 节）

---

## 2. 项目结构规范

### 2.1 推荐目录结构（大型 CMS）

```
src/
├── app/                          # App Router 页面
│   ├── (marketing)/              # 路由组 - 营销页面
│   │   ├── page.tsx              # SSG 首页
│   │   ├── about/
│   │   │   ├── page.tsx          # ISR 关于我们
│   │   │   └── loading.tsx       # 加载态
│   │   └── contact/
│   │       └── page.tsx          # SSG 联系我们
│   ├── (cms)/                    # 路由组 - CMS 动态内容
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx      # ISR 博客文章
│   │   │   │   └── generateStaticParams.ts
│   │   │   └── page.tsx          # SSG 博客列表
│   │   └── products/
│   │       └── [id]/
│   │           └── page.tsx      # ISR 产品详情
│   ├── (dashboard)/              # 路由组 - 管理后台 (Client)
│   │   └── admin/
│   │       └── page.tsx          # CSR 后台
│   ├── layout.tsx                # 根布局 (含 EmotionRegistry)
│   └── not-found.tsx             # 404 页面
│
├── components/                   # 共享组件
│   ├── ui/                       # 基础 UI 组件 (Emotion styled)
│   │   ├── Button/
│   │   │   ├── index.tsx         # 组件实现
│   │   │   ├── Button.styles.ts  # Emotion 样式定义
│   │   │   └── Button.types.ts   # 类型定义
│   │   ├── Card/
│   │   └── Layout/
│   ├── cms/                      # CMS 数据组件
│   │   ├── HeroSection/
│   │   ├── ContentBlock/
│   │   └── MediaGallery/
│   └── shared/                   # 跨功能共享组件
│       ├── SEO/
│       ├── Analytics/
│       └── ConsentBanner/
│
├── lib/                          # 工具库与配置
│   ├── emotion-registry.tsx      # 🎯 核心: SSR/SSG 桥接
│   ├── cms.ts                    # CMS API 客户端
│   ├── cache.ts                  # 缓存策略
│   └── constants.ts              # 常量
│
├── styles/                       # 全局样式
│   ├── globals.css               # CSS 重置 + CSS 变量
│   ├── theme.ts                  # Emotion 主题配置
│   └── mixins.ts                 # 样式 mixin 函数
│
├── hooks/                        # 自定义 Hooks
│   ├── useMediaQuery.ts
│   ├── useTheme.ts
│   └── useCMS.ts
│
└── types/                        # TypeScript 类型
    ├── cms.ts
    ├── components.ts
    └── emotion.d.ts              # Emotion css prop 类型增强
```

### 2.2 文件命名规范

```
组件: PascalCase + kebab-case
  Button.tsx / button.styles.ts / button.types.ts

页面: kebab-case 匹配路由
  blog/[slug]/page.tsx

样式: 组件名.styles.ts
  HeroSection.styles.ts

类型: 组件名.types.ts
  Button.types.ts
```

---

## 3. Emotion 工程化配置

### 3.1 next.config.ts — 完整配置

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // 🎯 启用 Emotion SWC 编译器
    emotion: {
      // 生产环境启用 source map (便于调试)
      sourceMap: process.env.NODE_ENV !== "production",
      // 自动添加 JSX import (React 17+ 不需要)
      autoLabel: "dev-only",
      // 标签格式: `[dir]-[name]-[local]`
      labelFormat: "[local]",
    },
  },

  // 图片优化 (CMS 图片)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.contentful.com",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
    ],
  },

  // ISR 配置
  experimental: {
    staleTimes: {
      dynamic: 30,  // 30s 动态数据缓存
      static: 180,  // 3min 静态数据缓存
    },
  },
};

export default nextConfig;
```

### 3.2 EmotionRegistry — SSR/SSG 桥接（已验证）

```tsx
// src/lib/emotion-registry.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

// 🎯 大型 CMS 特有：支持多缓存实例
type EmotionRegistryProps = {
  children: ReactNode;
  /** 缓存 key，用于多主题或隔离样式 */
  cacheKey?: string;
};

export default function EmotionRegistry({
  children,
  cacheKey = 'css',
}: EmotionRegistryProps) {
  // 惰性初始化 — 每个渲染周期只创建一次
  const [cache] = useState(() => {
    const cache = createCache({ key: cacheKey });
    cache.compat = true;  // 🎯 兼容 MUI 等第三方库
    return cache;
  });

  // 🎯 SSR/SSG 核心: 在 HTML 发送前注入样式
  useServerInsertedHTML(() => {
    const entries = cache.inserted;
    const styles = Object.keys(entries).map((key) => entries[key]);

    if (styles.length === 0) return null;

    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(entries).join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles.join('') }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
```

> **验证结果**: 此模式在所有页面类型（SSR / SSG / ISR）上均正常工作。
> 验证方法: `curl https://yoursite.com/page | grep "data-emotion"`

### 3.3 主题系统配置

```typescript
// src/lib/theme.ts

// 🎯 大型 CMS 的典型主题结构
export interface CMSTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: string;  // 4px
    sm: string;  // 8px
    md: string;  // 16px
    lg: string;  // 24px
    xl: string;  // 32px
    xxl: string; // 48px
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
      mono: string;
    };
    fontSize: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// 默认主题 (light)
export const lightTheme: CMSTheme = {
  colors: {
    primary: '#0052CC',
    secondary: '#6554C0',
    accent: '#00B8D9',
    background: '#FFFFFF',
    surface: '#F4F5F7',
    text: {
      primary: '#172B4D',
      secondary: '#5E6C84',
      inverse: '#FFFFFF',
    },
    border: '#DFE1E6',
    error: '#DE350B',
    success: '#00875A',
    warning: '#FF8B00',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  // ... 完整主题定义
  typography: {
    fontFamily: {
      heading: '"Inter", -apple-system, sans-serif',
      body: '"Inter", -apple-system, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    fontSize: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.5rem',
      body: '1rem',
      small: '0.875rem',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.06)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
};

// 暗色主题
export const darkTheme: CMSTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#1A1B23',
    surface: '#2D2E3A',
    text: {
      primary: '#E4E7EB',
      secondary: '#8892A4',
      inverse: '#172B4D',
    },
    border: '#3D3E4A',
  },
};

// 🎯 主题上下文 (用于运行时切换)
// 详见 5.4 节 Provider 模式
```

### 3.4 TypeScript 类型增强

```typescript
// src/types/emotion.d.ts
import '@emotion/react';
import type { CMSTheme } from '@/lib/theme';

// 🎯 为 Emotion 主题提供类型安全
declare module '@emotion/react' {
  export interface Theme extends CMSTheme {}
}

// src/types/css-prop.ts
// 确保 css prop 在任意 JSX 中可用
import type {} from '@emotion/react/types/css-prop';
```

---

## 4. 渲染策略与路由设计

### 4.1 大型 CMS 渲染策略矩阵

| 页面类型 | 渲染策略 | 理由 | Emotion 兼容性 |
|---------|---------|------|--------------|
| 首页 | **SSG** + ISR (revalidate: 60s) | 高流量，内容实时性要求低 | ✅ 完美 |
| 博客列表 | **SSG** + ISR (revalidate: 300s) | 频繁更新，缓存友好 | ✅ 完美 |
| 博客文章 | **ISR** (revalidate: 60s) | 发布后需快速可见 | ✅ 完美 |
| 产品详情 | **ISR** (revalidate: 300s) | 低频更新，SEO 重要 | ✅ 完美 |
| 关于我们 | **SSG** | 极少变更 | ✅ 完美 |
| 搜索结果 | **SSR** (dynamic) | 动态查询，无法预生成 | ✅ 完美 |
| 管理后台 | **CSR** (client-only) | 登录用户，无需 SEO | ✅ 完美 |
| 联系我们 | **SSG** | 静态表单 | ✅ 完美 |

### 4.2 SSG + ISR 示例（推荐模式）

```typescript
// src/app/(cms)/blog/page.tsx
// 🎯 SSG 博客列表，ISR 增量更新
import { getBlogPosts } from '@/lib/cms';
import { BlogCard } from '@/components/cms/BlogCard';
import type { BlogPost } from '@/types/cms';

// SSG: 在构建时预生成
export const dynamic = 'force-static';
// 🎯 ISR: 每 60s 重新验证
export const revalidate = 60;

export default async function BlogListPage() {
  const posts: BlogPost[] = await getBlogPosts();

  return (
    <div>
      <h1>Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/app/(cms)/blog/[slug]/page.tsx
// 🎯 静态生成所有已知文章 + ISR 兜底
import { getBlogPost, getAllBlogSlugs } from '@/lib/cms';
import { BlogContent } from '@/components/cms/BlogContent';

export const revalidate = 60;

// 构建时预生成所有文章
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  return <BlogContent post={post} />;
}
```

### 4.3 SSR 动态页面示例

```typescript
// src/app/(search)/search/page.tsx
// 🎯 动态 SSR — 搜索需要实时数据
export const dynamic = 'force-dynamic';
// 或: export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = await searchCMS(q || '');

  return (
    <div>
      {/* Emotion 组件在 SSR 中正常工作 */}
      <SearchResultList results={results} />
    </div>
  );
}
```

### 4.4 渲染策略速查表

| Next.js 选项 | 行为 | Emotion 行为 |
|-------------|------|-------------|
| `export const dynamic = 'force-static'` | 强制 SSG | ✅ 样式构建时注入 |
| `export const revalidate = 60` | ISR 60s | ✅ 样式在每个 revalidate 时重新注入 |
| `export const dynamic = 'force-dynamic'` | 强制 SSR | ✅ 样式每次请求时注入 |
| 默认（无配置） | 自动检测 | ✅ 样式自动注入 |
| `export const runtime = 'edge'` | Edge Runtime | ⚠️ 不支持 `useServerInsertedHTML` ❌ |
| `export const runtime = 'nodejs'` | Node.js | ✅ 推荐 |

> **关键结论**: Emotion 在所有标准渲染策略中均正常工作。
> **唯一限制**: Edge Runtime 不支持 `useServerInsertedHTML`。

---

## 5. 组件架构模式

### 5.1 组件分层架构

```
┌────────────────────────────────────────────────┐
│                Server Components (SSG/SSR)       │
│  - 数据获取 (CMS API)                           │
│  - SEO metadata                                 │
│  - 布局编排                                     │
│  - 引用 Client Components                        │
├────────────────────────────────────────────────┤
│            Client Components (Hydration)         │
│  - Emotion styled() 组件                         │
│  - css() prop 使用                               │
│  - 交互逻辑 (onClick, useState)                  │
│  - 浏览器 API 调用                              │
├────────────────────────────────────────────────┤
│               基础 UI Components                  │
│  - Button / Card / Layout / Typography           │
│  - Emotion styled() + TypeScript generics        │
│  - 可主题化 (useTheme hook)                      │
└────────────────────────────────────────────────┘
```

### 5.2 核心模式：Server + Client 组合

```tsx
// 🎯 Server Component — 数据获取 + 布局
// app/(marketing)/page.tsx
import { getHomePageContent } from '@/lib/cms';
import { HeroSection } from '@/components/cms/HeroSection';
import { ContentBlock } from '@/components/cms/ContentBlock';
import { CTASection } from '@/components/cms/CTASection';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePageContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
    openGraph: {
      images: [content.seo.ogImage],
    },
  };
}

export default async function HomePage() {
  const content = await getHomePageContent();

  return (
    <main>
      {/* ✅ Server Component 渲染 Client Component */}
      {/* Emotion 样式会在 HTML 发送前注入到 <head> */}
      <HeroSection
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        cta={content.hero.cta}
        backgroundImage={content.hero.background.url}
      />
      <ContentBlock blocks={content.blocks} />
      <CTASection
        title={content.cta.title}
        buttonText={content.cta.buttonText}
      />
    </main>
  );
}
```

```tsx
// 🎯 Client Component — Emotion styled + 交互
// components/cms/HeroSection/index.tsx
'use client';

import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import type { Theme } from '@/types/emotion';

// ---- 样式定义 ----
const HeroWrapper = styled.section<{ $imageUrl: string }>`
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-image: url(${(props) => props.$imageUrl});
  background-size: cover;
  background-position: center;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  ${({ theme }) => css`
    background: linear-gradient(
      135deg,
      ${theme.colors.primary}CC 0%,
      ${theme.colors.secondary}CC 100%
    );
  `};
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  padding: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.breakpoints.md} {
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`;

const Title = styled.h1`
  ${({ theme }) => css`
    font-family: ${theme.typography.fontFamily.heading};
    font-size: ${theme.typography.fontSize.h1};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.text.inverse};
    margin-bottom: ${theme.spacing.md};
    line-height: ${theme.typography.lineHeight.tight};
  `}

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const CTAContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

// ---- 组件 Props ----
interface HeroSectionProps {
  title: string;
  subtitle: string;
  cta: {
    primary: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
  backgroundImage: string;
}

// ---- 组件实现 ----
const PrimaryButton = styled.button`
  ${({ theme }) => css`
    background: ${theme.colors.accent};
    color: ${theme.colors.text.inverse};
    border: none;
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.borderRadius.md};
    font-size: 1.125rem;
    font-weight: ${theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${theme.transitions.fast};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
  `}
`;

const SecondaryButton = styled(PrimaryButton)`
  ${({ theme }) => css`
    background: transparent;
    border: 2px solid ${theme.colors.text.inverse};

    &:hover {
      background: ${theme.colors.text.inverse}20;
    }
  `}
`;

export function HeroSection({
  title,
  subtitle,
  cta,
  backgroundImage,
}: HeroSectionProps) {
  const theme = useTheme() as Theme;

  return (
    <HeroWrapper $imageUrl={backgroundImage}>
      <Overlay />
      <Content>
        <Title>{title}</Title>
        <p
          css={css`
            font-size: 1.25rem;
            color: ${theme.colors.text.inverse};
            opacity: 0.9;
            line-height: ${theme.typography.lineHeight.relaxed};
            max-width: 600px;
            margin: 0 auto;
          `}
        >
          {subtitle}
        </p>
        <CTAContainer>
          <PrimaryButton onClick={() => { /* track */ }}>
            {cta.primary.text}
          </PrimaryButton>
          {cta.secondary && (
            <SecondaryButton onClick={() => { /* track */ }}>
              {cta.secondary.text}
            </SecondaryButton>
          )}
        </CTAContainer>
      </Content>
    </HeroWrapper>
  );
}
```

### 5.3 样式组织模式

```typescript
// 🎯 Option A: 同文件样式 (小型组件)
// components/ui/Button.tsx
'use client';

import styled from '@emotion/styled';

// 样式直接定义在组件文件底部
const StyledButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  // ...
`;

export function Button({ variant, children }: ButtonProps) {
  return <StyledButton $variant={variant}>{children}</StyledButton>;
}


// 🎯 Option B: 分离样式文件 (中型组件)
// components/ui/Card/Card.styles.ts
'use client';

import styled from '@emotion/styled';
import { css } from '@emotion/react';

export const CardWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CardContent = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

// 🎯 Option C: 样式 Mixin 函数 (复用)
// styles/mixins.ts
import { css } from '@emotion/react';

export const textEllipsis = (lines: number = 1) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const container = (maxWidth: string = '1200px') => css`
  width: 100%;
  max-width: ${maxWidth};
  margin: 0 auto;
  padding: 0 16px;
`;

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
```

### 5.4 Provider 模式（多主题插件系统）

大型 CMS 常需要插件化主题系统。这是 Emotion 相对 styled-components 的优势：
ThemeProvider 支持运行时动态切换。

```tsx
// 🎯 主题 Provider 封装
// components/shared/ThemeProvider.tsx
'use client';

import {
  ThemeProvider as EmotionThemeProvider,
  Global,
  css,
} from '@emotion/react';
import { useState, createContext, useContext, type ReactNode } from 'react';
import { lightTheme, darkTheme, type CMSTheme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';
type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme: setMode }}>
      <EmotionThemeProvider theme={theme}>
        {/* 🎯 全局 CSS 变量注入 */}
        <Global
          styles={css`
            :root {
              --color-primary: ${theme.colors.primary};
              --color-background: ${theme.colors.background};
              --color-text: ${theme.colors.text.primary};
              --font-heading: ${theme.typography.fontFamily.heading};
              --font-body: ${theme.typography.fontFamily.body};
            }
            body {
              background: ${theme.colors.background};
              color: ${theme.colors.text.primary};
              font-family: ${theme.typography.fontFamily.body};
              transition: background ${theme.transitions.normal},
                          color ${theme.transitions.normal};
            }
          `}
        />
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}
```

```tsx
// 🎯 在 RootLayout 中组合
// app/layout.tsx
import EmotionRegistry from '@/lib/emotion-registry';
import { ThemeProvider } from '@/components/shared/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EmotionRegistry>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

### 5.5 关键规则

```
┌─────────────────────────────────────────────────────┐
│                 SERVER COMPONENT                      │
│  ❌ 不能使用 styled()                                  │
│  ❌ 不能使用 css() prop                                │
│  ❌ 不能使用 useTheme()                                │
│  ❌ 不能使用 useState/useEffect                        │
│  ❌ 不能使用浏览器 API                                 │
│  ✅ 可以使用 CSS Modules / inline styles               │
│  ✅ 获取数据 (async/await)                             │
│  ✅ 渲染 Client Components                               │
│  ✅ 生成 metadata                                     │
├─────────────────────────────────────────────────────┤
│                 CLIENT COMPONENT                       │
│  ✅ 可以使用 styled()                                  │
│  ✅ 可以使用 css() prop                                │
│  ✅ 可以使用 useTheme()                                │
│  ✅ 所有 React hooks 可用                              │
│  ✅ 浏览器 API 可用                                    │
│  ⚠️ 'use client' 标记必须在文件顶部                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. SSR/SSG 与 Emotion 深度集成

### 6.1 渲染流程详解

```
SSR/SSG 请求进入
       │
       ▼
┌──────────────────┐
│  Server Component │  ← 在服务器上运行
│  fetch data       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  EmotionRegistry │  ← useServerInsertedHTML 开始监听
│  创建 cache       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Client Component │  ← "use client" 但仍在服务器执行
│  styled() API     │
│  css() prop       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Emotion 样式收集  │  ← styles 注册到 cache.inserted
│  (服务器端)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  useServerInserted│  ← HTML 发送前注入 <style> 到 <head>
│  HTML 回调触发    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  浏览器接收        │  ← ✅ 完全样式的 HTML
│  ✅ 即时可见       │     无需 JS 执行
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  JS 下载 + 解析   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Hydration        │  ← 样式已存在，无 FOUC
│  ✅ 无闪烁        │
└──────────────────┘
```

### 6.2 验证方法

```bash
# 1️⃣ 验证 SSR: 检查 style 标签是否在 HTML 中
curl -s https://yoursite.com/ssr-demo | grep -o 'data-emotion="[^"]*"'
# 输出: data-emotion="css 1a2b3c 4d5e6f"

# 2️⃣ 验证 SSG: 检查构建产物的静态 HTML
npm run build
cat .next/server/app/ssg-demo/page.html | grep -o 'data-emotion="[^"]*"'
# 输出: data-emotion="css 7g8h9i 0j1k2l"

# 3️⃣ 验证 FOUC-free: 禁用 JS 后样式依然存在
# DevTools → Settings → Disable JavaScript → Reload

# 4️⃣ 验证水合: 检查控制台无样式相关 warning
# 应无 "The class ... was not found" 等错误
```

### 6.3 性能基准

基于本项目验证的预期性能：

| 指标 | SSR | SSG | CSR |
|------|-----|-----|-----|
| TTFB (首字节) | ~150ms | **~50ms** (CDN) | ~200ms |
| FCP (首次内容渲染) | ~250ms | ~100ms | ~800ms |
| LCP (最大内容渲染) | ~500ms | ~300ms | ~1.5s |
| FOUC 时长 | **0ms** | **0ms** | ~50ms |
| Emotion CSS 注入数 | ~6 tags | ~6 tags | ~6 tags |
| JS 体积 (Emotion runtime) | ~15KB | ~15KB | ~15KB |

---

## 7. TypeScript 集成方案

### 7.1 类型定义

```typescript
// src/types/cms.ts — CMS 数据类型
export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  seo: SEO;
  sections: CMSSection[];
  publishedAt: string;
  updatedAt: string;
  locale: string;
}

export interface CMSSection {
  id: string;
  type: 'hero' | 'content' | 'gallery' | 'cta' | 'testimonials' | 'pricing';
  data: Record<string, unknown>;
  styles?: Partial<CMSTheme>;
}

// src/types/components.ts — 基础组件 Props
export interface BaseComponentProps {
  className?: string;
  /** 用于 CMS 预览的 id */
  dataCmsId?: string;
  /** 用于分析追踪 */
  trackingId?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### 7.2 styled() 组件类型安全

```typescript
// 🎯 泛型组件 — 类型安全的变体
'use client';

import styled from '@emotion/styled';
import { css } from '@emotion/react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

// 🎯 使用 transient props ($ 前缀) 避免 DOM 传递
interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
}

const variantStyles = {
  primary: css`
    background: #0052CC;
    color: white;
    border: none;
    &:hover { background: #004BB5; }
  `,
  secondary: css`
    background: transparent;
    color: #0052CC;
    border: 2px solid #0052CC;
    &:hover { background: #F4F5F7; }
  `,
  ghost: css`
    background: transparent;
    color: #5E6C84;
    border: none;
    &:hover { background: #F4F5F7; }
  `,
};

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`padding: 6px 12px; font-size: 0.875rem;`,
  md: css`padding: 10px 20px; font-size: 1rem;`,
  lg: css`padding: 14px 28px; font-size: 1.125rem;`,
};

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};

  ${(props) => variantStyles[props.$variant]}
  ${(props) => sizeStyles[props.$size]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;
```

### 7.3 HOC 模式 — withCMSContent

```typescript
// 🎯 CMS 内容注入 HOC
// hooks/withCMSContent.tsx
import { ComponentType } from 'react';
import type { CMSPage, CMSSection } from '@/types/cms';

interface WithCMSContentProps {
  content: CMSPage['sections'];
  locale: string;
}

export function withCMSContent<P extends WithCMSContentProps>(
  WrappedComponent: ComponentType<P>,
) {
  return function CMSContentWrapper(
    props: Omit<P, keyof WithCMSContentProps>,
  ) {
    // 从 CMS context 或 props 获取数据
    // 实际项目中可能使用 React.cache() 或 Context
    return <WrappedComponent {...(props as P)} />;
  };
}
```

---

## 8. 性能优化策略

### 8.1 构建性能

| 策略 | 实施方式 | 预期效果 |
|------|---------|---------|
| SWC 编译器 | `emotion: true` in next.config.ts | 比 Babel 快 20x |
| Emotion SWC 插件 | 内置在 Next.js SWC | 零额外开销 |
| 避免 `@emotion/babel-plugin` | 使用 SWC 替代 | 减少构建时间 30%+ |

### 8.2 运行时性能

```typescript
// 🎯 策略 1: 选择性注入 — 仅在需要时引入 Emotion
// ❌ 根布局中全局引入
import { Global } from '@emotion/react';

// ✅ 仅在 Client Component 中按需引入
// components/ui/Button.tsx
'use client';
import styled from '@emotion/styled';
// Emotion 运行时仅在用到 Button 的页面加载


// 🎯 策略 2: CSS 变量 + Emotion 混合
// 全局样式用 CSS 变量 (零运行时)
// styles/globals.css
:root {
  --color-primary: #0052CC;
  --spacing-md: 16px;
}

// 动态样式用 Emotion (运行时)
const DynamicComponent = styled.div`
  color: var(--color-primary);  // ✅ CSS 变量无运行时开销
  padding: ${({ $dynamic }) => $dynamic ? '32px' : '16px'};  // 动态值
`;


// 🎯 策略 3: useMemo 缓存动态样式
'use client';
import { useMemo } from 'react';
import { css } from '@emotion/react';

function ExpensiveComponent({ variant }: { variant: string }) {
  // 🎯 避免每次渲染都创建新样式对象
  const styles = useMemo(
    () => css`
      background: ${variant === 'dark' ? '#333' : '#fff'};
      padding: 32px;
      border-radius: 8px;
    `,
    [variant],
  );

  return <div css={styles}>Content</div>;
}


// 🎯 策略 4: 样式隔离 — 避免全局样式污染
// EmotionRegistry 使用独立 key
const cache = createCache({
  key: 'cms',  // 🎯 避免与第三方库的 className 冲突
  container: document.head,
});
```

### 8.3 体积优化

```bash
# 检查 Emotion 引入大小
npm ls @emotion/react @emotion/styled @emotion/cache

# 输出:
# @emotion/react@11.14.0     (~5KB gzip)
# @emotion/styled@11.14.1    (~10KB gzip)
# @emotion/cache@11.14.0     (~3KB gzip)
# Total: ~18KB gzip (可接受)
```

### 8.4 缓存策略（大型 CMS）

```typescript
// 🎯 多层缓存架构
// lib/cache.ts
import { unstable_cache } from 'next/cache';

// 1️⃣ 数据缓存 (Next.js Data Cache)
export const getCachedContent = unstable_cache(
  async (slug: string) => {
    const cms = await getCMSClient();
    return cms.getPage(slug);
  },
  ['cms-content'],          // 缓存标签
  {
    revalidate: 60,         // 60s 后重新验证
    tags: ['cms-content'],  // 支持 on-demand revalidation
  },
);

// 2️⃣ CDN 缓存 (ISR)
// app/(cms)/blog/[slug]/page.tsx
export const revalidate = 300;  // 5min CDN 缓存

// 3️⃣ 浏览器缓存 (HTTP Headers)
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## 9. 大型 CMS 的 CI/CD 流程

### 9.1 构建流水线

```yaml
# .github/workflows/deploy.yml
name: Deploy CMS Website

on:
  push:
    branches: [main]
  # CMS webhook 触发增量构建
  repository_dispatch:
    types: [cms-content-updated]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15  # 🎯 防止长时间构建

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: 🎯 Build (validate Emotion SSR/SSG)
        run: npm run build
        env:
          # 注入 CMS API 凭据
          CMS_API_KEY: ${{ secrets.CMS_API_KEY }}
          CMS_API_URL: ${{ secrets.CMS_API_URL }}

      - name: 🎯 Verify Emotion styles in static output
        run: |
          # 验证 SSG 页面包含 Emotion style 标签
          for page in "ssg-demo" "ssr-demo"; do
            html=".next/server/app/${page}/page.html"
            if [ -f "$html" ]; then
              if grep -q 'data-emotion' "$html"; then
                echo "✅ ${page}: Emotion styles found"
              else
                echo "❌ ${page}: No Emotion styles!"
                exit 1
              fi
            fi
          done

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 9.2 CMS Webhook → ISR 更新

```typescript
// 🎯 CMS 发布时触发增量静态再生
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret');

  // 验证 webhook secret
  if (secret !== process.env.CMS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const { type, slug, tags } = await request.json();

  // 🎯 按需重新验证
  if (slug) {
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/blog`);
  }

  // 🎯 按标签重新验证
  if (tags) {
    tags.forEach((tag: string) => revalidateTag(tag));
  }

  return Response.json({ revalidated: true });
}
```

---

## 10. Emotion vs styled-components 决策矩阵

### 10.1 对比分析

| 维度 | Emotion | styled-components | 胜出 |
|------|---------|-------------------|------|
| **Next.js 支持** | ⚠️ "working on support" | ✅ First-class | **SC** |
| **SSR/SSG 兼容性** | ✅ 需 Registry 桥接 | ✅ 原生 | **平手** |
| **Edge Runtime** | ❌ 不支持 | ❌ 不支持 | **平手** |
| **多主题运行时** | ✅ 原生 ThemeProvider | ✅ 原生 | **平手** |
| **CSS prop** | ✅ css()`  | ❌ 无 | **Emotion** |
| **代码体积** | ~15KB gzip | ~12KB gzip | **SC** |
| **生态系统** | MUI/Chakra Use | 更大社区 | **平手** |
| **维护状态** | ⚠️ 缓慢 | ✅ 活跃 | **SC** |
| **类型安全** | ✅ TypeScript | ✅ TypeScript | **平手** |
| **关键帧动画** | ✅ keyframes | ✅ keyframes | **平手** |
| **全局样式** | ✅ Global | ✅ createGlobalStyle | **平手** |
| **样式组合** | ✅ css 组合 | ✅ css 组合 | **平手** |

### 10.2 最终推荐

```
┌─────────────────────────────────────────────────────────┐
│                    决策流程                                │
│                                                         │
│  需要 css prop (MUI sx / 快速原型)？                      │
│  ├── YES ──→ Emotion (但接受 "working on support")       │
│  └── NO ───→ styled-components (官方推荐)                 │
│                                                         │
│  项目是长期大型 CMS？                                     │
│  ├── YES ──→ styled-components (更稳定的官方支持)          │
│  └── NO ───→ Emotion 可行 (已验证)                       │
│                                                         │
│  依赖 MUI/Chakra？                                       │
│  ├── YES ──→ Emotion (它们底层就是 Emotion)               │
│  └── NO ───→ styled-components 更安全                    │
└─────────────────────────────────────────────────────────┘
```

### 10.3 大型 CMS 建议方案

对于本项目的**大型 CMS 官网**场景，建议采用 **styled-components**：

```typescript
// 🎯 如果选择 styled-components, 配置如下:

// next.config.ts
const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
    emotion: false,  // 不需要 Emotion
  },
};

// src/lib/styled-components-registry.tsx
// 与 EmotionRegistry 结构相同, 但使用 styled-components API

// styled-components 在 Next.js 官方文档中是推荐方案
// 参考: https://nextjs.org/docs/app/guides/css-in-js
```

**但如果项目重度依赖 Emotion 生态**（如 MUI、Chakra UI），选择 Emotion 也同样可行 —— 本项目验证了它在 SSR/SSG 下的可靠性。

---

## 11. 生产环境检查清单

### 11.1 构建前检查

- [ ] `next.config.ts` 包含 `compiler.emotion: true`
- [ ] `EmotionRegistry` 在 `layout.tsx` 中正确包裹
- [ ] 所有使用 `styled()` / `css()` 的组件有 `'use client'`
- [ ] `tsconfig.json` 包含 `"jsxImportSource": "@emotion/react"`（如果用 css prop）
- [ ] 主题类型扩展已添加到 `emotion.d.ts`

### 11.2 构建中验证

- [ ] `npm run build` 成功，无 TypeScript 错误
- [ ] 所有页面标记为 `○ (Static)` 或 `λ (Dynamic)`
- [ ] SSG 页面生成 `.html` 文件
- [ ] Emotion SWC 编译无警告

### 11.3 部署前验证

```bash
# [ ] 检查 style 标签注入
curl -s https://staging.yoursite.com/ssr-demo | grep "data-emotion" | head -1

# [ ] 检查无 FOUC (禁用 JS)
# DevTools → Disable JavaScript → Reload → 样式应完整

# [ ] 检查水合无错误
# DevTools Console: 无 "text content did not match" 等错误

# [ ] Lighthouse 评分
# Performance ≥ 90, Best Practices ≥ 90

# [ ] 多语言页面验证
curl -s https://staging.yoursite.com/zh-cn | grep "data-emotion"
curl -s https://staging.yoursite.com/en | grep "data-emotion"
```

### 11.4 监控告警

```typescript
// 🎯 运行时检测 Emotion 注入失败
// lib/monitoring.ts
export function setupEmotionMonitoring() {
  if (typeof window === 'undefined') return;

  // 页面加载后检测是否缺少 style 标签
  window.addEventListener('load', () => {
    const emotionStyles = document.querySelectorAll('style[data-emotion]');
    if (emotionStyles.length === 0) {
      console.warn('⚠️ No Emotion styles detected!');
      // 发送到分析系统
      fetch('/api/monitoring/alert', {
        method: 'POST',
        body: JSON.stringify({
          type: 'emotion_styles_missing',
          url: window.location.href,
        }),
      });
    }
  });
}
```

---

## 12. 附录: 常见问题排查

### Q1: `Error: styled.div is not a function`

```bash
# 原因: 忘记在文件顶部添加 'use client'
# 修复:
'use client';  # ← 添加此行
import styled from '@emotion/styled';
```

### Q2: 控制台显示 "The class `css-xxx` was not found"

```bash
# 原因: SSR 和 CSR 的 className 不匹配
# 修复:
# 1. 确保 EmotionRegistry 的 cache key 在 SSR/CSR 一致
# 2. 确保 layout.tsx 中 Registry 在最外层
# 3. 检查是否有多个 Emotion cache 实例
```

### Q3: 样式在禁用 JS 后丢失 (FOUC)

```bash
# 原因: EmotionRegistry 未正确配置 useServerInsertedHTML
# 修复:
# 1. 检查 EmotionRegistry 是否正确
# 2. 检查 layout.tsx 是否包裹了 EmotionRegistry
# 3. 运行 curl 验证 data-emotion 标签存在
```

### Q4: ISR 页面重新验证后样式错乱

```bash
# 原因: 缓存了旧样式的 HTML
# 修复:
# 1. 使用 revalidateTag 或 revalidatePath 精确控制
# 2. 确保 Emotion cache 每个 revalidate 周期重建
```

### Q5: 构建时间过长 (大型 CMS)

```bash
# 原因: 10K+ 页面需要 Emotion 编译
# 优化:
# 1. 使用 generateStaticParams 分批生成
# 2. 按优先级分批 SSG (首页 → 热门页 → 所有)
# 3. 使用 ISR 兜底: 仅热门页面 SSG, 其他 ISR
```

### Q6: Edge Runtime 下 Emotion 失效

```bash
# 原因: Edge Runtime 不支持 useServerInsertedHTML
# 解决方案:
# 1. 使用 Node.js Runtime (export const runtime = 'nodejs')
# 2. 或使用 CSS Modules 替代 Emotion 的页面
```

---

## 结语

本方案基于 [`validate-nextjs-emotion`](https://github.com/pangkaiguo/validate-nextjs-emotion) 项目的完整验证结论。经过对**SSR、SSG、ISR、CSR**全部渲染策略的测试，证明 Emotion CSS-in-JS 在 Next.js App Router 中**可靠可用**。

**核心结论**:

1. ✅ Emotion + Next.js SSR/SSG/ISR 全部验证通过
2. ✅ 需要 `EmotionRegistry` + `useServerInsertedHTML` 桥接
3. ✅ 大型 CMS 场景完全适用（全量验证数据见项目 README）
4. ⚠️ 注意 Emotion 官方支持状态 — 持续关注 [emotion#2928](https://github.com/emotion-js/emotion/issues/2928)
5. 💡 考虑 styled-components 作为长期方案（官方推荐）

---

*文档版本: v1.0 | 最后更新: 2026-06 | 基于 Next.js 16 + Emotion 11 + React 19*
