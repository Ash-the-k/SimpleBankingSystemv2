const db = require('../config/db');

class Account {
  static async create(customerId, accountType) {
    const [result] = await db.execute(
      'INSERT INTO ACCOUNT (CustomerID, AccountType, Balance, Status) VALUES (?, ?, 0, "Active")',
      [customerId, accountType]
    );
    return result.insertId;
  }

  static async getByCustomerId(customerId) {
    const [rows] = await db.execute('SELECT * FROM ACCOUNT WHERE CustomerID = ?', [customerId]);
    return rows;
  }

  static async getByAccountNo(accountNo) {
    const [rows] = await db.execute('SELECT * FROM ACCOUNT WHERE AccountNo = ?', [accountNo]);
    return rows[0];
  }

  static async updateBalance(accountNo, amount) {
    await db.execute('UPDATE ACCOUNT SET Balance = Balance + ? WHERE AccountNo = ?', [amount, accountNo]);
  }

  static async updateStatus(accountNo, status) {
    await db.execute('UPDATE ACCOUNT SET Status = ? WHERE AccountNo = ?', [status, accountNo]);
  }
}

module.exports = Account;