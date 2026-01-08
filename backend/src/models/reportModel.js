// const db = require('../config/db');

// exports.create = async (data) => {
//   const [result] = await db.query(
//     `INSERT INTO reports (user_id, title, part_no, report_type, report_data)
//      VALUES (?, ?, ?, ?, ?)`,
//     [
//       data.user_id,
//       data.title,
//       data.part_no,
//       data.report_type,
//       JSON.stringify(data.report_data)
//     ]
//   );
//   return result;
// };

// exports.findByUser = async (userId) => {
//   const [rows] = await db.query(
//     `SELECT id, title, part_no, status, created_at
//      FROM reports
//      WHERE user_id = ?
//      ORDER BY created_at DESC`,
//     [userId]
//   );
//   return rows;
// };

const Report = require('../models/reportModel');

exports.CreateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Report.create({
      user_id: userId,
      title: req.body.partDescription,
      part_no: req.body.partNumber,
      report_type: req.body.reportType,
      report_data: req.body,
    });

    res.status(201).json({ message: 'Report created', reportId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.GetReports = async (req, res) => {
  try {
    const { role, id } = req.user;
    const reports = await Report.findByRole(role, id);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ApproveByInspector = async (req, res) => {
  try {
    await Report.approveByInspector(req.params.id);
    res.json({ message: 'Approved by Inspector → sent to Manager' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ApproveByManager = async (req, res) => {
  try {
    await Report.approveByManager(req.params.id);
    res.json({ message: 'Approved by Manager → Final Approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.RejectReport = async (req, res) => {
  try {
    await Report.rejectReport(req.params.id);
    res.json({ message: 'Report rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
