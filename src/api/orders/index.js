import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllOrders = async(payload) => {
    try {
        const response = await axios.post(BASE_URL + "order/listAllOrders", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const changeOrderStatus = async(payload) => {
  try {
    const response = await axios.patch(BASE_URL + "order/handle-admin-action", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getOrderDetails = async(payload) => {
  try {
    const response = await axios.post(BASE_URL + "order/getOrderDetails", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllReturnedItemsApi = async(payload) => {
  try {
    const response = await axios.post(BASE_URL + "return/getAllReturnedItems", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getReturnedItemDetailApi = async(orderId) => {
  try {
    const response = await axios.get(BASE_URL + "return/getReturnedItemDetail/" + orderId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateReturnStatusApi = async(payload) => {
  try {
    const response = await axios.patch(BASE_URL + "return/return-status", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllCancelledItemsApi = async(payload) => {
  try {
    const response = await axios.post(BASE_URL + "cancel/getAllCancelledItems", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const cancelledItemDetailsApi = async(payload) => {
  try {
    const response = await axios.post(BASE_URL + "cancel/cancel-order-details", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCancelStatusApi = async(payload) => {
  try {
    const response = await axios.patch(BASE_URL + "cancel/cancelled-orders-status-update", payload);
    return response;
  } catch (error) {
    throw error;
  }
};
