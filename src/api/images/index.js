import axios from '../client';


export const addImage = async (payload) => {
  try {
    const response = await axios.post("image/create-image", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllImages = async (payload) => {
  try {
    const response = await axios.post("image/getAll-image", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteImage = async(imageId) => {

  try {
    const response = await axios.delete("image/delete-image/" + imageId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateImage = async(imageId, payload) => {
  try {
    const response = await axios.patch("image/update-image/" + imageId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
