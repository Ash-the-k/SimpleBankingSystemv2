import axios from 'axios';

const API_URL = 'http://localhost:5000/api/customers';

export const getCustomers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateCustomerStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status });
  return response.data;
};