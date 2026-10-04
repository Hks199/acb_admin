import axios from '../client';


export const getAllVendors = async (payload) => {
  try {
    const response = await axios.post("vendor/getAll-vendor", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createVendor = async (payload) => {
  try {
    const response = await axios.post("vendor/create-vendor", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateVendor = async (vendorId, payload) => {
  try {
    const response = await axios.patch("vendor/update-vendor/" + vendorId, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteVendor = async(vendorId) => {

  try {
    const response = await axios.delete("vendor/delete-vendor/" + vendorId);
    return response;
  } catch (error) {
    throw error;
  }
};
