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


exports.getAllUsers = async () => {
  const [rows] = await db.query(
    `SELECT id, name, employee_id, email, phone, role, status 
     FROM users`
  );
  return rows;
};

exports.deleteUserById = async (id) => {
  const [result] = await db.query(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );
  return result;
};

exports.updateUserRole = async (id, role) => {
  const [result] = await db.query(
    `UPDATE users SET role = ? WHERE id = ?`,
    [role, id]
  );
  return result;
};

exports.updateUserStatus = async (id, status) => {
  const [result] = await db.query(
    `UPDATE users SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result;
};
