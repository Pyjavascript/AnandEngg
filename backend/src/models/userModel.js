const db = require('../config/db');

exports.findByEmployeeId = (employeeId, callback) => {
  db.query(
    'SELECT * FROM users WHERE employee_id = ?',
    [employeeId],
    callback
  );
};

exports.createUser = (user, callback) => {
  db.query(
    'INSERT INTO users (name, employee_id, role, password) VALUES (?, ?, ?, ?)',
    [user.name, user.employeeId, user.role, user.password],
    callback
  );
};
