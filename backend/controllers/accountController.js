const Account = require('../models/accountModel');
const db = require('../config/db');

exports.createAccount = async (req, res) => {
  try {
    const accountId = await Account.create(req.body.customerId, req.body.accountType);
    res.status(201).json({ accountId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerAccounts = async (req, res) => {
  try {
    const accounts = await Account.getByCustomerId(req.params.customerId);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAccountStatus = async (req, res) => {
  try {
    await Account.updateStatus(req.params.accountNo, req.body.status);
    res.json({ message: 'Account status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const [accounts] = await db.execute('SELECT * FROM ACCOUNT');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};