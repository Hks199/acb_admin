import api from '../client';

export const getDiscountRules = () => api.get('admin/discount-rules');
export const saveDiscountRule = (ruleKey, settings) => api.put(`admin/discount-rules/${encodeURIComponent(ruleKey)}`, settings);
