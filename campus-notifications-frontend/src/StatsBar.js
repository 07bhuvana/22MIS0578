import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventIcon from '@mui/icons-material/Event';

export default function StatsBar({ notifications = [], totalFetched = 0 }) {
  const counts = notifications.reduce((acc, n) => {
    acc[n.Type] = (acc[n.Type] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Placement', count: counts['Placement'] || 0, color: '#00E676', icon: <WorkIcon sx={{ fontSize: 18 }} /> },
    { label: 'Result',    count: counts['Result']    || 0, color: '#00E5FF', icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} /> },
    { label: 'Event',     count: counts['Event']     || 0, color: '#FFB300', icon: <EventIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }}
      gap={1.5}
      mb={3}
    >
      {/* Total fetched */}
      <Paper
        sx={{
          p: 1.5, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,64,129,0.12), rgba(13,21,38,1))',
          border: '1px solid rgba(255,64,129,0.2)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight={800} color="#FF4081" fontFamily='"Space Mono",monospace'>
          {totalFetched}
        </Typography>
        <Typography variant="caption" color="text.secondary">Total Fetched</Typography>
      </Paper>

      {stats.map((s) => (
        <Paper
          key={s.label}
          sx={{
            p: 1.5, textAlign: 'center',
            background: `linear-gradient(135deg, ${s.color}14, #0D1526)`,
            border: `1px solid ${s.color}30`,
            borderRadius: 2,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={0.25}>
            <Box sx={{ color: s.color }}>{s.icon}</Box>
            <Typography variant="h5" fontWeight={800} color={s.color} fontFamily='"Space Mono",monospace'>
              {s.count}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">{s.label}</Typography>
        </Paper>
      ))}
    </Box>
  );
}
