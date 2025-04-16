-- ==========================================
-- SIMPLE BANKING SYSTEM — CORRECTED VERSION
-- ==========================================

-- Drop existing DB (optional)
DROP DATABASE IF EXISTS BankingSystem;
CREATE DATABASE BankingSystem;
USE BankingSystem;

-- ==========================================
-- 1. TABLES STRUCTURE
-- ==========================================

CREATE TABLE CUSTOMER_REQUEST (
    RequestID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Address VARCHAR(255) NOT NULL,
    RequestedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending','Approved','Rejected'))
) ENGINE=InnoDB;
 
CREATE TABLE CUSTOMER (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Address VARCHAR(255) NOT NULL,
    ApprovedDate DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active','Suspended'))
) ENGINE=InnoDB;


CREATE TABLE EMPLOYEE (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Role VARCHAR(50) NOT NULL
) ENGINE=InnoDB;


CREATE TABLE ACCOUNT (
    AccountNo INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    AccountType VARCHAR(50) NOT NULL,
    Balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active','Suspended')),
    FOREIGN KEY (CustomerID) REFERENCES CUSTOMER(CustomerID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE TRANSACTIONS (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    SenderAcc INT NULL, -- SenderAcc can be NULL
    ReceiverAcc INT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Status VARCHAR(20) NOT NULL,
    CustomerID INT NOT NULL,
    EmployeeID INT NOT NULL,
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderAcc)     REFERENCES ACCOUNT(AccountNo) ON UPDATE CASCADE,
    FOREIGN KEY (ReceiverAcc) REFERENCES ACCOUNT(AccountNo) ON UPDATE CASCADE,
    FOREIGN KEY (CustomerID)  REFERENCES CUSTOMER(CustomerID) ON UPDATE CASCADE,
    FOREIGN KEY (EmployeeID)  REFERENCES EMPLOYEE(EmployeeID) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE TRANSACTION_REQUESTS (
    RequestID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    SenderAcc INT NULL,
    ReceiverAcc INT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    Type ENUM('Deposit','Withdraw','Transfer') NOT NULL,
    Status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    RequestedBy INT NOT NULL,
    ApprovedBy INT NULL,
    RequestDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID)   REFERENCES CUSTOMER(CustomerID)   ON UPDATE CASCADE,
    FOREIGN KEY (SenderAcc)    REFERENCES ACCOUNT(AccountNo)     ON UPDATE CASCADE,
    FOREIGN KEY (ReceiverAcc)  REFERENCES ACCOUNT(AccountNo)     ON UPDATE CASCADE,
    FOREIGN KEY (RequestedBy)  REFERENCES EMPLOYEE(EmployeeID)   ON UPDATE CASCADE,
    FOREIGN KEY (ApprovedBy)   REFERENCES EMPLOYEE(EmployeeID)   ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS AccountStatusLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    AccountNo INT NOT NULL,
    OldStatus VARCHAR(50) NOT NULL,
    NewStatus VARCHAR(50) NOT NULL,
    ChangedTimestamp DATETIME NOT NULL,
    FOREIGN KEY (AccountNo) REFERENCES ACCOUNT(AccountNo)
);


-- ==========================================
-- 2. STORED PROCEDURES
-- ==========================================

DELIMITER //

-- Request a new account (customer-side)
CREATE PROCEDURE RequestAccount (
    IN p_Name VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Phone VARCHAR(15),
    IN p_Addr VARCHAR(255)
)
BEGIN
    INSERT INTO CUSTOMER_REQUEST (Name, Email, Phone, Address, Status)
    VALUES (p_Name, p_Email, p_Phone, p_Addr, 'Pending');
END //

-- Approve a pending account request (employee-side)
CREATE DEFINER=`root`@`localhost` PROCEDURE `ApproveAccount`(
    IN p_RequestID INT,
    IN p_AccType VARCHAR(50),
    IN p_EmpID INT
)
BEGIN
    DECLARE v_count INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_name  VARCHAR(100);
    DECLARE v_email VARCHAR(100);
    DECLARE v_phone VARCHAR(15);
    DECLARE v_addr  VARCHAR(255);
    DECLARE v_newCust INT;

    -- Validate employee
    SELECT COUNT(*) INTO v_count FROM EMPLOYEE WHERE EmployeeID = p_EmpID;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Employee: Approval denied';
    END IF;

    -- Load request 
    SELECT Status, Name, Email, Phone, Address
      INTO v_status, v_name, v_email, v_phone, v_addr
    FROM CUSTOMER_REQUEST
    WHERE RequestID = p_RequestID;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request not found';
    ELSEIF v_status = 'Approved' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request already approved';
    ELSEIF v_status = 'Rejected' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request was rejected';
    END IF;

    -- Prevent duplicate customer
    SELECT COUNT(*) INTO v_count FROM CUSTOMER WHERE Email = v_email;
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer email already exists';
    END IF;

    -- Create customer + account
    START TRANSACTION;
      INSERT INTO CUSTOMER (Name, Email, Phone, Address, ApprovedDate, Status)
      VALUES (v_name, v_email, v_phone, v_addr, SYSDATE(), 'Active');
      SET v_newCust = LAST_INSERT_ID();

      INSERT INTO ACCOUNT (CustomerID, AccountType, Balance, Status)
      VALUES (v_newCust, p_AccType, 0, 'Active');

      UPDATE CUSTOMER_REQUEST SET Status = 'Approved' WHERE RequestID = p_RequestID;
    COMMIT;
END;



-- Deposit with logging & high-value approval
CREATE PROCEDURE DepositWithLog (
    IN p_AccNo INT,
    IN p_Amount DECIMAL(12,2),
    IN p_EmpID INT
)
BEGIN
    DECLARE v_cust INT;
    DECLARE v_status VARCHAR(20);

    -- Verify account & status
    SELECT CustomerID, Status INTO v_cust, v_status FROM ACCOUNT WHERE AccountNo = p_AccNo;
    IF v_status <> 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not active';
    END IF;

    IF p_Amount > 50000 THEN
        -- queue for approval
        INSERT INTO TRANSACTION_REQUESTS
            (CustomerID, SenderAcc, ReceiverAcc, Amount, Type, RequestedBy)
        VALUES
            (v_cust, NULL, p_AccNo, p_Amount, 'Deposit', p_EmpID);
    ELSE
        -- immediate
        START TRANSACTION;
            UPDATE ACCOUNT
                SET Balance = Balance + p_Amount
            WHERE AccountNo = p_AccNo;
            INSERT INTO TRANSACTIONS
                (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate)
            VALUES
                (NULL, p_AccNo, p_Amount, 'Deposit', 'Approved', v_cust, p_EmpID, SYSDATE());
        COMMIT;
    END IF;
END //


-- Withdraw with approval flow
CREATE PROCEDURE WithdrawWithApproval (
    IN p_AccNo INT,
    IN p_Amount DECIMAL(12,2),
    IN p_CustID INT,
    IN p_EmpID INT
)
BEGIN
    DECLARE v_bal DECIMAL(12,2);
    DECLARE v_owner INT;
    DECLARE v_status VARCHAR(20);

    -- Verify account ownership & status
    SELECT CustomerID, Balance, Status
      INTO v_owner, v_bal, v_status
    FROM ACCOUNT WHERE AccountNo = p_AccNo;

    IF v_owner <> p_CustID THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account/customer mismatch';
    END IF;
    IF v_status <> 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account not active';
    END IF;

    -- Check funds
    IF v_bal < p_Amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient Balance';
    END IF;

    IF p_Amount > 50000 THEN
        -- queue for approval
        INSERT INTO TRANSACTION_REQUESTS
          (CustomerID, SenderAcc, ReceiverAcc, Amount, Type, RequestedBy)
        VALUES
          (p_CustID, p_AccNo, NULL, p_Amount, 'Withdraw', p_EmpID);
    ELSE
        -- immediate
        START TRANSACTION;
          UPDATE ACCOUNT
            SET Balance = Balance - p_Amount
          WHERE AccountNo = p_AccNo;
          INSERT INTO TRANSACTIONS
            (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate)
          VALUES
            (p_AccNo, NULL, p_Amount, 'Withdraw', 'Approved', p_CustID, p_EmpID, SYSDATE());
        COMMIT;
    END IF;
END //


-- Transfer With Approval
CREATE PROCEDURE TransferWithApproval (
    IN p_SenderAcc INT,
    IN p_ReceiverAcc INT,
    IN p_Amount DECIMAL(12,2),
    IN p_CustID INT,
    IN p_EmpID INT
)
BEGIN
    DECLARE v_sender_bal DECIMAL(12,2);
    DECLARE v_sender_status VARCHAR(20);
    DECLARE v_receiver_status VARCHAR(20);

    -- Verify sender account status and balance
    SELECT Balance, Status INTO v_sender_bal, v_sender_status FROM ACCOUNT WHERE AccountNo = p_SenderAcc;
    IF v_sender_status <> 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sender account not active';
    END IF;
    IF v_sender_bal < p_Amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds in sender account';
    END IF;

    -- Verify receiver account status
    SELECT Status INTO v_receiver_status FROM ACCOUNT WHERE AccountNo = p_ReceiverAcc;
    IF v_receiver_status <> 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Receiver account not active';
    END IF;

    -- Check if transfer amount exceeds threshold
    IF p_Amount > 50000 THEN
        -- Queue for approval
        INSERT INTO TRANSACTION_REQUESTS
            (CustomerID, SenderAcc, ReceiverAcc, Amount, Type, Status, RequestedBy)
        VALUES
            (p_CustID, p_SenderAcc, p_ReceiverAcc, p_Amount, 'Transfer', 'Pending', p_EmpID);
    ELSE
        -- Immediate transfer processing
        START TRANSACTION;
            UPDATE ACCOUNT SET Balance = Balance - p_Amount WHERE AccountNo = p_SenderAcc;
            UPDATE ACCOUNT SET Balance = Balance + p_Amount WHERE AccountNo = p_ReceiverAcc;
            INSERT INTO TRANSACTIONS
                (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate)
            VALUES
                (p_SenderAcc, p_ReceiverAcc, p_Amount, 'Transfer', 'Approved', p_CustID, p_EmpID, SYSDATE());
        COMMIT;
    END IF;
END //

-- Approve or reject queued transaction requests
CREATE PROCEDURE ApproveTransactionRequest (
    IN p_RequestID INT,
    IN p_ApproverID INT
)
BEGIN
    DECLARE v_cust INT;
    DECLARE v_sacc INT;
    DECLARE v_racc INT;
    DECLARE v_amt DECIMAL(12,2);
    DECLARE v_type ENUM('Deposit','Withdraw','Transfer');
    DECLARE v_status ENUM('Pending','Approved','Rejected');
    DECLARE v_acc_status VARCHAR(20);
    DECLARE v_src_bal DECIMAL(12,2);
    DECLARE v_bal DECIMAL(12,2);

    -- Load request details
    SELECT CustomerID, SenderAcc, ReceiverAcc, Amount, Type, Status
        INTO v_cust, v_sacc, v_racc, v_amt, v_type, v_status
    FROM TRANSACTION_REQUESTS
    WHERE RequestID = p_RequestID;

    IF v_status <> 'Pending' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request already processed';
    END IF;

    START TRANSACTION;

    -- Handle deposit/withdraw/transfer based on type
    IF v_type = 'Deposit' THEN
        -- Verify receiver account status
        SELECT Status INTO v_acc_status FROM ACCOUNT WHERE AccountNo = v_racc;
        IF v_acc_status <> 'Active' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Receiver account not active';
        END IF;
        
        -- Process deposit
        UPDATE ACCOUNT SET Balance = Balance + v_amt WHERE AccountNo = v_racc;
        INSERT INTO TRANSACTIONS
            (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate)
        VALUES
            (NULL, v_racc, v_amt, 'Deposit', 'Approved', v_cust, p_ApproverID, SYSDATE());

    ELSEIF v_type = 'Withdraw' THEN
        -- Verify sender account status and balance
        SELECT Balance, Status INTO v_bal, v_acc_status FROM ACCOUNT WHERE AccountNo = v_sacc;
        IF v_acc_status <> 'Active' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sender account not active';
        END IF;
        IF v_bal < v_amt THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient Balance';
        END IF;
        
        -- Process withdrawal
        UPDATE ACCOUNT SET Balance = Balance - v_amt WHERE AccountNo = v_sacc;
        INSERT INTO TRANSACTIONS
            (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate)
        VALUES
            (v_sacc, NULL, v_amt, 'Withdraw', 'Approved', v_cust, p_ApproverID, SYSDATE());

    ELSEIF v_type = 'Transfer' THEN
        -- Verify both accounts and balance
        SELECT Balance, Status INTO v_src_bal, v_acc_status FROM ACCOUNT WHERE AccountNo = v_sacc;
        IF v_acc_status <> 'Active' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sender account not active';
        END IF;
        IF v_src_bal < v_amt THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient Balance';
        END IF;
        
        SELECT Status INTO v_acc_status FROM ACCOUNT WHERE AccountNo = v_racc;
        IF v_acc_status <> 'Active' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Receiver account not active';
        END IF;

        -- Process transfer
        UPDATE ACCOUNT SET Balance = Balance - v_amt WHERE AccountNo = v_sacc;
        UPDATE ACCOUNT SET Balance = Balance + v_amt WHERE AccountNo = v_racc;
        INSERT INTO TRANSACTIONS
            (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID, TransactionDate)
        VALUES
            (v_sacc, v_racc, v_amt, 'Transfer', 'Approved', v_cust, p_ApproverID, SYSDATE());

    END IF;

    -- Update request status
    UPDATE TRANSACTION_REQUESTS
        SET Status = 'Approved', ApprovedBy = p_ApproverID
    WHERE RequestID = p_RequestID;

    COMMIT;
END //

-- Other utility procs unchanged
CREATE PROCEDURE GetCustomerDetails (IN p_CustID INT)
BEGIN
    SELECT * FROM CUSTOMER WHERE CustomerID = p_CustID;
END //

CREATE PROCEDURE GetMiniStatement (IN p_CustID INT)
BEGIN
    SELECT * FROM TRANSACTIONS
    WHERE CustomerID = p_CustID AND Status = 'Approved'
    ORDER BY TransactionDate DESC
    LIMIT 5;
END //

DELIMITER ;

-- ==========================================
-- 3. VIEWS
-- ==========================================

-- Pending_Requests: Shows all pending customer account requests.

CREATE VIEW Pending_Requests AS
SELECT * FROM CUSTOMER_REQUEST WHERE Status = 'Pending';

-- Customer_Transactions: Shows all approved customer transactions.
CREATE VIEW Customer_Transactions AS
SELECT * FROM TRANSACTIONS WHERE Status = 'Approved';


-- High_Value_Transactions: Shows transactions with amounts greater than 50000.
CREATE VIEW High_Value_Transactions AS
SELECT * FROM TRANSACTIONS WHERE Amount > 50000;

-- Customer_Profile: Joins customer and account information.
CREATE VIEW Customer_Profile AS
SELECT c.CustomerID, c.Name, c.Email, c.Phone, c.Address,
       a.AccountNo, a.AccountType, a.Balance, a.Status
FROM CUSTOMER c
JOIN ACCOUNT a ON c.CustomerID = a.CustomerID;


-- Customer_Balance: Shows customer account balances.
CREATE VIEW Customer_Balance AS
SELECT a.CustomerID, a.AccountNo, a.Balance
FROM ACCOUNT a
WHERE a.Status = 'Active';


-- ActiveCustomerAccounts: Shows active customer accounts.
CREATE VIEW ActiveCustomerAccounts AS
SELECT c.CustomerID, c.Name, a.AccountNo, a.AccountType, a.Balance
FROM CUSTOMER c
JOIN ACCOUNT a ON c.CustomerID = a.CustomerID
WHERE c.Status = 'Active' AND a.Status = 'Active';

-- ==========================================
-- 4. TRIGGERS
-- ==========================================

DELIMITER //

-- Block suspended accounts on transactions
CREATE TRIGGER Block_Suspended_Account
BEFORE INSERT ON TRANSACTIONS
FOR EACH ROW
BEGIN
    DECLARE s_status VARCHAR(20);
    IF NEW.SenderAcc IS NOT NULL THEN
        SELECT Status INTO s_status FROM ACCOUNT WHERE AccountNo = NEW.SenderAcc;
        IF s_status = 'Suspended' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction blocked: Suspended sender account';
        END IF;
    END IF;
    IF NEW.ReceiverAcc IS NOT NULL THEN
        SELECT Status INTO s_status FROM ACCOUNT WHERE AccountNo = NEW.ReceiverAcc;
        IF s_status = 'Suspended' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction blocked: Suspended receiver account';
        END IF;
    END IF;
END //

-- Prevent negative balance on account update
CREATE TRIGGER PreventNegativeBalance
BEFORE UPDATE ON ACCOUNT
FOR EACH ROW
BEGIN
    IF NEW.Balance < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds.';
    END IF;
END //

-- Log Account Status Change
CREATE TRIGGER LogAccountStatusChange
AFTER UPDATE ON ACCOUNT
FOR EACH ROW
BEGIN
    IF NEW.Status <> OLD.Status THEN
        INSERT INTO AccountStatusLog (
            AccountNo,
            OldStatus,
            NewStatus,
            ChangedTimestamp
        ) VALUES (
            NEW.AccountNo,
            OLD.Status,
            NEW.Status,
            NOW()
        );
    END IF;
END //

DELIMITER ;

