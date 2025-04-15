import React, { useState, useEffect } from 'react';
import { getCustomers, updateCustomerStatus } from '../services/customerService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem } from '@mui/material';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomers();
      setCustomers(data);
    };
    fetchCustomers();
  }, []);

  const handleStatusChange = async (customerId, newStatus) => {
    await updateCustomerStatus(customerId, newStatus);
    setCustomers(customers.map(customer => 
      customer.CustomerID === customerId ? { ...customer, Status: newStatus } : customer
    ));
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.CustomerID}>
              <TableCell>{customer.CustomerID}</TableCell>
              <TableCell>{customer.Name}</TableCell>
              <TableCell>{customer.Email}</TableCell>
              <TableCell>{customer.Phone}</TableCell>
              <TableCell>
                <Select
                  value={customer.Status}
                  onChange={(e) => handleStatusChange(customer.CustomerID, e.target.value)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="contained" color="primary">
                  View Accounts
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerList;