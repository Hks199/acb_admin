import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllProducts = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "inventory/getProduct-sortedbyReview", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async(payload) => {
  try {
    const response = await axios.post(BASE_URL + "inventory/createProduct", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async(productId) => {

  try {
    const response = await axios.delete(BASE_URL + "inventory/deleteProduct/" + productId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async(productId, payload) => {
  try {
    const response = await axios.patch(BASE_URL + "inventory/updateProduct/" + productId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
