import axios from '../client';


export const getAllOrders = async(payload) => {
    try {
        const response = await axios.post("order/listAllOrders", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const changeOrderStatus = async(payload) => {
  try {
    const response = await axios.patch("order/handle-admin-action", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getOrderDetails = async(payload) => {
  try {
    const response = await axios.post("order/getOrderDetails", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllReturnedItemsApi = async(payload) => {
  try {
    const response = await axios.post("return/getAllReturnedItems", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getReturnedItemDetailApi = async(orderId) => {
  try {
    const response = await axios.get("return/getReturnedItemDetail/" + orderId);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateReturnStatusApi = async(payload) => {
  try {
    const response = await axios.patch("return/return-status", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllCancelledItemsApi = async(payload) => {
  try {
    const response = await axios.post("cancel/getAllCancelledItems", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const cancelledItemDetailsApi = async(payload) => {
  try {
    const response = await axios.post("cancel/cancel-order-details", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCancelStatusApi = async(payload) => {
  try {
    const response = await axios.patch("cancel/cancelled-orders-status-update", payload);
    return response;
  } catch (error) {
    throw error;
  }
};
