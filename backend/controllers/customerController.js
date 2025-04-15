const Customer = require('../models/customerModel');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    await Customer.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Customer status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};