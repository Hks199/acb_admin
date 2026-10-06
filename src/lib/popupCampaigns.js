export const newCampaign = () => ({ title: '', subtitle: '', imageUrl: '', imageFit: 'cover', imagePosition: 'center', showImageOnMobile: true, ctaText: 'Explore collection', ctaUrl: '/products', couponCode: '', displayType: 'promotion', backgroundTheme: 'glass_dark', isActive: false, endsAt: null });
export const validCampaignUrl = (value, internal = false) => {
  if (!value) return true;
  if (internal && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && [...value].every((character) => character.charCodeAt(0) > 32)) return true;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password; }
  catch { return false; }
};
export const moveCampaign = (rows, from, to) => {
  if (from < 0 || to < 0 || from >= rows.length || to >= rows.length) return rows;
  const reordered = [...rows]; const [campaign] = reordered.splice(from, 1); reordered.splice(to, 0, campaign);
  return reordered.map((row, index) => ({ ...row, priority_order: index + 1 }));
};
export const localDateValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
