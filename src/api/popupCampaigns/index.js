import api from '../client';
export const getPopupCampaigns = () => api.get('admin/promotional-popups');
export const createPopupCampaign = (body) => api.post('admin/promotional-popups', body);
export const updatePopupCampaign = (id, body) => api.put(`admin/promotional-popups/${id}`, body);
export const togglePopupCampaign = (id, isActive) => api.patch(`admin/promotional-popups/${id}/toggle`, { isActive });
export const deletePopupCampaign = (id) => api.delete(`admin/promotional-popups/${id}`);
export const reorderPopupCampaigns = (campaignIds) => api.put('admin/promotional-popups/reorder', { campaignIds });
export const uploadPopupImage = (file) => {
  const body = new FormData(); body.append('image', file);
  return api.post('admin/promotional-popups/upload-image', body);
};
export const getPopupSubscriptions = (id) => api.get(`admin/promotional-popups/${id}/subscriptions`);
