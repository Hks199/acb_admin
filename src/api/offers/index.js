import api from '../client';

export const getTshirtOffer = () => api.get('tshirt-offer');
export const saveTshirtOffer = (offer) => api.put('tshirt-offer', offer);
