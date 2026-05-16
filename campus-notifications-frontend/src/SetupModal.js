import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert, Divider,
  Tabs, Tab, CircularProgress, IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { registerUser, authenticateUser } from './api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box pt={2}>{children}</Box> : null;
}

export default function SetupModal({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [regForm, setRegForm] = useState({
    email: '', name: '', mobileNo: '', githubUsername: '', rollNo: '', accessCode: '',
  });
  const [authForm, setAuthForm] = useState({
    email: '', name: '', rollNo: '', accessCode: '', clientID: '', clientSecret: '',
  });

  const handleReg = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await registerUser(regForm);
      setResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } catch (e) {
      setError(e.response?.data || e.message);
    } finally { setLoading(false); }
  };

  const handleAuth = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await authenticateUser(authForm);
      setResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } catch (e) {
      setError(e.response?.data || e.message);
    } finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(result || ''); };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: '#0D1526', border: '1px solid rgba(0,229,255,0.15)' } }}
    >
      <DialogTitle sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, color: '#00E5FF' }}>
        🔧 Server Setup
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Register once to get your <b>clientID</b> & <b>clientSecret</b>, then authenticate to get your Bearer token.
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
          <Tab label="1. Register" sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600 }} />
          <Tab label="2. Authenticate" sx={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600 }} />
        </Tabs>

        <TabPanel value={tab} index={0}>
          {['email','name','mobileNo','githubUsername','rollNo','accessCode'].map(field => (
            <TextField
              key={field} fullWidth size="small" sx={{ mb: 1.5 }}
              label={field} value={regForm[field]}
              onChange={e => setRegForm(p => ({ ...p, [field]: e.target.value }))}
              InputProps={{ sx: { fontFamily: '"Space Mono",monospace', fontSize: '0.82rem' } }}
            />
          ))}
          <Button fullWidth variant="contained" color="primary" onClick={handleReg} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Register'}
          </Button>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {['email','name','rollNo','accessCode','clientID','clientSecret'].map(field => (
            <TextField
              key={field} fullWidth size="small" sx={{ mb: 1.5 }}
              label={field}
              type={field === 'clientSecret' ? 'password' : 'text'}
              value={authForm[field]}
              onChange={e => setAuthForm(p => ({ ...p, [field]: e.target.value }))}
              InputProps={{ sx: { fontFamily: '"Space Mono",monospace', fontSize: '0.82rem' } }}
            />
          ))}
          <Button fullWidth variant="contained" color="secondary" onClick={handleAuth} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Get Token'}
          </Button>
        </TabPanel>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{String(error)}</Alert>}

        {result && (
          <Box mt={2}>
            <Divider sx={{ mb: 1.5 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                ✅ Response — copy & save this!
              </Typography>
              <IconButton size="small" onClick={copy}><ContentCopyIcon fontSize="small" /></IconButton>
            </Box>
            <Box
              component="pre"
              sx={{
                background: '#070B14', border: '1px solid rgba(0,230,118,0.2)',
                borderRadius: 1, p: 1.5, fontSize: '0.72rem', overflow: 'auto',
                maxHeight: 200, color: '#00E676', fontFamily: '"Space Mono",monospace',
              }}
            >
              {result}
            </Box>
            <Alert severity="info" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
              Copy your <b>clientID</b>, <b>clientSecret</b>, and Bearer token into{' '}
              <b>application.properties</b> on the backend.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
