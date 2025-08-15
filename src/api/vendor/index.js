import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllVendors = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "vendor/getAll-vendor", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createVendor = async (payload) => {
  try {
    const response = await axios.post(BASE_URL + "vendor/create-vendor", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateVendor = async (vendorId, payload) => {
  try {
    const response = await axios.patch(BASE_URL + "vendor/update-vendor/" + vendorId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteVendor = async(vendorId) => {

  try {
    const response = await axios.delete(BASE_URL + "vendor/delete-vendor/" + vendorId);
    return response;
  } catch (error) {
    throw error;
  }
};
