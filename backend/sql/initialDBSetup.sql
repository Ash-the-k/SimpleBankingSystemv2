-- ==========================================
-- 1. SETUP (Assuming Fresh Database and Tables/Procedures Created)
-- ==========================================

-- Create Test Employees
INSERT INTO EMPLOYEE (Name, Email, Phone, Role) VALUES
('Alice Brown', 'alice.brown@example.com', '8765432109', 'Manager') ON DUPLICATE KEY UPDATE Name=Name;
INSERT INTO EMPLOYEE (Name, Email, Phone, Role) VALUES
('Bob Green', 'bob.green@example.com', '7654321098', 'Teller') ON DUPLICATE KEY UPDATE Name=Name;
INSERT INTO EMPLOYEE (Name, Email, Phone, Role) VALUES
('Charlie Black', 'charlie.black@example.com', '2233445566', 'Senior Teller') ON DUPLICATE KEY UPDATE Name=Name;

SELECT * FROM EMPLOYEE;

-- Request Accounts for John Doe and Jane Smith
CALL RequestAccount('John Doe', 'john.doe@example.com', '9876543210', '123 Main St');
CALL RequestAccount('Jane Smith', 'jane.smith@example.com', '9988776655', '456 Oak Ave');

-- ==========================================
-- 2. TESTING VIEW: Pending_Requests
-- ==========================================

SELECT '--- Testing View: Pending_Requests (Initial) ---' AS Report;
SELECT * FROM Pending_Requests;

-- Approve Account Requests
SELECT @john_doe_req_id := RequestID FROM Pending_Requests WHERE Name = 'John Doe';
CALL ApproveAccount(@john_doe_req_id, 'Savings', (SELECT EmployeeID FROM EMPLOYEE WHERE Name = 'Alice Brown'));

SELECT '--- Testing View: Pending_Requests (After John Doe Approval) ---' AS Report;
SELECT * FROM Pending_Requests;

SELECT * FROM ACCOUNT;
SELECT * FROM CUSTOMER;

SELECT @jane_smith_req_id := RequestID FROM Pending_Requests WHERE Name = 'Jane Smith';
CALL ApproveAccount(@jane_smith_req_id, 'Checking', (SELECT EmployeeID FROM EMPLOYEE WHERE Name = 'Alice Brown'));

SELECT '--- Testing View: Pending_Requests (After Jane Smith Approval) ---' AS Report;
SELECT * FROM Pending_Requests;

SELECT * FROM ACCOUNT;
SELECT * FROM CUSTOMER;

-- Retrieve Customer IDs for Customer_Profile view testing
SELECT @john_doe_acc := CustomerID FROM CUSTOMER WHERE Name = 'John Doe';
SELECT @jane_smith_acc := CustomerID FROM CUSTOMER WHERE Name = 'Jane Smith';

-- ==========================================
-- 5. TESTING VIEW: Customer_Profile
-- ==========================================

SELECT '--- Testing View: Customer_Profile ---' AS Report;
SELECT * FROM Customer_Profile WHERE CustomerID = @john_doe_acc;
SELECT * FROM Customer_Profile WHERE CustomerID = @jane_smith_acc;
SELECT * FROM Customer_Profile;