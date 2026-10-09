import api from '../client';
export const getFaqs = () => api.get('admin/faqs');
export const createFaq = (body) => api.post('admin/faqs', body);
export const updateFaq = (id, body) => api.put(`admin/faqs/${id}`, body);
export const deleteFaq = (id) => api.delete(`admin/faqs/${id}`);
