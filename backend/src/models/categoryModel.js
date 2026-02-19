// const db = require('../config/db');

// exports.create = async (name) => {
//   const [result] = await db.query(
//     'INSERT INTO report_categories (name) VALUES (?)',
//     [name]
//   );
//   return result;
// };

// exports.getAll = async () => {
//   const [rows] = await db.query(
//     'SELECT * FROM report_categories ORDER BY name ASC'
//   );
//   return rows;
// };

// exports.delete = async (id) => {
//   const [result] = await db.query(
//     'DELETE FROM report_categories WHERE id = ?',
//     [id]
//   );
//   return result;
// };

const db = require('../config/db');

exports.create = async (name) => {
  const [result] = await db.query(
    'INSERT INTO report_categories (name) VALUES (?)',
    [name]
  );
  return result;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    'SELECT * FROM report_categories ORDER BY name ASC'
  );
  return rows;
};

exports.delete = async (id) => {
  const [result] = await db.query(
    'DELETE FROM report_categories WHERE id = ?',
    [id]
  );
  return result;
};

