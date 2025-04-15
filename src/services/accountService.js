import axios from 'axios';

const API_URL = 'http://localhost:5000/api/accounts';

export const getCustomerAccounts = async (customerId) => {
  const response = await axios.get(`${API_URL}/customer/${customerId}`);
  return response.data.map(account => ({
    ...account,
    Balance: Number(account.Balance)
  }));
};

export const getAllAccounts = async () => {
  const response = await axios.get(API_URL);
  return response.data.map(account => ({
    ...account,
    Balance: Number(account.Balance)
  }));
};