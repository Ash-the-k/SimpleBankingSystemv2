const Employee = require('../models/employeeModel');

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const employeeId = await Employee.create(name, email, phone, role);
    res.status(201).json({ employeeId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.getById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};