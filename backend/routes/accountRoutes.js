const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// GET all accounts
router.get('/', accountController.getAllAccounts);

// GET accounts by customer ID
router.get('/customer/:customerId', accountController.getCustomerAccounts);

// POST create new account
router.post('/', accountController.createAccount);

// PUT update account status
router.put('/:accountNo/status', accountController.updateAccountStatus);

module.exports = router;