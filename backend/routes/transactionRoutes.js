const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.get('/customer/:customerId', transactionController.getCustomerTransactions);
router.post('/deposit', transactionController.deposit);
// Add routes for withdraw and transfer

module.exports = router;