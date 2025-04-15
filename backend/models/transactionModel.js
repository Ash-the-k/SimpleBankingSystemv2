const db = require('../config/db');

class Transaction {
  static async create(senderAcc, receiverAcc, amount, type, status, customerId, employeeId) {
    const [result] = await db.execute(
      'INSERT INTO TRANSACTIONS (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [senderAcc, receiverAcc, amount, type, status, customerId, employeeId]
    );
    return result.insertId;
  }

  static async getByCustomerId(customerId) {
    const [rows] = await db.execute('SELECT * FROM TRANSACTIONS WHERE CustomerID = ? ORDER BY TransactionDate DESC LIMIT 5', [customerId]);
    return rows;
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM TRANSACTIONS ORDER BY TransactionDate DESC');
    return rows;
  }
}

module.exports = Transaction;