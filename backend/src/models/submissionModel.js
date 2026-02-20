// const db = require("../config/db");

// exports.createSubmission = async (data) => {
//   const [result] = await db.query(
//     `INSERT INTO report_submissions (template_id, employee_id, inspection_date, shift, status, created_at)
//      VALUES (?, ?, ?, ?, ?, NOW())`,
//     [
//       data.template_id,
//       data.employee_id,
//       data.inspection_date || null,
//       data.shift || null,
//       data.status || "draft",
//     ],
//   );
//   return result;
// };

// exports.addSubmissionValue = async (submissionId, fieldId, value) => {
//   const [result] = await db.query(
//     `INSERT INTO submission_values (submission_id, field_id, actual_value)
//      VALUES (?, ?, ?)`,
//     [submissionId, fieldId, value],
//   );
//   return result;
// };

// exports.getById = async (id) => {
//   const [rows] = await db.query(
//     `SELECT * FROM report_submissions WHERE id = ?`,
//     [id],
//   );
//   return rows[0];
// };

// exports.getValues = async (submissionId) => {
//   const [rows] = await db.query(
//     `SELECT sv.*, tf.label, tf.specification, tf.unit
//      FROM submission_values sv
//      JOIN template_fields tf ON tf.id = sv.field_id
//      WHERE sv.submission_id = ?
//      ORDER BY tf.position ASC`,
//     [submissionId],
//   );
//   return rows;
// };

// exports.updateInspectorReview = async (
//   submissionId,
//   inspectorId,
//   observation,
//   remarks,
// ) => {
//   const [result] = await db.query(
//     `UPDATE report_submissions SET inspector_id = ?, inspector_observation = ?, inspector_remarks = ?, inspector_reviewed_at = NOW(), status = 'inspector_reviewed' WHERE id = ?`,
//     [inspectorId, observation || null, remarks || null, submissionId],
//   );
//   return result;
// };

// exports.updateManagerReview = async (
//   submissionId,
//   managerId,
//   remarks,
//   approved,
// ) => {
//   const status = approved ? "manager_approved" : "rejected";
//   const [result] = await db.query(
//     `UPDATE report_submissions SET manager_id = ?, manager_remarks = ?, manager_approved_at = NOW(), status = ? WHERE id = ?`,
//     [managerId, remarks || null, status, submissionId],
//   );
//   return result;
// };

// exports.listAll = async () => {
//   const [rows] = await db.query(
//     `SELECT
//   rs.id,
//   rs.template_id,
//   rs.employee_id AS submitted_by,
//   rs.status,
//   rs.created_at,
//   u.name AS submitted_by_name,
//   COALESCE(rt.part_description, rt.doc_no, rt.part_no) AS template_label
// FROM report_submissions rs
// LEFT JOIN users u ON u.id = rs.employee_id
// LEFT JOIN report_templates rt ON rt.id = rs.template_id
// ORDER BY rs.created_at DESC;
// `,
//   );
//   return rows;
// };

// module.exports = exports;


const db = require("../config/db");

exports.createSubmission = async (data) => {
  const [result] = await db.query(
    `INSERT INTO report_submissions (template_id, employee_id, inspection_date, shift, status, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      data.template_id,
      data.employee_id,
      data.inspection_date || null,
      data.shift || null,
      data.status || "draft",
    ],
  );
  return result;
};

exports.addSubmissionValue = async (submissionId, fieldId, value) => {
  const [result] = await db.query(
    `INSERT INTO submission_values (submission_id, field_id, actual_value)
     VALUES (?, ?, ?)`,
    [submissionId, fieldId, value],
  );
  return result;
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
      rs.*,
      emp.name AS employee_name,
      insp.name AS inspector_name,
      mgr.name AS manager_name
    FROM report_submissions rs
    LEFT JOIN users emp ON emp.id = rs.employee_id
    LEFT JOIN users insp ON insp.id = rs.inspector_id
    LEFT JOIN users mgr ON mgr.id = rs.manager_id
    WHERE rs.id = ?`,
    [id],
  );
  return rows[0];
};

exports.getValues = async (submissionId) => {
  const [rows] = await db.query(
    `SELECT sv.*, tf.label, tf.specification, tf.unit
     FROM submission_values sv
     JOIN template_fields tf ON tf.id = sv.field_id
     WHERE sv.submission_id = ?
     ORDER BY tf.position ASC`,
    [submissionId],
  );
  return rows;
};

exports.updateInspectorReview = async (
  submissionId,
  inspectorId,
  observation,
  remarks,
) => {
  const [result] = await db.query(
    `UPDATE report_submissions SET inspector_id = ?, inspector_observation = ?, inspector_remarks = ?, inspector_reviewed_at = NOW(), status = 'inspector_reviewed' WHERE id = ?`,
    [inspectorId, observation || null, remarks || null, submissionId],
  );
  return result;
};

exports.updateManagerReview = async (
  submissionId,
  managerId,
  remarks,
  approved,
) => {
  const status = approved ? "manager_approved" : "rejected";
  const [result] = await db.query(
    `UPDATE report_submissions SET manager_id = ?, manager_remarks = ?, manager_approved_at = NOW(), status = ? WHERE id = ?`,
    [managerId, remarks || null, status, submissionId],
  );
  return result;
};

exports.listAll = async () => {
  const [rows] = await db.query(
    `SELECT
  rs.id,
  rs.template_id,
  rs.employee_id AS submitted_by,
  rs.inspector_id,
  rs.manager_id,
  rs.status,
  rs.created_at,
  u.name AS submitted_by_name,
  insp.name AS inspector_name,
  mgr.name AS manager_name,
  COALESCE(rt.part_description, rt.doc_no, rt.part_no) AS template_label
FROM report_submissions rs
LEFT JOIN users u ON u.id = rs.employee_id
LEFT JOIN users insp ON insp.id = rs.inspector_id
LEFT JOIN users mgr ON mgr.id = rs.manager_id
LEFT JOIN report_templates rt ON rt.id = rs.template_id
ORDER BY rs.created_at DESC;
`,
  );
  return rows;
};

exports.listForExport = async (filters = {}, user = null) => {
  const where = [];
  const params = [];

  if (filters.submissionId) {
    where.push("rs.id = ?");
    params.push(Number(filters.submissionId));
  }

  if (filters.status && filters.status !== "all") {
    where.push("rs.status = ?");
    params.push(filters.status);
  }

  if (filters.fromDate) {
    where.push("DATE(rs.created_at) >= ?");
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    where.push("DATE(rs.created_at) <= ?");
    params.push(filters.toDate);
  }

  if (filters.reportType && filters.reportType !== "all") {
    where.push(
      "(rc.name = ? OR COALESCE(rt.part_description, rt.doc_no, rt.part_no) = ?)"
    );
    params.push(filters.reportType, filters.reportType);
  }

  if (user && user.role === "machine_operator") {
    where.push("rs.employee_id = ?");
    params.push(user.id);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `SELECT
  rs.id,
  rs.template_id,
  rs.status,
  rs.inspection_date,
  rs.shift,
  rs.created_at,
  u.name AS submitted_by_name,
  insp.name AS inspector_name,
  mgr.name AS manager_name,
  rc.name AS category_name,
  rt.doc_no,
  rt.part_no,
  rt.part_description,
  COALESCE(rt.part_description, rt.doc_no, rt.part_no) AS template_label,
  sv.actual_values
FROM report_submissions rs
LEFT JOIN users u ON u.id = rs.employee_id
LEFT JOIN users insp ON insp.id = rs.inspector_id
LEFT JOIN users mgr ON mgr.id = rs.manager_id
LEFT JOIN report_templates rt ON rt.id = rs.template_id
LEFT JOIN report_categories rc ON rc.id = rt.category_id
LEFT JOIN (
  SELECT submission_id, GROUP_CONCAT(actual_value ORDER BY id SEPARATOR ' | ') AS actual_values
  FROM submission_values
  GROUP BY submission_id
) sv ON sv.submission_id = rs.id
${whereClause}
ORDER BY rs.created_at DESC`,
    params
  );

  return rows;
};

module.exports = exports;
