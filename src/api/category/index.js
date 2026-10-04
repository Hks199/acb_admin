import axios from '../client';


export const getAllCategories = async () => {
  try {
    const response = await axios.get("category/getAllCategories");
    return response;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async(payload) => {
  try {
    const response = await axios.post("category/createCategory", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async(categoryId) => {

  try {
    const response = await axios.delete("category/deleteCategory/" + categoryId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async(categoryId, payload) => {
  try {
    const response = await axios.patch("category/updateCategory/" + categoryId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
