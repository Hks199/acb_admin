import axios from '../client';


export const getProductsByCategoryId = (payload) =>
  axios.post("inventory/getProductsByCategoryId", payload);

export const getAllProducts = async (payload) => {
  try {
    const response = await axios.post("inventory/getProduct-sortedbyReview", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async(payload) => {
  try {
    const response = await axios.post("inventory/createProduct", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async(productId) => {

  try {
    const response = await axios.delete("inventory/deleteProduct/" + productId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateYourProduct = async(productId, payload) => {
  try {
    const response = await axios.patch("inventory/updateProduct/" + productId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
