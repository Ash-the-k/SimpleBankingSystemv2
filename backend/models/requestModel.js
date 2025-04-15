const db = require('../config/db');

class Request {
  static async create(name, email, phone, address) {
    const [result] = await db.execute(
      'INSERT INTO CUSTOMER_REQUEST (Name, Email, Phone, Address, Status) VALUES (?, ?, ?, ?, "Pending")',
      [name, email, phone, address]
    );
    return result.insertId;
  }

  static async getAllPending() {
    const [rows] = await db.execute('SELECT * FROM CUSTOMER_REQUEST WHERE Status = "Pending"');
    return rows;
  }

  static async approve(requestId, accountType, employeeId) {
    // This will use the stored procedure
    await db.execute('CALL ApproveAccount(?, ?, ?)', [requestId, accountType, employeeId]);
  }

  static async reject(requestId) {
    await db.execute('UPDATE CUSTOMER_REQUEST SET Status = "Rejected" WHERE RequestID = ?', [requestId]);
  }
}

module.exports = Request;