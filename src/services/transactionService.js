// src/services/transactionService.js
import axios from 'axios';
import { API_CONFIG } from '../config';


const API_URL = 'http://localhost:5000/api/transactions';


export const getAllTransactions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getCustomerTransactions = async (customerId) => {
  const response = await axios.get(`${API_URL}/customer/${customerId}`);
  return response.data;
};

export const deposit = async (accountNo, amount, employeeId) => {
  const response = await axios.post(`${API_URL}/deposit`, {
    accountNo,
    amount,
    employeeId
  });
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await axios.get(`${API_URL}/requests/pending`);
  return response.data;
};


export const withdraw = async (accountNo, amount, employeeId) => {
  const response = await axios.post(`${API_URL}/withdraw`, {
    accountNo,
    amount,
    employeeId
  });
  return response.data;
};


export const approveRequest = async (requestId, employeeId) => {
  try {
    const response = await axios.post(
      `${API_URL}/approve`,  // Make sure this matches your backend route
      { requestId, employeeId },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'error') {
      // Create an error object that will be caught in the component
      const error = new Error(response.data.details.message);
      error.details = response.data.details;
      throw error;
    }

    return response.data;

  } catch (error) {
    // Enhance the error object
    if (!error.details) {
      error.details = {
        type: 'network',
        message: error.message,
        status: error.response?.status
      };
    }
    throw error;
  }
};

export const transfer = async (senderAcc, receiverAcc, amount, employeeId) => {
  const response = await axios.post(`${API_URL}/transfer`, {
    senderAcc,
    receiverAcc,
    amount,
    employeeId
  });
  return response.data;
};