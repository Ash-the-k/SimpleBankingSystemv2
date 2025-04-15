const db = require('../config/db');

class Employee {
  static async create(name, email, phone, role) {
    const [result] = await db.execute(
      'INSERT INTO EMPLOYEE (Name, Email, Phone, Role) VALUES (?, ?, ?, ?)',
      [name, email, phone, role]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM EMPLOYEE');
    return rows;
  }

  static async getById(employeeId) {
    const [rows] = await db.execute('SELECT * FROM EMPLOYEE WHERE EmployeeID = ?', [employeeId]);
    return rows[0];
  }
}

module.exports = Employee;