import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#00E5FF' },
    secondary: { main: '#FF4081' },
    background: {
      default: '#070B14',
      paper:   '#0D1526',
    },
    text: {
      primary:   '#E8F4FD',
      secondary: '#7B97B8',
    },
    success: { main: '#00E676' },
    warning: { main: '#FFB300' },
    error:   { main: '#FF5252' },
  },
  typography: {
    fontFamily: '"Space Mono", "DM Sans", monospace',
    h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0D1526 0%, #111D35 100%)',
          border: '1px solid rgba(0,229,255,0.08)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: '0.7rem' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 700,
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
