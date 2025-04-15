const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');

exports.getCustomerTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getByCustomerId(req.params.customerId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { accountNo, amount, employeeId } = req.body;
    
    // Verify account exists
    const account = await Account.getByAccountNo(accountNo);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Create transaction
    const transactionId = await Transaction.create(
      null, 
      accountNo, 
      amount, 
      'Deposit', 
      'Approved', 
      account.CustomerID, 
      employeeId
    );
    
    // Update account balance
    await Account.updateBalance(accountNo, amount);
    
    res.status(201).json({ transactionId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Similar methods for withdraw and transfer would go here