// const db = require('../config/db');

// exports.findByEmployeeId = (employeeId, callback) => {
//   db.query(
//     'SELECT * FROM users WHERE employee_id = ?',
//     [employeeId],
//     callback
//   );
// };

// exports.createUser = (user, callback) => {
//   db.query(
//     'INSERT INTO users (name, employee_id, role, password) VALUES (?, ?, ?, ?)',
//     [user.name, user.employeeId, user.role, user.password],
//     callback
//   );
// };

const db = require('../config/db');

exports.findByEmployeeId = async (employeeId) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId]
  );
  return rows;
};

exports.createUser = async ({ name, employeeId, role, password }) => {
  const [result] = await db.query(
    'INSERT INTO users (name, employee_id, role, password) VALUES (?, ?, ?, ?)',
    [name, employeeId, role, password]
  );
  return result;
};

