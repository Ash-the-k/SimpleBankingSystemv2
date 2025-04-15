const Request = require('../models/requestModel');

exports.createRequest = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const requestId = await Request.create(name, email, phone, address);
    res.status(201).json({ requestId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.getAllPending();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { requestId, accountType, employeeId } = req.body;
    await Request.approve(requestId, accountType, employeeId);
    res.json({ message: 'Request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    await Request.reject(req.params.id);
    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};