/**
 * Core types for structured content rendering.
 *
 * All CMS content is represented as an ordered array of ContentBlock objects.
 * This eliminates the need for dangerouslySetInnerHTML entirely.
 */

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  data: Record<string, unknown>;
  children?: ContentBlock[];
}

export type ContentBlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'code'
  | 'list'
  | 'list-item'
  | 'quote'
  | 'embed'
  | 'divider'
  | 'table';

export interface StructuredContent {
  blocks: ContentBlock[];
}

// Block-specific data interfaces
export interface HeadingData {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CodeData {
  language: string;
  code: string;
  showLineNumbers?: boolean;
}

export interface LinkData {
  href: string;
  text: string;
  target?: '_blank' | '_self';
  rel?: string;
}

export interface ParagraphData {
  text: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface ListData {
  items: string[];
  ordered?: boolean;
}

export interface QuoteData {
  text: string;
  author?: string;
}
