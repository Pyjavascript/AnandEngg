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
