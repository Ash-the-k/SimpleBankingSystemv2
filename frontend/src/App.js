import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, CssBaseline } from '@mui/material';
// import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import ApprovalsPage from './pages/ApprovalsPage';

function App() {
  return (
    <Router>
      <CssBaseline />
      
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          {/* <Button color="inherit" component={Link} to="/">Dashboard</Button> */}
          <Button color="inherit" component={Link} to="/">Customers</Button>
          <Button color="inherit" component={Link} to="/accounts">Accounts</Button>
          <Button color="inherit" component={Link} to="/transactions">Transactions</Button>
          
          {/* Add this new Approvals button */}
          <Button 
            color="inherit" 
            component={Link} 
            to="/approvals"
          >
            Approvals
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/" element={<CustomersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
        </Routes>
      </Container>
    </Router>
  );
}
export default App;