const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Make sure these match exactly with your controller exports
router.get('/', transactionController.getAllTransactions);
router.get('/customer/:customerId', transactionController.getCustomerTransactions);
router.post('/deposit', transactionController.deposit);
router.get('/requests/pending', transactionController.getPendingRequests);
router.post('/withdraw', transactionController.withdraw);
router.post('/approve', transactionController.approveRequest); 
router.post('/transfer', transactionController.transfer);

module.exports = router;