const db = require('../config/db');

exports.getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await db.execute(`
      SELECT t.*, c.Name AS CustomerName 
      FROM TRANSACTIONS t
      JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
      ORDER BY t.TransactionDate DESC
    `);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerTransactions = async (req, res) => {
  try {
    const [transactions] = await db.execute(
      `SELECT t.*, c.Name AS CustomerName 
       FROM TRANSACTIONS t
       JOIN CUSTOMER c ON t.CustomerID = c.CustomerID
       WHERE t.CustomerID = ? 
       ORDER BY t.TransactionDate DESC`,
      [req.params.customerId]
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { accountNo, amount, employeeId } = req.body;
    const amountNum = Number(amount);

    // Check if high-value transaction
    if (amountNum > 50000) {
      // Create pending request
      const [result] = await db.execute(
        `INSERT INTO TRANSACTION_REQUESTS 
        (CustomerID, ReceiverAcc, Amount, Type, Status, RequestedBy)
        SELECT CustomerID, ?, ?, 'Deposit', 'Pending', ?
        FROM ACCOUNT WHERE AccountNo = ?`,
        [accountNo, amountNum, employeeId, accountNo]
      );
      return res.json({ 
        message: 'Transaction requires approval',
        requestId: result.insertId
      });
    }

    // Process normal deposit
    await db.execute(
      'UPDATE ACCOUNT SET Balance = Balance + ? WHERE AccountNo = ?',
      [amountNum, accountNo]
    );
    
    await db.execute(
      `INSERT INTO TRANSACTIONS 
      (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID)
      SELECT NULL, ?, ?, 'Deposit', 'Approved', CustomerID, ?
      FROM ACCOUNT WHERE AccountNo = ?`,
      [accountNo, amountNum, employeeId, accountNo]
    );

    res.json({ message: 'Deposit successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const [requests] = await db.execute(
      `SELECT r.*, a.AccountType, c.Name AS CustomerName 
       FROM TRANSACTION_REQUESTS r
       JOIN ACCOUNT a ON r.ReceiverAcc = a.AccountNo
       JOIN CUSTOMER c ON a.CustomerID = c.CustomerID
       WHERE r.Status = 'Pending'`
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { requestId, employeeId } = req.body;
    
    await connection.beginTransaction();

    // 1. Get the pending request
    const [requests] = await connection.query(
      `SELECT * FROM TRANSACTION_REQUESTS 
       WHERE RequestID = ? AND Status = 'Pending'`,
      [requestId]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    const request = requests[0];

    // 2. Process based on transaction type
    if (request.Type === 'Withdraw') {
      const [account] = await connection.query(
        'SELECT Balance FROM ACCOUNT WHERE AccountNo = ?',
        [request.SenderAcc]
      );
      
      if (account[0].Balance < request.Amount) {
        await connection.query(
          `UPDATE TRANSACTION_REQUESTS 
           SET Status = 'Rejected', 
               ApprovedBy = ?
           WHERE RequestID = ?`,
          [employeeId, requestId]
        );
        await connection.commit();
        return res.status(400).json({ message: 'Insufficient funds' });
      }

      await connection.query(
        'UPDATE ACCOUNT SET Balance = Balance - ? WHERE AccountNo = ?',
        [request.Amount, request.SenderAcc]
      );
    } 
    else if (request.Type === 'Deposit') {
      await connection.query(
        'UPDATE ACCOUNT SET Balance = Balance + ? WHERE AccountNo = ?',
        [request.Amount, request.ReceiverAcc]
      );
    }
    else if (request.Type === 'Transfer') {
      await connection.query(
        'UPDATE ACCOUNT SET Balance = Balance - ? WHERE AccountNo = ?',
        [request.Amount, request.SenderAcc]
      );
      await connection.query(
        'UPDATE ACCOUNT SET Balance = Balance + ? WHERE AccountNo = ?',
        [request.Amount, request.ReceiverAcc]
      );
      await connection.query(
        `INSERT INTO TRANSACTIONS 
        (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID)
        VALUES (?, ?, ?, 'Transfer', 'Approved', ?, ?)`,
        [request.SenderAcc, request.ReceiverAcc, request.Amount, request.CustomerID, employeeId]
      );
    }

    // 3. Record the transaction
    await connection.query(
      `INSERT INTO TRANSACTIONS 
       (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID)
       VALUES (?, ?, ?, ?, 'Approved', ?, ?)`,
      [
        request.SenderAcc,
        request.ReceiverAcc,
        request.Amount,
        request.Type,
        request.CustomerID,
        employeeId
      ]
    );

    // 4. Update request status (without ApprovalDate)
    await connection.query(
      `UPDATE TRANSACTION_REQUESTS 
       SET Status = 'Approved', 
           ApprovedBy = ?
       WHERE RequestID = ?`,
      [employeeId, requestId]
    );

    await connection.commit();
    res.json({ message: 'Transaction approved successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Approval error:', error);
    res.status(500).json({ 
      message: 'Approval failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { accountNo, amount, employeeId } = req.body;
    const amountNum = Number(amount);

    // Verify sufficient balance
    const [account] = await db.execute(
      'SELECT Balance FROM ACCOUNT WHERE AccountNo = ?',
      [accountNo]
    );
    
    if (account[0].Balance < amountNum) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Check if high-value transaction
    if (amountNum > 50000) {
      const [result] = await db.execute(
        `INSERT INTO TRANSACTION_REQUESTS 
        (CustomerID, SenderAcc, Amount, Type, Status, RequestedBy)
        SELECT CustomerID, ?, ?, 'Withdraw', 'Pending', ?
        FROM ACCOUNT WHERE AccountNo = ?`,
        [accountNo, amountNum, employeeId, accountNo]
      );
      return res.json({ 
        message: 'Withdrawal requires approval',
        requestId: result.insertId
      });
    }

    // Process normal withdrawal
    await db.execute(
      'UPDATE ACCOUNT SET Balance = Balance - ? WHERE AccountNo = ?',
      [amountNum, accountNo]
    );
    
    await db.execute(
      `INSERT INTO TRANSACTIONS 
      (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID)
      SELECT ?, NULL, ?, 'Withdraw', 'Approved', CustomerID, ?
      FROM ACCOUNT WHERE AccountNo = ?`,
      [accountNo, amountNum, employeeId, accountNo]
    );

    res.json({ message: 'Withdrawal successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this new transfer method
exports.transfer = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { senderAcc, receiverAcc, amount, employeeId } = req.body;
    const amountNum = Number(amount);

    await connection.beginTransaction();

    // 1. Verify sender account
    const [sender] = await connection.query(
      'SELECT Balance, Status, CustomerID FROM ACCOUNT WHERE AccountNo = ?',
      [senderAcc]
    );
    if (sender.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Sender account not found' });
    }
    if (sender[0].Status !== 'Active') {
      await connection.rollback();
      return res.status(400).json({ message: 'Sender account not active' });
    }

    // 2. Verify receiver account
    const [receiver] = await connection.query(
      'SELECT Status FROM ACCOUNT WHERE AccountNo = ?',
      [receiverAcc]
    );
    if (receiver.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Receiver account not found' });
    }
    if (receiver[0].Status !== 'Active') {
      await connection.rollback();
      return res.status(400).json({ message: 'Receiver account not active' });
    }

    // 3. Check sufficient balance
    if (sender[0].Balance < amountNum) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // 4. Check if high-value transfer
    if (amountNum > 50000) {
      const [result] = await connection.query(
        `INSERT INTO TRANSACTION_REQUESTS 
        (CustomerID, SenderAcc, ReceiverAcc, Amount, Type, RequestedBy)
        VALUES (?, ?, ?, ?, 'Transfer', ?)`,
        [sender[0].CustomerID, senderAcc, receiverAcc, amountNum, employeeId]
      );
      await connection.commit();
      return res.json({ 
        message: 'Transfer requires approval',
        requestId: result.insertId
      });
    }

    // 5. Process immediate transfer
    await connection.query(
      'UPDATE ACCOUNT SET Balance = Balance - ? WHERE AccountNo = ?',
      [amountNum, senderAcc]
    );
    await connection.query(
      'UPDATE ACCOUNT SET Balance = Balance + ? WHERE AccountNo = ?',
      [amountNum, receiverAcc]
    );
    await connection.query(
      `INSERT INTO TRANSACTIONS 
      (SenderAcc, ReceiverAcc, Amount, Type, Status, CustomerID, EmployeeID)
      VALUES (?, ?, ?, 'Transfer', 'Approved', ?, ?)`,
      [senderAcc, receiverAcc, amountNum, sender[0].CustomerID, employeeId]
    );

    await connection.commit();
    res.json({ message: 'Transfer completed successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Transfer error:', error);
    res.status(500).json({ 
      message: 'Transfer failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
};