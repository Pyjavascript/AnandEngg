const db = require('../config/db');

exports.approveByInspector = async (id) => {
  await db.query(
    `UPDATE report_submissions 
     SET status = 'approved' 
     WHERE id = ?`,
    [id]
  );
};

exports.reject = async (id) => {
  await db.query(
    `UPDATE report_submissions 
     SET status = 'rejected' 
     WHERE id = ?`,
    [id]
  );
};

exports.findById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM report_submissions WHERE id = ?`,
    [id]
  );
  return rows[0];
};
