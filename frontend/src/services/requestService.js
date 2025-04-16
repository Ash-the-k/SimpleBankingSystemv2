import axios from 'axios';

const API_URL = 'http://localhost:5000/api/requests';

export const getPendingRequests = async () => {
  const response = await axios.get(`${API_URL}/pending`);
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await axios.post(API_URL, requestData);
  return response.data;
};

export const approveRequest = async (requestId, accountType, employeeId) => {
  const response = await axios.post(`${API_URL}/${requestId}/approve`, { accountType, employeeId });
  return response.data;
};

export const rejectRequest = async (requestId) => {
  const response = await axios.post(`${API_URL}/${requestId}/reject`);
  return response.data;
};