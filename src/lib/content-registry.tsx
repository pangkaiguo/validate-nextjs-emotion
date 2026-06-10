import React from 'react';
import type { ContentBlock, ContentBlockType } from '@/types/content';
import { ParagraphBlock } from '@/components/blocks/paragraph-block';
import { HeadingBlock } from '@/components/blocks/heading-block';
import { ImageBlock } from '@/components/blocks/image-block';
import { CodeBlock } from '@/components/blocks/code-block';
import { ListBlock } from '@/components/blocks/list-block';
import { QuoteBlock } from '@/components/blocks/quote-block';
import { DividerBlock } from '@/components/blocks/divider-block';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Generic block component type used in the registry.
 * All block components share the same interface: they receive typed data
 * and optional children (for nested block structures).
 */
type BlockComponent = React.ComponentType<{
  data: Record<string, unknown>;
  children?: React.ReactNode;
}>;

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Content Block Registry
 *
 * Maps each ContentBlockType to its corresponding React component.
 * This is the central routing table for the Structured Content rendering strategy.
 *
 * ## Adding a New Block Type
 *
 * 1. Add the type to the `ContentBlockType` union in `@/types/content`
 * 2. Create a new component in `@/components/blocks/`
 * 3. Register it in this registry:
 *
 * ```typescript
 * import { VideoBlock } from '@/components/blocks/video-block';
 *
 * // In the registry:
 * video: VideoBlock,
 * ```
 *
 * ## Alias Blocks
 *
 * Some block types share rendering logic with others. Aliases are documented below:
 *
 * | Alias Type   | Actual Component | Reason                     |
 * |-------------|------------------|----------------------------|
 * | `list-item` | ParagraphBlock   | List items = text only     |
 * | `embed`     | ImageBlock       | Embeds use src + alt       |
 * | `table`     | ParagraphBlock   | Simplified text fallback   |
 */
export const BLOCK_REGISTRY: Record<ContentBlockType, BlockComponent> = {
  // Core content types
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  code: CodeBlock,
  list: ListBlock,
  quote: QuoteBlock,
  divider: DividerBlock,

  // Aliases (reuse existing components)
  'list-item': ParagraphBlock,  // List items render as simple text
  embed: ImageBlock,            // Embeds reuse image src/alt pattern
  table: ParagraphBlock,        // Simplified: tables render as text fallback
};

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Resolves a ContentBlock to its registered React component.
 *
 * @param block - The content block to resolve
 * @returns The registered component, or null if the type is unknown
 */
export function resolveBlockComponent(
  block: ContentBlock
): BlockComponent | null {
  const Component = BLOCK_REGISTRY[block.type];
  return Component ?? null;
}

/**
 * Returns the list of all registered block type identifiers.
 * Useful for validation, debugging, and generating type documentation.
 */
export function getRegisteredBlockTypes(): ContentBlockType[] {
  return Object.keys(BLOCK_REGISTRY) as ContentBlockType[];
}

/**
 * Checks if a given block type is registered in the registry.
 *
 * @param type - The block type to check
 * @returns `true` if the type has a registered component
 */
export function isBlockTypeRegistered(type: string): type is ContentBlockType {
  return type in BLOCK_REGISTRY;
}
