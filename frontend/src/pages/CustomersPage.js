import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  styled
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { getCustomers } from '../services/customerService';

// Styled components using the new MUI v5 approach
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const StatusChip = styled(Chip)(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.success.light : theme.palette.error.light,
  color: active ? theme.palette.success.dark : theme.palette.error.dark,
}));

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error refreshing customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1">
          Customer Directory
        </Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3, backgroundColor: 'background.paper' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Customer ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.CustomerID} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText'
                        }}>
                          {customer.Name.charAt(0)}
                        </Avatar>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {customer.Name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {customer.Company || 'No company'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography>{customer.Email}</Typography>
                      <Typography color="text.secondary">
                        {customer.Phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip 
                        label={customer.Status ? 'Active' : 'Inactive'}
                        active={customer.Status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        #{customer.CustomerID}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {searchTerm ? 'No matching customers found' : 'No customers available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </Box>
  );
}

export default CustomersPage;