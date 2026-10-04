import axios from '../client';


export const getAllVarient = async (payload) => {
  try {
    const response = await axios.post("variants/getAllVariant", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createVarient = async (payload) => {
  try {
    const response = await axios.post("variants/create-variant", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteVarient = async(varientId) => {

  try {
    const response = await axios.delete("variants/deleteVariantSet/" + varientId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateVarient = async(varientId, payload) => {
  try {
    const response = await axios.patch("variants/updateVariantSet/" + varientId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
