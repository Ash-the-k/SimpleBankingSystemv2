import axios from 'axios';

const API_URL = 'http://localhost:5000/api/transactions';

export const getCustomerTransactions = async (customerId) => {
  const response = await axios.get(`${API_URL}/customer/${customerId}`);
  return response.data.map(tx => ({
    ...tx,
    Amount: Number(tx.Amount)
  }));
};

export const getAllTransactions = async () => {
  const response = await axios.get(API_URL);
  return response.data.map(tx => ({
    ...tx,
    Amount: Number(tx.Amount)
  }));
};

export const deposit = async (accountNo, amount, employeeId) => {
  const response = await axios.post(`${API_URL}/deposit`, {
    accountNo,
    amount: Number(amount),
    employeeId
  });
  return response.data;
};