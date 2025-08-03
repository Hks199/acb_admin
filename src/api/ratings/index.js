import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getReviewsByProductId = async(productId, payload) => {
    try {
        const response = await axios.post(BASE_URL + "review/getReviewsByProduct/" + productId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteReview = async(productId, customerId) => {
  try {
    const response = await axios.delete(BASE_URL + "review/deleteReview/" + productId + "/" + customerId);
    return response;
  } catch (error) {
    throw error;
  }
};
