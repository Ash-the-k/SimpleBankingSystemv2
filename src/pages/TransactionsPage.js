import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem,
  CircularProgress
} from '@mui/material';
import { getAllTransactions, deposit } from '../services/transactionService';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'deposit',
    accountNo: '',
    amount: '',
    targetAccount: ''
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getAllTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatCurrency = (value) => {
    const num = Number(value);
    return isNaN(num) ? '$0.00' : num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.type === 'deposit') {
        await deposit(formData.accountNo, formData.amount, 1); // employeeId hardcoded
        alert('Transaction successful!');
        // Refresh transactions
        const data = await getAllTransactions();
        setTransactions(data);
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Transactions</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>New Transaction</Typography>
        <form onSubmit={handleSubmit}>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            sx={{ mr: 2, minWidth: 120 }}
          >
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdraw">Withdraw</MenuItem>
            <MenuItem value="transfer">Transfer</MenuItem>
          </Select>
          <TextField
            label="Account #"
            value={formData.accountNo}
            onChange={(e) => setFormData({...formData, accountNo: e.target.value})}
            sx={{ mr: 2 }}
            required
          />
          {formData.type === 'transfer' && (
            <TextField
              label="Target Account #"
              value={formData.targetAccount}
              onChange={(e) => setFormData({...formData, targetAccount: e.target.value})}
              sx={{ mr: 2 }}
            />
          )}
          <TextField
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            sx={{ mr: 2 }}
            required
          />
          <Button type="submit" variant="contained">Submit</Button>
        </form>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>From Account</TableCell>
              <TableCell>To Account</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.TransactionID}>
                <TableCell>{tx.TransactionID}</TableCell>
                <TableCell>{tx.Type}</TableCell>
                <TableCell>{formatCurrency(tx.Amount)}</TableCell>
                <TableCell>{tx.SenderAcc || '-'}</TableCell>
                <TableCell>{tx.ReceiverAcc || '-'}</TableCell>
                <TableCell>{formatDate(tx.TransactionDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default TransactionsPage;