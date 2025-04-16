import React, { useState, useEffect } from 'react';
import { getPendingRequests, approveRequest, rejectRequest } from '../services/requestService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [accountType, setAccountType] = useState('Savings');

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await getPendingRequests();
      setRequests(data);
    };
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    if (!employeeId) {
      alert('Please enter employee ID');
      return;
    }
    await approveRequest(requestId, accountType, employeeId);
    setRequests(requests.filter(request => request.RequestID !== requestId));
  };

  const handleReject = async (requestId) => {
    await rejectRequest(requestId);
    setRequests(requests.filter(request => request.RequestID !== requestId));
  };

  return (
    <div>
      <TextField
        label="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        margin="normal"
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.RequestID}>
                <TableCell>{request.RequestID}</TableCell>
                <TableCell>{request.Name}</TableCell>
                <TableCell>{request.Email}</TableCell>
                <TableCell>{request.Phone}</TableCell>
                <TableCell>
                  <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                  </select>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleApprove(request.RequestID)}
                    style={{ marginRight: '10px' }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleReject(request.RequestID)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RequestList;