import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Chip, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import { FiArrowDown, FiArrowUp, FiMenu, FiPlus, FiUpload } from 'react-icons/fi';
import PageHeading from '../../components/PageHeading';
import CampaignPreview from '../../components/promotions/CampaignPreview';
import { newCampaign, validCampaignUrl, moveCampaign, localDateValue } from '../../lib/popupCampaigns';
import { getPopupCampaigns, createPopupCampaign, updatePopupCampaign, togglePopupCampaign, deletePopupCampaign, reorderPopupCampaigns, uploadPopupImage, getPopupSubscriptions } from '../../api/popupCampaigns';
import './popupAdmin.css';

export default function PopupCampaigns() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(newCampaign);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signups, setSignups] = useState(null);
  const busy = saving || uploading;
  const showError = (err) => setError(err.response?.data?.message || err.message || 'Unable to complete the action.');
  const load = useCallback(async () => {
    const response = await getPopupCampaigns();
    if (!Array.isArray(response.data)) throw new Error('Unexpected campaign response.');
    setRows(response.data); setLoaded(true);
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { await load(); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Unable to load campaigns.'); }
    finally { setLoading(false); }
  }, [load]);
  useEffect(() => { refresh(); }, [refresh]);
  const reset = () => { setEditing(null); setForm(newCampaign()); };
  const change = (field, value) => { setForm((old) => ({ ...old, [field]: value })); setSuccess(''); };
  const imageInvalid = !validCampaignUrl(form.imageUrl.trim());
  const linkInvalid = !validCampaignUrl(form.ctaUrl.trim(), true) || (form.displayType !== 'newsletter_signup' && !form.ctaUrl.trim());
  const countdownInvalid = (form.displayType === 'clearance_countdown' && !form.endsAt) || (form.isActive && form.endsAt && Date.parse(form.endsAt) <= Date.now());
  const save = async (event) => {
    event.preventDefault(); if (busy) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([key]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key)));
      if (editing) await updatePopupCampaign(editing, body); else await createPopupCampaign(body);
      reset(); await load(); setSuccess('Campaign saved.');
    } catch (err) { showError(err); }
    finally { setSaving(false); }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file || busy) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Use a JPG, PNG, WebP or AVIF image up to 8 MB.'); return; }
    setUploading(true); setError(''); setSuccess('');
    try { const response = await uploadPopupImage(file); change('imageUrl', response.data.imageUrl); setSuccess('Image uploaded. Save the campaign to use it.'); }
    catch (err) { showError(err); }
    finally { setUploading(false); }
  };
  const toggle = async (row) => {
    if (busy) return; setSaving(true); setError(''); setSuccess('');
    try {
      const response = await togglePopupCampaign(row._id, !row.isActive);
      if (editing === row._id) setForm((old) => ({ ...old, isActive: response.data.isActive }));
      await load(); setSuccess(response.data.isActive ? 'Campaign activated.' : 'Campaign paused.');
    } catch (err) { showError(err); }
    finally { setSaving(false); }
  };
  const remove = async (row) => {
    if (busy) return; setSaving(true); setError('');
    try { await deletePopupCampaign(row._id); if (editing === row._id) reset(); await load(); setSuccess('Campaign deleted.'); }
    catch (err) { showError(err); }
    finally { setSaving(false); }
  };
  const move = async (from, to) => {
    if (busy || loading || from === to || from < 0 || to < 0 || to >= rows.length) return;
    const reordered = moveCampaign(rows, from, to);
    setSaving(true); setError(''); setSuccess('');
    try {
      const response = await reorderPopupCampaigns(reordered.map((row) => row._id));
      setRows(response.data);
      if (editing) setForm((old) => ({ ...old, priority_order: response.data.find((row) => row._id === editing)?.priority_order || old.priority_order }));
      setSuccess('Queue order saved.');
    } catch (err) { await refresh(); showError(err); }
    finally { setSaving(false); }
  };
  const viewSignups = async (row) => {
    setSaving(true); setError('');
    try { const response = await getPopupSubscriptions(row._id); setSignups({ title: row.title, items: response.data }); }
    catch (err) { showError(err); }
    finally { setSaving(false); }
  };
  return <>
    <PageHeading section="Store management" title="Promotional popups" description="Show the first campaign after 5 seconds, then wait 90 seconds after each dismissal before showing the next." />
    <Stack spacing={2}>
      {error && <Alert severity="error" action={<Button disabled={busy || loading} color="inherit" onClick={refresh}>Refresh</Button>}>{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading && <Typography role="status">Loading campaigns...</Typography>}
      <div className="promo-editor-layout">
        <form onSubmit={save} className="promo-editor-form">
          <div className="promo-editor-title"><h2>{editing ? 'Edit campaign' : 'New campaign'}</h2>{editing && <Button disabled={busy} onClick={reset} startIcon={<FiPlus />}>New</Button>}</div>
          <FormControlLabel label={form.isActive ? 'Active' : 'Paused'} control={<Switch checked={form.isActive} disabled={busy} onChange={(event) => change('isActive', event.target.checked)} />} />
          <TextField label="Title" required value={form.title} disabled={busy} onChange={(event) => change('title', event.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }} helperText={`${form.title.length}/120`} />
          <TextField label="Subtitle" multiline minRows={2} value={form.subtitle} disabled={busy} onChange={(event) => change('subtitle', event.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} helperText={`${form.subtitle.length}/500`} />
          <TextField select label="Campaign type" value={form.displayType} disabled={busy} onChange={(event) => change('displayType', event.target.value)}>
            <MenuItem value="promotion">Promotion</MenuItem><MenuItem value="newsletter_signup">Newsletter signup</MenuItem><MenuItem value="coupon_unlock">Coupon unlock</MenuItem><MenuItem value="clearance_countdown">Clearance countdown</MenuItem>
          </TextField>
          <TextField select label="Background theme" value={form.backgroundTheme} disabled={busy} onChange={(event) => change('backgroundTheme', event.target.value)}><MenuItem value="glass_dark">Dark glass</MenuItem><MenuItem value="glass_light">Light glass</MenuItem></TextField>
          <TextField label="CTA text" required value={form.ctaText} disabled={busy} onChange={(event) => change('ctaText', event.target.value)} slotProps={{ htmlInput: { maxLength: 50 } }} />
          <TextField label="CTA target" required={form.displayType !== 'newsletter_signup'} value={form.ctaUrl} disabled={busy} error={linkInvalid} onChange={(event) => change('ctaUrl', event.target.value)} slotProps={{ htmlInput: { maxLength: 2048 } }} helperText="Use /products or an HTTP/HTTPS URL. Optional redirect after newsletter signup." />
          <TextField label="Coupon code (optional)" value={form.couponCode} disabled={busy} onChange={(event) => change('couponCode', event.target.value)} slotProps={{ htmlInput: { maxLength: 40 } }} />
          <TextField label="Image URL" type="url" value={form.imageUrl} disabled={busy} error={imageInvalid} onChange={(event) => change('imageUrl', event.target.value)} slotProps={{ htmlInput: { maxLength: 2048 } }} helperText="Upload below or paste an HTTP/HTTPS image URL." />
          <Button component="label" variant="outlined" disabled={busy} startIcon={<FiUpload />}>{uploading ? 'Uploading...' : 'Upload image to S3'}<input hidden type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} /></Button>
          <TextField label="Ends at (optional)" type="datetime-local" value={localDateValue(form.endsAt)} disabled={busy} required={form.displayType === 'clearance_countdown'} error={!!countdownInvalid}
            slotProps={{ inputLabel: { shrink: true } }} onChange={(event) => change('endsAt', event.target.value ? new Date(event.target.value).toISOString() : null)} helperText="Local time. Required for countdowns; expired campaigns stop displaying." />
          <Stack direction="row" spacing={1}><Button type="submit" variant="contained" disabled={busy || loading || !loaded || !form.title.trim() || !form.ctaText.trim() || imageInvalid || linkInvalid || !!countdownInvalid}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create campaign'}</Button>{editing && <Button disabled={busy} onClick={reset}>Cancel editing</Button>}</Stack>
        </form>
        <CampaignPreview campaign={form} />
      </div>
      <div className="promo-queue-heading"><div><h2>Campaign queue</h2><p>Drag to reorder, or use the arrows. Paused campaigns stay saved.</p></div><Chip label={`${rows.filter((row) => row.isActive).length} active`} color="success" variant="outlined" /></div>
      {!loading && loaded && !rows.length && <Typography>No campaigns yet. Create your first popup above.</Typography>}
      <div className="promo-queue">
        {rows.map((row, index) => <article key={row._id} className="promo-queue-row" draggable={!busy && !loading}
          onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', row._id); }}
          onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); move(rows.findIndex((item) => item._id === event.dataTransfer.getData('text/plain')), index); }}>
          <FiMenu aria-hidden="true" className="promo-drag-handle" /><span className="promo-queue-position">{index + 1}</span>
          <div className="promo-queue-copy"><strong>{row.title}</strong><span>{row.displayType.replaceAll('_', ' ')} ? {row.isActive ? 'Active' : 'Paused'}</span></div>
          <div className="promo-queue-actions">
            <Button disabled={busy || index === 0} aria-label={`Move ${row.title} up`} onClick={() => move(index, index - 1)}><FiArrowUp /></Button>
            <Button disabled={busy || index === rows.length - 1} aria-label={`Move ${row.title} down`} onClick={() => move(index, index + 1)}><FiArrowDown /></Button>
            <Button disabled={busy} onClick={() => { setEditing(row._id); setForm({ ...newCampaign(), ...row }); setSuccess(''); }}>Edit</Button>
            <Button disabled={busy} onClick={() => toggle(row)}>{row.isActive ? 'Pause' : 'Activate'}</Button>
            {row.displayType === 'newsletter_signup' && <Button disabled={busy} onClick={() => viewSignups(row)}>View signups</Button>}
            <Button color="error" disabled={busy} onClick={() => remove(row)}>Delete</Button>
          </div>
        </article>)}
      </div>
      {signups && <div className="promo-signups"><div className="promo-editor-title"><h2>Recent signups ? {signups.title}</h2><Button onClick={() => setSignups(null)}>Close</Button></div>
        {!signups.items.length ? <p>No signups yet.</p> : <table><thead><tr><th>Email address</th><th>Joined</th></tr></thead><tbody>{signups.items.map((item) => <tr key={item._id}><td>{item.email}</td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table>}
      </div>}
    </Stack>
  </>;
}
