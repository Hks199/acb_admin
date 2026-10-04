import axios from '../client';


export const addAdminReview = (payload) =>
  axios.post('review/addAdminReview', payload);

export const deleteAdminReview = (productId, customerId) =>
  axios.delete('review/deleteAdminReview/' + productId + '/' + customerId);

export const getReviewsByProductId = async(productId, payload) => {
  return axios.post("review/getReviewsByProduct/" + productId, payload);
};

export const deleteReview = async(productId, customerId) => {
  return axios.delete("review/deleteReview/" + productId + "/" + customerId);
};
