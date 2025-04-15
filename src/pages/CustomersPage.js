import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { getCustomers } from '../services/customerService';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>
      {customers.length > 0 ? (
        <ul>
          {customers.map(customer => (
            <li key={customer.CustomerID}>
              {customer.Name} - {customer.Email}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading customers...</p>
      )}
    </div>
  );
}

export default CustomersPage;