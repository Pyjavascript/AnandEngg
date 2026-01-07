const db = require('../config/db');

exports.findByEmployeeId = async (employeeId) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId]
  );
  return rows;
};

exports.createUser = async ({ name, employeeId, email, phone, role, password }) => {
  const [result] = await db.query(
    `INSERT INTO users (name, employee_id, email, phone, role, password)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, employeeId, email, phone, role, password]
  );
  return result;
};

exports.updateProfile = async (employeeId, name, email, phone) => {
  const [result] = await db.query(
    `UPDATE users 
     SET name = ?, email = ?, phone = ?
     WHERE employee_id = ?`,
    [name, email, phone, employeeId]
  );
  return result;
};

 exports.updatePassword = (employeeId, password) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE users SET password = ? WHERE employee_id = ?',
      [password, employeeId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};