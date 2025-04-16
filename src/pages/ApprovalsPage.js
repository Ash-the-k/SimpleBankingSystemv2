import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Button, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { getPendingRequests, approveRequest } from '../services/transactionService';
import { API_URL } from '../services/transactionService'; // Add this line
import { API_CONFIG } from '../config'; 

function ApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, severity: 'info', message: '' });
  const employeeId = 2; // Should come from auth in real app

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingRequests();
      setRequests(data);
    } catch (error) {
      showAlert('error', `Failed to load requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await approveRequest(requestId, employeeId);
      showAlert('success', 'Approval successful!');
      fetchRequests();
  
    } catch (error) {
      // Detailed error message construction
      let errorMessage = 'Approval failed';
      
      if (error.details) {
        errorMessage += `:\n\n${error.details.message}`;
        
        if (error.details.sqlMessage) {
          errorMessage += `\n(SQL Error: ${error.details.sqlMessage})`;
        }
        
        if (error.details.failedQuery) {
          errorMessage += `\n\nFailed Query:\n${error.details.failedQuery}`;
        }
      } else {
        errorMessage += `: ${error.message}`;
      }
  
      showAlert('error', errorMessage);
  
      // Debug output
      console.group('Approval Error Debugging');
      console.log('Request ID:', requestId);
      console.log('Employee ID:', employeeId);
      console.log('Error Object:', error);
      if (error.details) {
        console.log('Error Details:', error.details);
      }
      console.groupEnd();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <div>


      <Typography variant="h4" gutterBottom>Pending Approvals</Typography>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({...alert, open: false})}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map(request => (
              <TableRow key={request.RequestID}>
                <TableCell>{request.RequestID}</TableCell>
                <TableCell>
                  {request.SenderAcc ? `From: ${request.SenderAcc}` : ''}
                  {request.ReceiverAcc ? `To: ${request.ReceiverAcc}` : ''}
                </TableCell>
                <TableCell>{request.Type}</TableCell>
                <TableCell>${Number(request.Amount).toFixed(2)}</TableCell>
                <TableCell>Employee #{request.RequestedBy}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleApprove(request.RequestID)}
                  >
                    Approve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}



export default ApprovalsPage;