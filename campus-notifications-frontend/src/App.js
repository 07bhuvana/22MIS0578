import React, { useState, useCallback, useEffect } from 'react';
import {
  ThemeProvider, CssBaseline, Box, Typography, AppBar, Toolbar,
  IconButton, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert, Tooltip, Chip, Divider, Fade,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import theme from './theme';
import { fetchPriorityInbox, fetchHealth } from './api';
import NotificationCard from './NotificationCard';
import StatsBar from './StatsBar';
import SetupModal from './SetupModal';

const TOP_N_OPTIONS = [5, 10, 15, 20];
const TYPE_FILTERS  = ['All', 'Placement', 'Result', 'Event'];

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [totalFetched,  setTotalFetched]  = useState(0);
  const [topN,          setTopN]          = useState(10);
  const [typeFilter,    setTypeFilter]    = useState('All');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [lastUpdated,   setLastUpdated]   = useState(null);
  const [serverStatus,  setServerStatus]  = useState('unknown'); // 'up' | 'down' | 'unknown'
  const [setupOpen,     setSetupOpen]     = useState(false);
  const [autoRefresh,   setAutoRefresh]   = useState(false);

  // ── Health ping ────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      await fetchHealth();
      setServerStatus('up');
    } catch {
      setServerStatus('down');
    }
  }, []);

  // ── Fetch notifications ───────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPriorityInbox(topN);
      setNotifications(res.data.priorityNotifications || []);
      setTotalFetched(res.data.totalFetched || 0);
      setLastUpdated(new Date());
      setServerStatus('up');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Failed to reach backend.';
      setError(msg);
      setServerStatus('down');
    } finally {
      setLoading(false);
    }
  }, [topN]);

  // Initial load + health check
  useEffect(() => { checkHealth(); load(); }, []);  // eslint-disable-line

  // Re-fetch when topN changes
  useEffect(() => { if (notifications.length > 0 || error) load(); }, [topN]); // eslint-disable-line

  // Auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const filtered = typeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.Type === typeFilter);

  const statusColor = serverStatus === 'up' ? '#00E676' : serverStatus === 'down' ? '#FF5252' : '#FFB300';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        body { background: #070B14; }

        /* Animated grid background */
        body::before {
          content: '';
          position: fixed; inset: 0; z-index: -1;
          background-image:
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
      `}</style>

      {/* ── App Bar ── */}
      <AppBar position="sticky" elevation={0}
        sx={{ background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(0,229,255,0.1)' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <NotificationsActiveIcon sx={{ color: '#00E5FF', mr: 0.5 }} />
          <Typography variant="h6" fontFamily='"DM Sans",sans-serif' fontWeight={800}
            sx={{ background: 'linear-gradient(90deg,#00E5FF,#FF4081)', WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', mr: 2 }}
          >
            Campus Inbox
          </Typography>

          {/* Server status */}
          <Tooltip title={`Backend: ${serverStatus}`}>
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: `${statusColor} !important` }} />}
              label={serverStatus === 'up' ? 'Online' : serverStatus === 'down' ? 'Offline' : 'Checking…'}
              size="small"
              sx={{ color: statusColor, border: `1px solid ${statusColor}44`, bgcolor: `${statusColor}11`,
                    fontFamily: '"Space Mono",monospace', fontSize: '0.65rem' }}
            />
          </Tooltip>

          <Box flex={1} />

          {/* Auto-refresh toggle */}
          <Tooltip title={autoRefresh ? 'Auto-refresh ON (30s)' : 'Auto-refresh OFF'}>
            <Button
              size="small" variant={autoRefresh ? 'contained' : 'outlined'} color="primary"
              onClick={() => setAutoRefresh(p => !p)}
              sx={{ fontSize: '0.7rem', py: 0.5, px: 1.2 }}
            >
              {autoRefresh ? '⏸ Auto' : '▶ Auto'}
            </Button>
          </Tooltip>

          <Tooltip title="Refresh now">
            <IconButton onClick={load} disabled={loading} color="primary">
              <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Server Setup (Register / Auth)">
            <IconButton onClick={() => setSetupOpen(true)} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Main Content ── */}
      <Box maxWidth={800} mx="auto" px={{ xs: 2, sm: 3 }} py={3}>

        {/* Header */}
        <Box mb={3}>
          <Typography variant="h4" fontFamily='"DM Sans",sans-serif' fontWeight={800} gutterBottom
            sx={{ background: 'linear-gradient(135deg,#E8F4FD 0%,#7B97B8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Priority Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top {topN} most important notifications · ranked by type & recency
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Space Mono",monospace' }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </Typography>
          )}
        </Box>

        {/* Controls */}
        <Box display="flex" gap={2} mb={2.5} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel sx={{ fontFamily: '"DM Sans",sans-serif' }}>Top N</InputLabel>
            <Select value={topN} label="Top N" onChange={e => setTopN(e.target.value)}
              sx={{ fontFamily: '"Space Mono",monospace' }}>
              {TOP_N_OPTIONS.map(n => (
                <MenuItem key={n} value={n} sx={{ fontFamily: '"Space Mono",monospace' }}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontFamily: '"DM Sans",sans-serif' }}>
              <FilterListIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Type
            </InputLabel>
            <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)}
              sx={{ fontFamily: '"DM Sans",sans-serif' }}>
              {TYPE_FILTERS.map(t => (
                <MenuItem key={t} value={t} sx={{ fontFamily: '"DM Sans",sans-serif' }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary',
            fontFamily: '"Space Mono",monospace' }}>
            {filtered.length} shown
          </Typography>
        </Box>

        {/* Stats */}
        <StatsBar notifications={notifications} totalFetched={totalFetched} />

        <Divider sx={{ mb: 2.5, borderColor: 'rgba(0,229,255,0.08)' }} />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={
            <Button color="inherit" size="small" onClick={load}>Retry</Button>
          }>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={40} sx={{ color: '#00E5FF' }} />
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography fontSize="3rem">📭</Typography>
            <Typography color="text.secondary" mt={1}>No notifications found.</Typography>
            <Button variant="outlined" color="primary" onClick={load} sx={{ mt: 2 }}>
              Fetch Now
            </Button>
          </Box>
        )}

        {/* Notification list */}
        <Fade in={!loading && filtered.length > 0}>
          <Box>
            {filtered.map((n, i) => (
              <NotificationCard key={n.ID || i} notification={n} rank={i + 1} />
            ))}
          </Box>
        </Fade>
      </Box>

      {/* Setup modal */}
      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />
    </ThemeProvider>
  );
}
