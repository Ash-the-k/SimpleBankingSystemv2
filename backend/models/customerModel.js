const db = require('../config/db');

class Customer {
  static async create(name, email, phone, address) {
    const [result] = await db.execute(
      'INSERT INTO CUSTOMER (Name, Email, Phone, Address, ApprovedDate, Status) VALUES (?, ?, ?, ?, NOW(), "Active")',
      [name, email, phone, address]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM CUSTOMER');
    return rows;
  }

  static async getById(customerId) {
    const [rows] = await db.execute('SELECT * FROM CUSTOMER WHERE CustomerID = ?', [customerId]);
    return rows[0];
  }

  static async updateStatus(customerId, status) {
    await db.execute('UPDATE CUSTOMER SET Status = ? WHERE CustomerID = ?', [status, customerId]);
  }
}

module.exports = Customer;
