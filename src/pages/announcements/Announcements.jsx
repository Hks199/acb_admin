import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import PageHeading from '../../components/PageHeading';
import { getAnnouncements, createAnnouncement, updateAnnouncement, toggleAnnouncement } from '../../api/announcements';

const styles = {
  offer: { label: 'Offer', color: '#059669' },
  alert: { label: 'Alert', color: '#e11d48' },
  new_launch: { label: 'New launch', color: '#2563eb' },
  info: { label: 'Info', color: '#262626' },
};
const blank = () => ({ text: '', badge: { type: 'info', text: '' }, targetUrl: '', isActive: false });
const validUrl = (value) => {
  if (!value) return true;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password; }
  catch { return false; }
};
export default function Announcements() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    const response = await getAnnouncements();
    if (!Array.isArray(response.data)) throw new Error('Unexpected announcement response.');
    setRows(response.data);
    setLoaded(true);
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { await load(); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Unable to load announcements.'); }
    finally { setLoading(false); }
  }, [load]);
  useEffect(() => { refresh(); }, [refresh]);
  const change = (field, value) => { setForm((previous) => ({ ...previous, [field]: value })); setSuccess(''); };
  const reset = () => { setEditing(null); setForm(blank()); };
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const payload = { ...form, text: form.text.trim(), targetUrl: form.targetUrl.trim(), badge: { ...form.badge, text: form.badge.text.trim() } };
      if (editing) await updateAnnouncement(editing, payload);
      else await createAnnouncement(payload);
      reset();
      setSuccess('Announcement saved.');
      await load();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Unable to save announcement.'); }
    finally { setBusy(false); }
  };
  const toggle = async (row) => {
    if (busy) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const response = await toggleAnnouncement(row._id, !row.isActive);
      if (editing === row._id) setForm((old) => ({ ...old, isActive: response.data.isActive }));
      else if (response.data.isActive && editing) setForm((old) => ({ ...old, isActive: false }));
      setSuccess(response.data.isActive ? 'Announcement activated. All other announcements are inactive.' : 'Announcement hidden.');
      await load();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Unable to change status.'); }
    finally { setBusy(false); }
  };
  const invalidLink = !validUrl(form.targetUrl.trim()) || form.targetUrl.length > 2048;
  return <>
    <PageHeading section="Store management" title="Announcements" description="Manage the message above your storefront navigation. Only one announcement can be active." />
    <Stack spacing={3}>
      {error && <Alert severity="error" action={<Button color="inherit" disabled={busy || loading} onClick={refresh}>Retry</Button>}>{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading && <Typography role="status">Loading announcements...</Typography>}
      <Box component="form" onSubmit={save} sx={{ p: { xs: 2, md: 3 }, bgcolor: 'white', borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{editing ? 'Edit announcement' : 'New announcement'}</Typography>
          <FormControlLabel label={form.isActive ? 'Active' : 'Inactive'} control={<Switch disabled={busy || loading || !loaded} checked={form.isActive} onChange={(event) => change('isActive', event.target.checked)} />} />
          <TextField label="Announcement text" required multiline minRows={2} value={form.text} disabled={busy}
            onChange={(event) => change('text', event.target.value)} helperText={`${form.text.length}/255 characters`} slotProps={{ htmlInput: { maxLength: 255 } }} />
          <TextField label="Badge label (optional)" value={form.badge.text} disabled={busy}
            onChange={(event) => change('badge', { ...form.badge, text: event.target.value })} helperText={`${form.badge.text.length}/15 characters`} slotProps={{ htmlInput: { maxLength: 15 } }} />
          <TextField select label="Badge style" value={form.badge.type} disabled={busy} onChange={(event) => change('badge', { ...form.badge, type: event.target.value })}>
            {Object.entries(styles).map(([type, style]) => <MenuItem key={type} value={type}>{style.label}</MenuItem>)}
          </TextField>
          <TextField label="Action link (optional)" type="url" value={form.targetUrl} disabled={busy} error={invalidLink}
            onChange={(event) => change('targetUrl', event.target.value)} slotProps={{ htmlInput: { maxLength: 2048 } }}
            helperText={invalidLink ? 'Enter a valid HTTP or HTTPS URL.' : 'Example: https://www.artandcraftfrombharat.com/products'} />
          <Typography variant="subtitle2">Preview</Typography>
          <Box sx={{ bgcolor: styles[form.badge.type]?.color || styles.info.color, color: 'white', p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 1 }}>
            {form.badge.text && <Box component="span" sx={{ bgcolor: 'rgba(255,255,255,.2)', fontWeight: 700, px: 1, py: .3, borderRadius: .7 }}>{form.badge.text}</Box>}
            <Box component="span" sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>{form.text || 'Your announcement will appear here'}</Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={busy || loading || !loaded || !form.text.trim() || invalidLink}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Create announcement'}</Button>
            {editing && <Button disabled={busy} onClick={reset}>Cancel editing</Button>}
          </Stack>
        </Stack>
      </Box>
      <Typography variant="h6">Saved announcements</Typography>
      {!loading && loaded && rows.length === 0 && <Typography>No announcements yet. Create your first message above.</Typography>}
      {rows.map((row) => <Box key={row._id} sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} size="small" />
            {row.badge?.text && <Chip label={row.badge.text} size="small" sx={{ bgcolor: styles[row.badge.type]?.color, color: 'white' }} />}
          </Stack>
          <Typography sx={{ overflowWrap: 'anywhere' }}>{row.text}</Typography>
          {row.targetUrl && <Typography variant="body2" sx={{ overflowWrap: 'anywhere', color: 'text.secondary' }}>{row.targetUrl}</Typography>}
          <Stack direction="row" spacing={1}>
            <Button disabled={busy || loading} onClick={() => { setEditing(row._id); setForm({ text: row.text, badge: { ...row.badge }, targetUrl: row.targetUrl || '', isActive: row.isActive }); setSuccess(''); }}>Edit</Button>
            <Button disabled={busy || loading} onClick={() => toggle(row)}>{row.isActive ? 'Deactivate' : 'Activate'}</Button>
          </Stack>
        </Stack>
      </Box>)}
    </Stack>
  </>;
}
