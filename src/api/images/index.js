import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const addImage = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "image/create-image", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllImages = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "image/getAll-image", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteImage = async(imageId) => {

  try {
    const response = await axios.delete(BASE_URL + "image/delete-image/" + imageId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateImage = async(imageId, payload) => {
  try {
    const response = await axios.patch(BASE_URL + "image/update-image/" + imageId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
