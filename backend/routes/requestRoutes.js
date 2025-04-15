const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/pending', requestController.getPendingRequests);
router.post('/', requestController.createRequest);
router.post('/:id/approve', requestController.approveRequest);
router.post('/:id/reject', requestController.rejectRequest);

module.exports = router;