import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllCategories = async () => {
  try {
    const response = await axios.get(BASE_URL + "category/getAllCategories");
    return response;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async(payload) => {
  try {
    const response = await axios.post(BASE_URL + "category/createCategory", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async(categoryId) => {

  try {
    const response = await axios.delete(BASE_URL + "category/deleteCategory/" + categoryId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async(categoryId, payload) => {
  try {
    const response = await axios.patch(BASE_URL + "category/updateCategory/" + categoryId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
