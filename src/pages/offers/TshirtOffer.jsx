import { useEffect, useState } from 'react';
import { Alert, Autocomplete, Button, Checkbox, FormControlLabel, Switch, TextField } from '@mui/material';
import PageHeading from '../../components/PageHeading';
import { getTshirtOffer, saveTshirtOffer } from '../../api/offers';
import { getAllVarient } from '../../api/varients';

const defaults = { enabled: false, minimumQuantity: 3, unitPrice: 333, eligibleProductIds: [], combineProducts: true, stackDiscounts: false };

export default function TshirtOffer() {
  const [offer, setOffer] = useState(defaults);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoaded(false);
    setError('');
    try {
      const response = await getTshirtOffer();
      setOffer({ ...defaults, ...response.data.offer });
      const options = new Map();
      let page = 1;
      let totalPages = 1;
      do {
        const variants = await getAllVarient({ page, limit: 100 });
        for (const variant of variants.data.data || []) {
          const id = typeof variant.productId === 'object' ? variant.productId._id : variant.productId;
          if (id) options.set(id, { id, name: variant.productId?.product_name || variant.varient_name || id });
        }
        totalPages = variants.data.totalPages || 1;
        page++;
      } while (page <= totalPages);
      setProducts([...options.values()]);
      setLoaded(true);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load the offer. Check that the updated backend is deployed.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const change = (field, value) => {
    setOffer((previous) => ({ ...previous, [field]: value }));
    setSaved(false);
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const response = await saveTshirtOffer({ ...offer, minimumQuantity: Number(offer.minimumQuantity), unitPrice: Number(offer.unitPrice) });
      setOffer({ ...defaults, ...response.data.offer });
      setSaved(true);
    } catch (err) { setError(err.response?.data?.message || 'Unable to save the T-shirt offer.'); }
    finally { setSaving(false); }
  };
  const selected = offer.eligibleProductIds.map((id) => products.find((product) => product.id === id) || { id, name: `Product ${id}` });

  return <div>
    <PageHeading title="T-shirt offer" description="Set the bulk price for the T-shirt products you select." />
    {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={load}>Reload</Button>}>{error}</Alert>}
    {saved && <Alert severity="success" sx={{ mb: 2 }}>T-shirt offer saved.</Alert>}
    <form onSubmit={save} className="form-card" style={{ display: 'grid', gap: 22, maxWidth: 760 }}>
      <FormControlLabel control={<Switch checked={offer.enabled} onChange={(event) => change('enabled', event.target.checked)} disabled={loading || saving} />} label="Enable T-shirt offer" />
      <Autocomplete multiple options={products} value={selected} getOptionLabel={(product) => product.name}
        isOptionEqualToValue={(left, right) => left.id === right.id} disabled={loading || saving}
        onChange={(_, value) => change('eligibleProductIds', value.map((product) => product.id))}
        renderInput={(params) => <TextField {...params} label="Eligible T-shirt products" helperText="Choose only your T-shirt designs. Every size and color of each selected design is eligible." />} />
      <TextField label="Minimum T-shirt quantity" type="number" required value={offer.minimumQuantity}
        slotProps={{ htmlInput: { min: 1, step: 1 } }} disabled={loading || saving}
        onChange={(event) => change('minimumQuantity', event.target.value)} />
      <TextField label="Offer price per T-shirt (₹)" type="number" required value={offer.unitPrice}
        slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} disabled={loading || saving}
        onChange={(event) => change('unitPrice', event.target.value)} />
      <FormControlLabel control={<Checkbox checked={offer.combineProducts} disabled={loading || saving} onChange={(event) => change('combineProducts', event.target.checked)} />}
        label="Combine eligible designs, sizes, and colors toward the minimum quantity" />
      <FormControlLabel control={<Checkbox checked={offer.stackDiscounts} disabled={loading || saving} onChange={(event) => change('stackDiscounts', event.target.checked)} />}
        label="Apply existing percentage discounts on top of the T-shirt offer" />
      <Alert severity="info">At {offer.minimumQuantity || 3} or more eligible T-shirts, each costs ₹{offer.unitPrice || 333}.
        All additional eligible shirts receive the same rate. Other products keep their own pricing.
        A lower regular price is kept.</Alert>
      <Button type="submit" variant="contained" loading={saving} disabled={loading || saving || !loaded}>Save offer</Button>
    </form>
  </div>;
}
