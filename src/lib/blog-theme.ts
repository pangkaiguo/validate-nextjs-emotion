// ============================================================
// 📐 Shared Blog Theme — consistent styling across all pages
// ============================================================

export const blogTheme = {
  // Container
  container: {
    maxWidth: '1200px',
    padding: '40px 24px',
    margin: '0 auto',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    lineHeight: 1.7,
    color: '#333',
  },

  // Typography
  h1: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#1a1a2e',
    letterSpacing: '-0.02em',
    marginBottom: '8px',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a1a2e',
    borderBottom: '2px solid #e8e8e8',
    paddingBottom: '10px',
    marginTop: '40px',
    marginBottom: '20px',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: '12px',
    lineHeight: 1.4,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '32px',
    lineHeight: 1.6,
  },
  body: {
    fontSize: '1rem',
    color: '#444',
    lineHeight: 1.7,
    marginBottom: '16px',
  },
  caption: {
    fontSize: '0.8rem',
    color: '#999',
    lineHeight: 1.5,
  },

  // Cards & Sections
  card: {
    background: '#fff',
    border: '1px solid #eaeaea',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  },
  cardHover: {
    boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)',
    transform: 'translateY(-2px)',
  },
  infoBox: {
    background: '#f0f7ff',
    border: '1px solid #b8d4fe',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '24px',
    color: '#1a56db',
  },
  warningBox: {
    background: '#fffbe6',
    border: '1px solid #ffe58f',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '24px',
    color: '#ad8b00',
  },
  successBox: {
    background: '#f0fff4',
    border: '1px solid #b7eb8f',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '24px',
    color: '#2d6a4f',
  },
  dangerBox: {
    background: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '24px',
    color: '#a8071a',
  },

  // Code blocks
  codeInline: {
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    fontSize: '0.85rem',
    color: '#d63384',
  },
  codeBlock: {
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: '20px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    lineHeight: 1.6,
    overflowX: 'auto' as const,
    marginBottom: '20px',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },

  // Navigation
  nav: {
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eaeaea',
  },
  navLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '4px',
    transition: 'color 0.2s',
    ':hover': {
      color: '#764ba2',
    },
  },

  // Badges / Tags
  badge: (bg: string) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: 600,
    background: bg,
    color: 'white',
    marginBottom: '12px',
    letterSpacing: '0.3px',
  }),

  // Spacing
  spacing: {
    section: '32px',
    element: '16px',
    grid: '24px',
  },

  // Responsive
  breakpoints: {
    mobile: '600px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const;

export const blogColors = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  purple: '#7928ca',
  pink: '#ff0080',
  teal: '#11998e',
  green: '#38ef7d',
  red: '#ff6b6b',
  orange: '#ee5a24',
  text: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  border: '#eaeaea',
  bg: '#fff',
  bgSecondary: '#f8f9fa',
  codeBg: '#1e1e1e',
} as const;
