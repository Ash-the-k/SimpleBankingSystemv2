import React, { useState, useEffect } from 'react';
import { getCustomerAccounts, updateAccountStatus } from '../services/accountService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem } from '@mui/material';

const AccountList = ({ customerId }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (customerId) {
        const data = await getCustomerAccounts(customerId);
        setAccounts(data);
      }
    };
    fetchAccounts();
  }, [customerId]);

  const handleStatusChange = async (accountNo, newStatus) => {
    await updateAccountStatus(accountNo, newStatus);
    setAccounts(accounts.map(account => 
      account.AccountNo === accountNo ? { ...account, Status: newStatus } : account
    ));
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Account No</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.AccountNo}>
              <TableCell>{account.AccountNo}</TableCell>
              <TableCell>{account.AccountType}</TableCell>
              <TableCell>${account.Balance.toFixed(2)}</TableCell>
              <TableCell>
                <Select
                  value={account.Status}
                  onChange={(e) => handleStatusChange(account.AccountNo, e.target.value)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="contained" color="primary">
                  View Transactions
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountList;