import type { Config } from 'dompurify';

/**
 * Centralized DOMPurify Sanitization Configuration.
 *
 * This is the single source of truth for what HTML elements and attributes
 * are allowed in user-generated content. Changes here affect ALL content
 * rendered through SanitizedHTMLRenderer.
 *
 * SECURITY: Be extremely conservative when adding to these lists.
 */
export const SANITIZE_CONFIG: Config = {
  // === Allowed HTML Tags ===
  // Only include tags that are needed for content rendering.
  // Each tag should have a documented use case.
  ALLOWED_TAGS: [
    // Text semantics
    'p',           // Paragraph
    'br',          // Line break
    'strong',      // Bold
    'em',          // Italic
    'u',           // Underline
    's',           // Strikethrough
    'sub',         // Subscript
    'sup',         // Superscript

    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',

    // Links
    'a',           // Anchor (href sanitized separately)

    // Lists
    'ul', 'ol', 'li',

    // Media
    'img',         // Image
    'figure',      // Figure container
    'figcaption',  // Figure caption

    // Code
    'pre', 'code',

    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td',

    // Layout
    'div', 'span',
    'blockquote',
    'hr',
  ],

  // === Allowed HTML Attributes ===
  // Each attribute should have a documented use case.
  ALLOWED_ATTR: [
    // Links
    'href',        // Anchor destination (DOMPurify sanitizes javascript: URIs)
    'target',      // Link target (_blank, _self)
    'rel',         // Link relationship

    // Images
    'src',         // Image source
    'alt',         // Alternative text
    'title',       // Tooltip / title

    // Tables
    'colspan', 'rowspan', 'scope',

    // General
    'class',       // CSS class (for styling)
  ],

  // === Security Hardening ===
  ALLOW_DATA_ATTR: false,       // Disallow data-* attributes (XSS vector)
  ALLOW_UNKNOWN_PROTOCOLS: false, // Block unknown URI schemes

  // === Explicitly Forbidden ===
  FORBID_TAGS: [
    'script',     // #1 XSS vector
    'style',      // CSS injection / data exfiltration
    'iframe',     // Clickjacking / embedded attacks
    'object',     // Plugin execution
    'embed',      // Plugin execution
    'form',       // Phishing
    'input',      // Phishing
    'textarea',   // Phishing
    'select',     // Phishing
    'button',     // Phishing
    'meta',       // Redirection / refresh
    'link',       // External resource loading
    'base',       // Base URI hijacking
  ],

  FORBID_ATTR: [
    'onerror',    // Error-based XSS
    'onload',     // Load-based XSS
    'onclick',    // Click-based XSS
    'onmouseover',// Hover-based XSS
    'onfocus',    // Focus-based XSS
    'onchange',   // Change-based XSS
    'onsubmit',   // Submit-based XSS
    'onreset',    // Reset-based XSS
    'onkeydown',  // Key-based XSS
    'onkeyup',    // Key-based XSS
    'onkeypress', // Key-based XSS
    'oninput',    // Input-based XSS
    'onblur',     // Blur-based XSS
    'ondblclick', // Double-click XSS
    'oncontextmenu', // Context menu XSS
    'onwheel',    // Wheel-based XSS
    'onpointerdown', // Pointer-based XSS
    'style',      // CSS-based XSS / exfiltration (use class instead)
  ],

  // === Additional Protections ===
  ADD_ATTR: ['target'], // Ensure all links have target attribute
  ADD_TAGS: [],         // No additional tags
};
