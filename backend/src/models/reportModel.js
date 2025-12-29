const db = require('../config/db');

exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO reports (user_id, title, part_no, report_type, report_data)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.title,
      data.part_no,
      data.report_type,
      JSON.stringify(data.report_data)
    ]
  );
  return result;
};

exports.findByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, title, part_no, status, created_at
     FROM reports
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

