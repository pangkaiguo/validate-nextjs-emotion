'use client';

import { useMemo } from 'react';
import { ThemeProvider, createTheme, Box, Stack, Typography, Paper, Button, Alert, Chip, Grid } from '@mui/material';

/**
 * MUI sx Prop Demo — Uses REAL MUI components with sx prop
 *
 * This component validates that @mui/material components with the `sx` prop
 * work correctly with Next.js SSR and SSG.
 *
 * MUI processes `sx` internally by calling Emotion's `css()` at runtime.
 * EmotionRegistry + useServerInsertedHTML captures these styles on the server.
 *
 * All components below use the REAL MUI sx prop, NOT Emotion css() directly.
 * This ensures we're testing actual MUI behavior, not a simulation.
 */

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    info: { main: '#0288d1' },
  },
});

const sectionBoxSx = {
  border: '2px solid #e0e0e0',
  borderRadius: 2,
  p: 3,
  mb: 3,
  bgcolor: '#fafafa',
};

export function MuiSxDemo() {
  // Using useMemo to keep sx objects stable between renders
  const successAlertSx = useMemo(() => ({ bgcolor: '#e8f5e9', color: '#1b5e20' } as const), []);
  const warningAlertSx = useMemo(() => ({ bgcolor: '#fff3e0', color: '#e65100' } as const), []);
  const errorAlertSx = useMemo(() => ({ bgcolor: '#ffebee', color: '#c62828' } as const), []);
  const infoAlertSx = useMemo(() => ({ bgcolor: '#e3f2fd', color: '#01579b' } as const), []);

  const chipSx = useMemo(() => ({ fontWeight: 700, mb: 1 } as const), []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* ── Example 1: Basic sx prop on MUI Box ── */}
        <Box sx={sectionBoxSx}>
          <Chip label="1. Basic sx on MUI Box" color="primary" size="small" sx={chipSx} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Box with sx
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Uses {'<Box sx={{ bgcolor: "primary.main", p: 2, borderRadius: 2 }}>'}
          </Typography>

          {/* Real MUI Box with sx prop */}
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, borderRadius: 2, mb: 1 }}>
            Box with bgcolor "primary.main" — SSR/SSG rendered
          </Box>
          <Box sx={{ bgcolor: 'success.main', color: 'white', p: 2, borderRadius: 2, mb: 1 }}>
            Box with bgcolor "success.main" — SSR/SSG rendered
          </Box>
          <Box sx={{ bgcolor: 'warning.main', color: 'white', p: 2, borderRadius: 2 }}>
            Box with bgcolor "warning.main" — SSR/SSG rendered
          </Box>
        </Box>

        {/* ── Example 2: MUI Paper + Typography + Button ── */}
        <Box sx={sectionBoxSx}>
          <Chip label="2. Paper + Typography + Button with sx" color="secondary" size="small" sx={chipSx} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            MUI Card Pattern (Paper + sx)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Uses {'<Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>'}
          </Typography>

          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, mb: 2, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Paper Card with sx
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              This entire card uses MUI sx prop. {'sx={{ p: 3, background: "linear-gradient(...)", color: "white" }}'}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', ':hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                Action 1
              </Button>
              <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', ':hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                Action 2
              </Button>
            </Stack>
          </Paper>

          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
            {'\u2713'} sx prop renders correctly with SSR/SSG
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            Check View Page Source for <code>data-emotion</code> style tags
          </Typography>
        </Box>

        {/* ── Example 3: MUI Alert + Typography variants ── */}
        <Box sx={sectionBoxSx}>
          <Chip label="3. MUI Alert with sx" color="success" size="small" sx={chipSx} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Alert with sx severity
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Uses {'<Alert sx={{ bgcolor: "success.light", color: "success.dark" }}>'}
          </Typography>

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Alert severity="success" sx={successAlertSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Success Alert</Typography>
              This alert uses {'sx={{ bgcolor: "#e8f5e9", color: "#1b5e20" }}'}
            </Alert>
            <Alert severity="warning" sx={warningAlertSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Warning Alert</Typography>
              Styles are SSR/SSG rendered — check View Page Source
            </Alert>
            <Alert severity="error" sx={errorAlertSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Error Alert</Typography>
              Even nested selectors work at build time
            </Alert>
            <Alert severity="info" sx={infoAlertSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Info Alert</Typography>
              Disable JavaScript — styles still visible (no FOUC)
            </Alert>
          </Stack>
        </Box>

        {/* ── Example 4: MUI Typography variants with sx ── */}
        <Box sx={sectionBoxSx}>
          <Chip label="4. Typography with sx variants" color="info" size="small" sx={chipSx} />
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#999', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            Typography with sx
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px', mb: 0.5 }}>
            Heading 1 — Display
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#16213e', mb: 0.5 }}>
            Heading 2 — Section Title
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0f3460', mb: 1 }}>
            Heading 3 — Card Title
          </Typography>
          <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.7, mb: 1 }}>
            Body text with <Box component="a" href="#" sx={{ color: '#667eea', textDecoration: 'none', fontWeight: 500, ':hover': { textDecoration: 'underline' } }}>link styled via sx</Box>.
            Demonstrates nested selectors and pseudo-classes (<code>:hover</code>) working in SSG mode.
          </Typography>
          <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            Caption text — all rendered at build time
          </Typography>
        </Box>

        {/* ── Example 5: MUI Grid with sx ── */}
        <Box sx={sectionBoxSx}>
          <Chip label="5. Grid with sx" color="warning" size="small" sx={chipSx} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Grid Layout with sx
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Uses {'<Grid sx={{ ... }}>'} with individual item sx styles
          </Typography>

          <Grid container spacing={1.5}>
            {[
              { bg: 'linear-gradient(135deg, #ff9a9e, #fad0c4)', color: '#5a1a1a', text: 'Grid Item 1' },
              { bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', color: '#3a1a5a', text: 'Grid Item 2' },
              { bg: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', color: '#2a3a5a', text: 'Grid Item 3' },
              { bg: 'linear-gradient(135deg, #fddb92, #d1fdff)', color: '#5a4a1a', text: 'Grid Item 4' },
            ].map((item, i) => (
              <Grid key={i} size={{ xs: 6 }}>
                <Box sx={{ background: item.bg, borderRadius: 2, p: 2.5, color: item.color, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                  {item.text}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Summary ── */}
        <Box sx={{ bgcolor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: 2, p: 2, fontSize: '0.85rem', color: '#333', lineHeight: 1.6 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1976d2', mb: 0.5 }}>
            {'\u2705'} All sx props above are SSR/SSG-rendered using REAL MUI components
          </Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>
            MUI processes <code>sx</code> internally via Emotion's <code>css()</code> runtime — no compiler dependency.
            Open View Page Source and search for <code>data-emotion</code> to confirm.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
