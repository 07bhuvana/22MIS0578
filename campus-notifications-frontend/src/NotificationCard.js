import React from 'react';
import {
  Card, CardContent, Chip, Typography, Box, Tooltip,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';

const TYPE_CONFIG = {
  Placement: {
    color: '#00E676',
    bg: 'rgba(0,230,118,0.08)',
    border: 'rgba(0,230,118,0.25)',
    icon: <WorkIcon sx={{ fontSize: 16 }} />,
    label: 'Placement',
  },
  Result: {
    color: '#00E5FF',
    bg: 'rgba(0,229,255,0.08)',
    border: 'rgba(0,229,255,0.25)',
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />,
    label: 'Result',
  },
  Event: {
    color: '#FFB300',
    bg: 'rgba(255,179,0,0.08)',
    border: 'rgba(255,179,0,0.25)',
    icon: <EventIcon sx={{ fontSize: 16 }} />,
    label: 'Event',
  },
};

const PRIORITY_LABELS = ['', 'Low', 'Medium', 'High', 'Critical', 'Top'];

export default function NotificationCard({ notification, rank }) {
  const cfg = TYPE_CONFIG[notification.Type] || {
    color: '#7B97B8',
    bg: 'rgba(123,151,184,0.08)',
    border: 'rgba(123,151,184,0.2)',
    icon: <NotificationsIcon sx={{ fontSize: 16 }} />,
    label: notification.Type || 'Unknown',
  };

  const formattedTime = notification.Timestamp
    ? new Date(notification.Timestamp.replace(' ', 'T')).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <Card
      sx={{
        mb: 1.5,
        border: `1px solid ${cfg.border}`,
        background: `linear-gradient(135deg, ${cfg.bg} 0%, #0D1526 100%)`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${cfg.color}22`,
        },
        animation: `fadeSlideIn 0.4s ease ${rank * 0.06}s both`,
        '@keyframes fadeSlideIn': {
          from: { opacity: 0, transform: 'translateX(-16px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          {/* Rank badge */}
          <Box
            sx={{
              minWidth: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.color}33, ${cfg.color}11)`,
              border: `1.5px solid ${cfg.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.7rem', fontWeight: 700, color: cfg.color,
              flexShrink: 0,
            }}
          >
            #{rank}
          </Box>

          {/* Content */}
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
              <Chip
                icon={cfg.icon}
                label={cfg.label}
                size="small"
                sx={{
                  color: cfg.color,
                  bgcolor: `${cfg.color}18`,
                  border: `1px solid ${cfg.color}44`,
                  '& .MuiChip-icon': { color: cfg.color },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontFamily: '"Space Mono", monospace' }}
              >
                {formattedTime}
              </Typography>
            </Box>

            <Tooltip title={notification.Message || ''} placement="top-start">
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {notification.Message}
              </Typography>
            </Tooltip>

            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary', fontFamily: '"Space Mono", monospace',
                fontSize: '0.65rem', mt: 0.5, display: 'block',
                opacity: 0.6,
              }}
            >
              ID: {notification.ID?.slice(0, 18)}…
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
