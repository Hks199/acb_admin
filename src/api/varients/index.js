import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllVarient = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "variants/getAllVariant", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createVarient = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "variants/create-variant", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteVarient = async(varientId) => {

  try {
    const response = await axios.delete(BASE_URL + "variants/deleteVariantSet/" + varientId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateVarient = async(varientId, payload) => {
  try {
    const response = await axios.patch(BASE_URL + "variants/updateVariantSet/" + varientId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
