# Simple Banking System

## Overview
This project delivers a foundational banking system, providing the core infrastructure to manage customers, accounts, transactions, and employee requests. While still under development, the system boasts a robust and well-tested database structure, with solid SQL functionality (see the linked repository for detailed testing and documentation).

This initiative was born from a DBMS mini-project and represents a significant effort in building a working database-backed application. For a more in-depth understanding of the database structure, SQL functionality, and testing, please refer to the detailed documentation and tests in this repository: https://github.com/Ash-the-k/SimpleBankingSystem-DB

**Note:** Some features are still under development and thus may be incomplete or subject to change.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Database Setup](#database-setup-scriptsh-details)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Areas for Improvement](#areas-for-improvement)
- [End Note](#end-note)


## Technologies Used
- **Backend:** Node.js, Express.js, MySQL, Sequelize (ORM)
- **Frontend:** React.js, React Router
- **Database:** MySQL
- **Other:** Git, npm

## Prerequisites
- Node.js and npm installed.
- MySQL Server installed and running.
- Basic knowledge of Git, Node.js, Express, React, and MySQL.

## Installation and Setup
Follow these steps to set up the project:

### Clone the repository:
```bash
git clone https://github.com/Ash-the-k/SimpleBankingSystemv2.git
cd SimpleBankingSystemv2
```

### Backend Configuration:
Create a `.env` file in the `backend/` directory. Add the following database configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=BankingSystem
PORT=5000
```
- Replace `root` with your MySQL username.
- Replace `` with your MySQL password (leave it empty if you don't have a password).
- Ensure `DB_NAME` is set to `BankingSystem`.
- Change the `PORT` if you want the backend to run on a different port.

### Initialize the Database:
```bash
cd backend/
chmod +x script.sh
./script.sh
```

### Install Backend Dependencies and Start the Server:
```bash
cd backend/
npm install
npm start
```

### Install Frontend Dependencies and Start the Application:
```bash
cd frontend/
npm install
npm start
```
The application should now be running in your browser (usually at http://localhost:3000).

## Database Setup (script.sh details)
The `script.sh` automates the database setup:
- Navigates to the backend directory.
- Loads environment variables from `backend/.env`.
- Creates a temporary MySQL configuration file.
- Creates the database (if it doesn't exist).
- Executes SQL scripts:
  - `SimpleBankingManagementSystemVF.sql` (creates schema).
  - `initialDBSetup.sql` (seeds data).
- Cleans up the temporary configuration file.

## Project Structure
```
backend/
├── config/             # Database configuration
│   └── db.js           # (Likely) Database connection setup
├── controllers/        # Handles application logic for each entity
│   ├── accountController.js
│   ├── customerController.js
│   ├── employeeController.js
│   ├── requestController.js
│   └── transactionController.js
├── models/             # Defines the structure of the database tables
│   ├── accountModel.js
│   ├── customerModel.js
│   ├── employeeModel.js
│   ├── requestModel.js
│   └── transactionModel.js
├── routes/             # Defines the API endpoints
│   ├── accountRoutes.js
│   ├── customerRoutes.js
│   ├── employeeRoutes.js
│   ├── requestRoutes.js
│   └── transactionRoutes.js
├── sql/                # SQL scripts for database initialization
│   ├── initialDBSetup.sql
│   └── SimpleBankingManagementSystemVF.sql
├── app.js              # Main application file (Express server setup)
├── .env                # Environment variables
├── package-lock.json
├── package.json
└── script.sh           # Script to initialize the database



frontend/
├── public/            # Static assets (HTML, images)
│   ├── favicon.ico
│   ├── index.html
├── src/               # React application source code
│   ├── components/    # Reusable UI components
│   │   ├── AccountList.js
│   │   ├── CustomerForm.js
│   │   ├── CustomerList.js
│   │   ├── EmployeeList.js
│   │   ├── Header.js
│   │   ├── Login.js
│   │   ├── RequestList.js
│   │   ├── TransactionForm.js
│   │   └── TransactionList.js
│   ├── pages/         # Main application pages
│   │   ├── AccountsPage.js
│   │   ├── ApprovalsPage.js
│   │   ├── CustomersPage.js
│   │   ├── Dashboard.js
│   │   ├── EmployeesPage.js
│   │   ├── LoginPage.js
│   │   ├── RequestsPage.js
│   │   └── TransactionsPage.js
│   ├── services/      # API interaction logic
│   │   ├── accountService.js
│   │   ├── authService.js
│   │   ├── customerService.js
│   │   ├── employeeService.js
│   │   ├── requestService.js
│   │   └── transactionService.js
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── config.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   └── setupTests.js
├── .gitignore
├── package-lock.json
├── package.json
└── README.md

```

## Contributing
Since this is a work-in-progress, contributions are welcome! Here's how you can contribute:
- Fork the repository.
- Create a new branch for your feature or bug fix.
- Make your changes.
- Commit your changes and push to your fork.
- Submit a pull request.

## Areas for Improvement
- **Complete Authentication:** Implement a robust authentication and authorization system (e.g., using JWT).
- **Error Handling:** Implement comprehensive error handling in the backend.
- **Validation:** Add input validation for all API endpoints.
- **Testing:** Write unit and integration tests for both the frontend and backend.
- **Documentation:** Add more detailed API documentation (e.g., using Swagger or OpenAPI).
- **Frontend UI:** Improve the user interface and user experience of the frontend.
- **Database Migrations:** Implement database migrations (e.g., using Sequelize migrations) for easier schema management.
- **Security:** Implement security best practices to protect against vulnerabilities (e.g., input sanitization, защита от CSRF, защита от XSS).
- **State Management:** (Frontend) Consider using a more robust state management solution (like Redux or Zustand) for larger applications.

## End Note

Thank you for taking the time to explore this project. This system represents an ongoing effort to build a reliable, database-driven banking application with clean architecture and maintainable code.

Further improvements and refinements are planned, and contributions are welcome. If you encounter any issues or have suggestions for enhancements, feel free to open an issue or submit a pull request.

This repository aims to serve as a practical reference for database-backed application development using modern web technologies.

