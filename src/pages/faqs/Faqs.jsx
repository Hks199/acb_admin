import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import PageHeading from '../../components/PageHeading';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../../api/faqs';

const blank = () => ({ question: '', answer: '', isActive: false, sortOrder: 0 });
const message = (err) => err.response?.data?.message || err.message || 'Unable to save FAQ changes.';

export default function Faqs() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const load = useCallback(async () => {
    const response = await getFaqs();
    if (!Array.isArray(response.data)) throw new Error('Unexpected FAQ response.');
    setRows(response.data); setLoaded(true);
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { await load(); }
    catch (err) { setError(message(err)); }
    finally { setLoading(false); }
  }, [load]);
  useEffect(() => { refresh(); }, [refresh]);
  const reset = () => { setEditing(null); setForm(blank()); };
  const change = (field, value) => setForm(previous => ({ ...previous, [field]: value }));
  const disabled = busy || loading || !loaded;
  const invalidOrder = form.sortOrder === '' || !Number.isInteger(Number(form.sortOrder)) || Number(form.sortOrder) < 0 || Number(form.sortOrder) > 1000000;
  const save = async (event) => {
    event.preventDefault();
    if (disabled || invalidOrder || !form.question.trim() || !form.answer.trim()) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const payload = { ...form, question: form.question.trim(), answer: form.answer.trim(), sortOrder: Number(form.sortOrder) };
      if (editing) await updateFaq(editing, payload);
      else await createFaq(payload);
      reset(); setSuccess('FAQ saved.');
      await load();
    } catch (err) { setError(message(err)); }
    finally { setBusy(false); }
  };
  const toggle = async (row) => {
    if (disabled) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const response = await updateFaq(row._id, { isActive: !row.isActive });
      if (editing === row._id) change('isActive', response.data.isActive);
      setSuccess(response.data.isActive ? 'FAQ published.' : 'FAQ hidden.');
      await load();
    } catch (err) { setError(message(err)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (disabled || !deleting) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      await deleteFaq(deleting._id);
      if (editing === deleting._id) reset();
      setDeleting(null); setSuccess('FAQ deleted.');
      await load();
    } catch (err) { setError(message(err)); setDeleting(null); }
    finally { setBusy(false); }
  };

  return <>
    <PageHeading section="Store management" title="FAQs" description="Manage questions and answers on the homepage and FAQ page. Publish, hide, or change their display order." />
    <Stack spacing={3}>
      {error && <Alert severity="error" action={<Button color="inherit" disabled={busy || loading} onClick={refresh}>Retry</Button>}>{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading && <Typography role="status">Loading FAQs...</Typography>}
      <Box component="form" onSubmit={save} sx={{ p: { xs: 2, md: 3 }, bgcolor: 'white', borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{editing ? 'Edit FAQ' : 'New FAQ'}</Typography>
          <TextField label="Question" required multiline value={form.question} disabled={disabled} onChange={event => change('question', event.target.value)}
            helperText={`${form.question.length}/300 characters`} slotProps={{ htmlInput: { maxLength: 300 } }} />
          <TextField label="Answer" required multiline minRows={4} value={form.answer} disabled={disabled} onChange={event => change('answer', event.target.value)}
            helperText={`${form.answer.length}/10000 characters. Plain text; line breaks are preserved.`} slotProps={{ htmlInput: { maxLength: 10000 } }} />
          <TextField label="Display order" type="number" value={form.sortOrder} disabled={disabled} error={invalidOrder} onChange={event => change('sortOrder', event.target.value)}
            helperText="Lower numbers appear first. Ties use creation order." slotProps={{ htmlInput: { min: 0, max: 1000000, step: 1 } }} />
          <FormControlLabel label={form.isActive ? 'Published on storefront' : 'Draft / hidden'} control={<Switch checked={form.isActive} disabled={disabled} onChange={event => change('isActive', event.target.checked)} />} />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={disabled || invalidOrder || !form.question.trim() || !form.answer.trim()}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Create FAQ'}</Button>
            {editing && <Button disabled={busy} onClick={reset}>Cancel editing</Button>}
          </Stack>
        </Stack>
      </Box>
      <Typography variant="h6">Saved FAQs ({rows.length})</Typography>
      {!loading && loaded && !rows.length && <Typography>No FAQs yet. Create your first question above.</Typography>}
      {rows.map(row => <Box key={row._id} sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1}><Chip size="small" label={row.isActive ? 'Published' : 'Hidden'} color={row.isActive ? 'success' : 'default'} /><Chip size="small" label={`Order: ${row.sortOrder}`} /></Stack>
          <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{row.question}</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: 'text.secondary' }}>{row.answer}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button disabled={disabled} onClick={() => { setEditing(row._id); setForm({ question: row.question, answer: row.answer, isActive: row.isActive, sortOrder: row.sortOrder }); setSuccess(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</Button>
            <Button disabled={disabled} onClick={() => toggle(row)}>{row.isActive ? 'Hide' : 'Publish'}</Button>
            <Button color="error" disabled={disabled} onClick={() => setDeleting(row)}>Delete</Button>
          </Stack>
        </Stack>
      </Box>)}
    </Stack>
    <Dialog open={Boolean(deleting)} onClose={() => { if (!busy) setDeleting(null); }} aria-labelledby="delete-faq-title">
      <DialogTitle id="delete-faq-title">Delete FAQ?</DialogTitle>
      <DialogContent><DialogContentText sx={{ overflowWrap: 'anywhere' }}>This will permanently remove “{deleting?.question}” from the admin panel and storefront.</DialogContentText></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button><Button color="error" disabled={disabled} onClick={remove}>Delete FAQ</Button></DialogActions>
    </Dialog>
  </>;
}
