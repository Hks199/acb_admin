import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const addAdminReview = (payload) =>
  axios.post(BASE_URL + 'review/addAdminReview', payload);

export const deleteAdminReview = (productId, customerId) =>
  axios.delete(BASE_URL + 'review/deleteAdminReview/' + productId + '/' + customerId);

export const getReviewsByProductId = async(productId, payload) => {
  return axios.post(BASE_URL + "review/getReviewsByProduct/" + productId, payload);
};

export const deleteReview = async(productId, customerId) => {
  return axios.delete(BASE_URL + "review/deleteReview/" + productId + "/" + customerId);
};
