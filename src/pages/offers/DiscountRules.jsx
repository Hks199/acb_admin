import { useEffect, useState } from 'react';
import { Alert, Box, Button, FormControlLabel, InputAdornment, Switch, TextField, Typography } from '@mui/material';
import PageHeading from '../../components/PageHeading';
import { getDiscountRules, saveDiscountRule } from '../../api/discountRules';

const blocks = [
  { key: 'first_order_discount', title: 'First-time customer settings', description: 'Available to signed-in customers with no existing orders.' },
  { key: 'milestone_discount', title: 'Order value milestone settings', description: 'An additional discount when the total after product offers reaches the minimum purchase amount.' },
];

export default function DiscountRules() {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState({});
  const [messages, setMessages] = useState({});

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await getDiscountRules();
      const result = Object.fromEntries(response.data.rules.map((rule) => [rule.ruleKey, rule]));
      if (blocks.some((block) => !result[block.key])) throw new Error('Missing discount configuration');
      setRules(result);
      setMessages({});
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load discount rules. Check that the updated backend is deployed.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const change = (key, field, value) => {
    setRules((previous) => ({ ...previous, [key]: { ...previous[key], [field]: value } }));
    setMessages((previous) => ({ ...previous, [key]: null }));
  };
  const save = async (event, key) => {
    event.preventDefault();
    const rule = rules[key];
    const payload = { discountPercentage: Number(rule.discountPercentage), isActive: rule.isActive,
      minPurchaseAmount: rule.minPurchaseAmount === null ? null : Number(rule.minPurchaseAmount) };
    setSaving((previous) => ({ ...previous, [key]: true }));
    setMessages((previous) => ({ ...previous, [key]: null }));
    try {
      const response = await saveDiscountRule(key, payload);
      setRules((previous) => ({ ...previous, [key]: response.data.rule }));
      setMessages((previous) => ({ ...previous, [key]: { severity: 'success', text: 'Rule saved. New cart and checkout calculations use these settings immediately.' } }));
    } catch (error) {
      setMessages((previous) => ({ ...previous, [key]: { severity: 'error', text: error.response?.data?.message || 'Unable to save this rule. Please try again.' } }));
    } finally { setSaving((previous) => ({ ...previous, [key]: false })); }
  };

  return <div>
    <PageHeading title="Discount & Offers Setup" description="Control the first-order reward and the additional discount for high-value orders." />
    {loadError && <Alert severity="error" sx={{ mb: 2 }} action={<Button disabled={loading || Object.values(saving).some(Boolean)} onClick={load}>Retry</Button>}>{loadError}</Alert>}
    {loading && <Typography role="status" sx={{ mb: 2 }}>Loading discount settings…</Typography>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3, maxWidth: 1100 }}>
      {blocks.map(({ key, title, description }) => {
        const rule = rules[key];
        const disabled = loading || !!loadError || !rule || saving[key] === true;
        return <form key={key} onSubmit={(event) => save(event, key)} className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
          <div><Typography variant="h6" component="h2">{title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{description}</Typography></div>
          <FormControlLabel label={rule?.isActive ? 'Discount ON' : 'Discount OFF'} control={<Switch checked={rule?.isActive === true} disabled={disabled} onChange={(event) => change(key, 'isActive', event.target.checked)} inputProps={{ 'aria-label': `Enable ${title.toLowerCase()}` }} />} />
          {key === 'milestone_discount' && <TextField label="Minimum purchase amount" type="number" required disabled={disabled} value={rule?.minPurchaseAmount ?? ''}
            onChange={(event) => change(key, 'minPurchaseAmount', event.target.value)}
            helperText="Orders at or above this amount qualify. The first-order discount does not reduce this threshold total."
            slotProps={{ htmlInput: { min: 0, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />}
          <TextField label="Discount percentage" type="number" required disabled={disabled} value={rule?.discountPercentage ?? ''}
            onChange={(event) => change(key, 'discountPercentage', event.target.value)} helperText="Enter a percentage between 0 and 100."
            slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 }, input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
          {messages[key] && <Alert severity={messages[key].severity}>{messages[key].text}</Alert>}
          <Button variant="contained" type="submit" loading={saving[key] === true} disabled={disabled} sx={{ mt: 'auto' }}>Save rule</Button>
        </form>;
      })}
    </Box>
    <Alert severity="info" sx={{ mt: 3, maxWidth: 1100 }}>Both percentage discounts add together when eligible, capped at the item price. T-shirt bulk pricing follows its own “Apply existing percentage discounts” setting. Existing orders retain their saved payment amounts.</Alert>
  </div>;
}
