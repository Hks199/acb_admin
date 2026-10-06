import api from '../client';
export const getAnnouncements = () => api.get('admin/announcements');
export const createAnnouncement = (body) => api.post('admin/announcements', body);
export const updateAnnouncement = (id, body) => api.put(`admin/announcements/${id}`, body);
export const toggleAnnouncement = (id, isActive) => api.patch(`admin/announcements/${id}/toggle`, { isActive });
