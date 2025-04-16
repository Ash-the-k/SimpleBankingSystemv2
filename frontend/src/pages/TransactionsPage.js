import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  TextField, Button, Select, MenuItem,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { 
  getAllTransactions,
  deposit,
  withdraw,  // Add this import
  transfer
} from '../services/transactionService';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId] = useState(2); // Hardcoded for now, should come from auth context
  const [alert, setAlert] = useState({ open: false, severity: 'info', message: '' });
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
        showAlert('error', `Error fetching transactions: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

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
      let response;
      
      if (formData.type === 'deposit') {
        response = await deposit(formData.accountNo, formData.amount, employeeId);
      } 
      else if (formData.type === 'withdraw') {
        response = await withdraw(formData.accountNo, formData.amount, employeeId);
      }
      else if (formData.type === 'transfer') {
        if (!formData.targetAccount) {
          throw new Error('Target account is required for transfer');
        }
        response = await transfer(
          formData.accountNo,
          formData.targetAccount,
          formData.amount,
          employeeId
        );
      }
  
      if (response.message && response.message.includes('requires approval')) {
        showAlert('info', `Transfer requires approval (Request ID: ${response.requestId})`);
      } else {
        showAlert('success', `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} successful!`);
      }
      
      // Refresh transactions
      const data = await getAllTransactions();
      setTransactions(data);
      setFormData({
        type: 'deposit',
        accountNo: '',
        amount: '',
        targetAccount: ''
      });
      
    } catch (error) {
      showAlert('error', error.message);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Transactions</Typography>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>New Transaction</Typography>
        <form onSubmit={handleSubmit}>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value, targetAccount: ''})}
            sx={{ mr: 2, minWidth: 120 }}
          >
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdraw">Withdraw</MenuItem>
            <MenuItem value="transfer">Transfer</MenuItem>
          </Select>

          <TextField
            label={formData.type === 'transfer' ? 'From Account' : 'Account'}
            value={formData.accountNo}
            onChange={(e) => setFormData({...formData, accountNo: e.target.value})}
            sx={{ mr: 2 }}
            required
          />

          {formData.type === 'transfer' && (
            <TextField
              label="To Account"
              value={formData.targetAccount}
              onChange={(e) => setFormData({...formData, targetAccount: e.target.value})}
              sx={{ mr: 2 }}
              required
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

          <Button type="submit" variant="contained">
            Submit
          </Button>
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