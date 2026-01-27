const Report = require("../models/reportModel");

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

    res
      .status(201)
      .json({ message: "Report created", reportId: result.insertId });
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
    res.json({ message: "Approved by Inspector → sent to Manager" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.ApproveByManager = async (req, res) => {
  try {
    await Report.approveByManager(req.params.id);
    res.json({ message: "Approved by Manager → Final Approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.RejectReport = async (req, res) => {
  try {
    await Report.rejectReport(req.params.id);
    res.json({ message: "Report rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const db = require("../config/db");

// ✅ Create a new report
exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO reports (user_id, title, part_no, report_type, report_data, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.title,
      data.part_no,
      data.report_type,
      JSON.stringify(data.report_data),
      "pending", // default status
    ],
  );
  return result;
};

// ✅ Fetch reports based on user role
exports.findByRole = async (role, userId) => {
  let query = "";
  let params = [];

  // if (role === 'operator') {
  //   query = `SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC`;
  //   params = [userId];
  // } else if (role === 'inspector') {
  //   query = `SELECT * FROM reports WHERE status IN ('pending', 'inspector_approved') ORDER BY created_at DESC`;
  // } else if (role === 'manager') {
  //   query = `SELECT * FROM reports WHERE status IN ('inspector_approved', 'manager_approved') ORDER BY created_at DESC`;
  // } else {
  //   query = `SELECT * FROM reports ORDER BY created_at DESC`;
  // }
  if (role === "machine_operator") {
    query = `SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC`;
    params = [userId];
  } else if (role === "quality_inspector") {
    query = `SELECT * FROM reports 
           WHERE status IN ('pending', 'inspector_approved') 
           ORDER BY created_at DESC`;
  } else if (role === "quality_manager") {
    query = `SELECT * FROM reports 
           WHERE status IN ('inspector_approved', 'approved') 
           ORDER BY created_at DESC`;
  } else if (role === "admin") {
    query = `SELECT * FROM reports ORDER BY created_at DESC`;
  }

  const [rows] = await db.query(query, params);
  return rows;
};

// ✅ Approve by Inspector → changes status to “inspector_approved”
exports.approveByInspector = async (reportId) => {
  await db.query(
    `UPDATE reports SET status = 'inspector_approved' WHERE id = ?`,
    [reportId],
  );
};

// ✅ Approve by Manager → changes status to “approved”
exports.approveByManager = async (reportId) => {
  await db.query(`UPDATE reports SET status = 'approved' WHERE id = ?`, [
    reportId,
  ]);
};

// ✅ Reject a report
exports.rejectReport = async (reportId) => {
  await db.query(`UPDATE reports SET status = 'rejected' WHERE id = ?`, [
    reportId,
  ]);
};

exports.findById = async (reportId) => {
  const [rows] = await db.query(`SELECT * FROM reports WHERE id = ?`, [
    reportId,
  ]);
  return rows[0];
};
