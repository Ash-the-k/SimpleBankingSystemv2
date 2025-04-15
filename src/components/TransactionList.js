import React, { useState, useEffect } from 'react';
import { getCustomerTransactions } from '../services/transactionService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const TransactionList = ({ customerId }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (customerId) {
        const data = await getCustomerTransactions(customerId);
        setTransactions(data);
      }
    };
    fetchTransactions();
  }, [customerId]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.TransactionID}>
              <TableCell>{transaction.TransactionID}</TableCell>
              <TableCell>{transaction.Type}</TableCell>
              <TableCell>${transaction.Amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(transaction.TransactionDate).toLocaleString()}</TableCell>
              <TableCell>{transaction.Status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionList;