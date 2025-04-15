import React from 'react';
import RequestList from '../components/RequestList';
import { Container, Typography } from '@mui/material';

const RequestsPage = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Pending Account Requests
      </Typography>
      <RequestList />
    </Container>
  );
};

export default RequestsPage;