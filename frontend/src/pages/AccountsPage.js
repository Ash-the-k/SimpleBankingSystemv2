import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  CircularProgress
} from '@mui/material';
import { getAllAccounts } from '../services/accountService'; // We'll create this

function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const formatCurrency = (value) => {
    const num = Number(value);
    return isNaN(num) ? '$0.00' : num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>All Accounts</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account #</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map(account => (
              <TableRow key={account.AccountNo}>
                <TableCell>{account.AccountNo}</TableCell>
                <TableCell>{account.CustomerID}</TableCell>
                <TableCell>{account.AccountType}</TableCell>
                <TableCell>{formatCurrency(account.Balance)}</TableCell>
                <TableCell>{account.Status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AccountsPage;