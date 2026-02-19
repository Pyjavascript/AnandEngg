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
    `SELECT * FROM report_submissions WHERE id = ?`,
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
  rs.status,
  rs.created_at,
  u.name AS submitted_by_name,
  COALESCE(rt.part_description, rt.doc_no, rt.part_no) AS template_label
FROM report_submissions rs
LEFT JOIN users u ON u.id = rs.employee_id
LEFT JOIN report_templates rt ON rt.id = rs.template_id
ORDER BY rs.created_at DESC;
`,
  );
  return rows;
};

module.exports = exports;
