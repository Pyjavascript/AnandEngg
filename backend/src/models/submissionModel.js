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

let managerObservationSupportPromise = null;
let reviewerAssignmentSupportPromise = null;

async function ensureManagerObservationSupport() {
  if (managerObservationSupportPromise) return managerObservationSupportPromise;

  managerObservationSupportPromise = (async () => {
    const checkSql = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'report_submissions'
        AND COLUMN_NAME = 'manager_observation'
    `;

    const [existing] = await db.query(checkSql);
    let hasColumn = Array.isArray(existing) && existing.length > 0;
    if (hasColumn) return true;

    try {
      await db.query(
        `ALTER TABLE report_submissions
         ADD COLUMN manager_observation TEXT NULL AFTER manager_id`
      );
      return true;
    } catch (err) {
      const msg = String(err?.message || "");
      if (!/Duplicate column name/i.test(msg)) {
        console.log(
          "Could not add manager_observation column. Continuing without it:",
          msg
        );
      }
      const [recheck] = await db.query(checkSql);
      hasColumn = Array.isArray(recheck) && recheck.length > 0;
      return hasColumn;
    }
  })();

  return managerObservationSupportPromise;
}

async function ensureReviewerAssignmentSupport() {
  if (reviewerAssignmentSupportPromise) return reviewerAssignmentSupportPromise;

  reviewerAssignmentSupportPromise = (async () => {
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'report_submissions'
        AND COLUMN_NAME IN ('assigned_inspector_id', 'assigned_manager_id')
    `);

    const existing = new Set((columns || []).map(col => col.COLUMN_NAME));

    if (!existing.has('assigned_inspector_id')) {
      try {
        await db.query(
          `ALTER TABLE report_submissions
           ADD COLUMN assigned_inspector_id INT NULL AFTER employee_id`
        );
      } catch (err) {
        if (!/Duplicate column name/i.test(String(err?.message || ''))) {
          throw err;
        }
      }
    }

    if (!existing.has('assigned_manager_id')) {
      try {
        await db.query(
          `ALTER TABLE report_submissions
           ADD COLUMN assigned_manager_id INT NULL AFTER assigned_inspector_id`
        );
      } catch (err) {
        if (!/Duplicate column name/i.test(String(err?.message || ''))) {
          throw err;
        }
      }
    }

    return true;
  })();

  return reviewerAssignmentSupportPromise;
}

exports.createSubmission = async (data) => {
  await ensureReviewerAssignmentSupport();
  const [result] = await db.query(
    `INSERT INTO report_submissions (
      template_id,
      employee_id,
      assigned_inspector_id,
      assigned_manager_id,
      inspection_date,
      shift,
      status,
      created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.template_id,
      data.employee_id,
      data.assigned_inspector_id || null,
      data.assigned_manager_id || null,
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
  await ensureReviewerAssignmentSupport();
  const [rows] = await db.query(
    `SELECT 
      rs.*,
      emp.name AS employee_name,
      insp.name AS inspector_name,
      mgr.name AS manager_name,
      assigned_insp.name AS assigned_inspector_name,
      assigned_mgr.name AS assigned_manager_name,
      rt.created_at AS template_created_at
    FROM report_submissions rs
    LEFT JOIN users emp ON emp.id = rs.employee_id
    LEFT JOIN users insp ON insp.id = rs.inspector_id
    LEFT JOIN users mgr ON mgr.id = rs.manager_id
    LEFT JOIN users assigned_insp ON assigned_insp.id = rs.assigned_inspector_id
    LEFT JOIN users assigned_mgr ON assigned_mgr.id = rs.assigned_manager_id
    LEFT JOIN report_templates rt ON rt.id = rs.template_id
    WHERE rs.id = ?`,
    [id],
  );
  return rows[0];
};

exports.deleteById = async (id) => {
  const [result] = await db.query(
    `DELETE FROM report_submissions WHERE id = ?`,
    [id],
  );
  return result;
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
  nextStatus = "inspector_reviewed",
) => {
  const [result] = await db.query(
    `UPDATE report_submissions
     SET inspector_id = ?,
         inspector_observation = ?,
         inspector_remarks = ?,
         inspector_reviewed_at = NOW(),
         status = ?
     WHERE id = ?`,
    [inspectorId, observation || null, remarks || null, nextStatus, submissionId],
  );
  return result;
};

exports.updateManagerReview = async (
  submissionId,
  managerId,
  observation,
  remarks,
  approved,
) => {
  const hasManagerObservation = await ensureManagerObservationSupport();
  const status = approved ? "manager_approved" : "rejected";

  let result;
  if (hasManagerObservation) {
    [result] = await db.query(
      `UPDATE report_submissions
       SET manager_id = ?,
           manager_observation = ?,
           manager_remarks = ?,
           manager_approved_at = NOW(),
           status = ?
       WHERE id = ?`,
      [managerId, observation || null, remarks || null, status, submissionId],
    );
  } else {
    [result] = await db.query(
      `UPDATE report_submissions
       SET manager_id = ?,
           manager_remarks = ?,
           manager_approved_at = NOW(),
           status = ?
       WHERE id = ?`,
      [managerId, remarks || null, status, submissionId],
    );
  }
  return result;
};

exports.listAll = async () => {
  await ensureReviewerAssignmentSupport();
  const [rows] = await db.query(
    `SELECT
  rs.id,
  rs.template_id,
  rs.employee_id AS submitted_by,
  rs.assigned_inspector_id,
  rs.assigned_manager_id,
  rs.inspector_id,
  rs.manager_id,
  rs.status,
  rs.created_at,
  u.name AS submitted_by_name,
  insp.name AS inspector_name,
  mgr.name AS manager_name,
  assigned_insp.name AS assigned_inspector_name,
  assigned_mgr.name AS assigned_manager_name,
  COALESCE(rt.part_description, rt.doc_no, rt.part_no) AS template_label
FROM report_submissions rs
LEFT JOIN users u ON u.id = rs.employee_id
LEFT JOIN users insp ON insp.id = rs.inspector_id
LEFT JOIN users mgr ON mgr.id = rs.manager_id
LEFT JOIN users assigned_insp ON assigned_insp.id = rs.assigned_inspector_id
LEFT JOIN users assigned_mgr ON assigned_mgr.id = rs.assigned_manager_id
LEFT JOIN report_templates rt ON rt.id = rs.template_id
ORDER BY rs.created_at DESC;
`,
  );
  return rows;
};

exports.listForExport = async (filters = {}, user = null) => {
  await ensureReviewerAssignmentSupport();
  const hasManagerObservation = await ensureManagerObservationSupport();
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
  } else if (user && user.role === "quality_inspector") {
    where.push("(rs.assigned_inspector_id = ? OR rs.inspector_id = ?)");
    params.push(user.id, user.id);
  } else if (user && user.role === "quality_manager") {
    where.push("(rs.assigned_manager_id = ? OR rs.manager_id = ?)");
    params.push(user.id, user.id);
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
  rs.inspector_observation,
  rs.inspector_remarks,
  ${
    hasManagerObservation
      ? "rs.manager_observation"
      : "NULL AS manager_observation"
  },
  rs.manager_remarks,
  u.name AS submitted_by_name,
  insp.name AS inspector_name,
  mgr.name AS manager_name,
  assigned_insp.name AS assigned_inspector_name,
  assigned_mgr.name AS assigned_manager_name,
  rc.name AS category_name,
  rt.customer,
  rt.doc_no,
  rt.rev_no,
  rt.part_no,
  rt.part_description,
  rt.diagram_url,
  rt.created_at AS template_created_at,
  COALESCE(rt.part_description, rt.doc_no, rt.part_no) AS template_label,
  sv.actual_values
FROM report_submissions rs
LEFT JOIN users u ON u.id = rs.employee_id
LEFT JOIN users insp ON insp.id = rs.inspector_id
LEFT JOIN users mgr ON mgr.id = rs.manager_id
LEFT JOIN users assigned_insp ON assigned_insp.id = rs.assigned_inspector_id
LEFT JOIN users assigned_mgr ON assigned_mgr.id = rs.assigned_manager_id
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

exports.getSubmissionDetailForExport = async (submissionId, user = null) => {
  await ensureReviewerAssignmentSupport();
  const hasManagerObservation = await ensureManagerObservationSupport();
  const params = [submissionId];
  let ownershipSql = "";
  if (user && user.role === "machine_operator") {
    ownershipSql = " AND rs.employee_id = ?";
    params.push(user.id);
  } else if (user && user.role === "quality_inspector") {
    ownershipSql = " AND (rs.assigned_inspector_id = ? OR rs.inspector_id = ?)";
    params.push(user.id, user.id);
  } else if (user && user.role === "quality_manager") {
    ownershipSql = " AND (rs.assigned_manager_id = ? OR rs.manager_id = ?)";
    params.push(user.id, user.id);
  }

  const [subs] = await db.query(
    `SELECT
      rs.id,
      rs.template_id,
      rs.employee_id,
      rs.status,
      rs.inspection_date,
      rs.shift,
      rs.created_at,
      rs.inspector_observation,
      rs.inspector_remarks,
      ${
        hasManagerObservation
          ? "rs.manager_observation"
          : "NULL AS manager_observation"
      },
      rs.manager_remarks,
      rs.inspector_reviewed_at,
      rs.manager_approved_at,
      u.name AS submitted_by_name,
      insp.name AS inspector_name,
      mgr.name AS manager_name,
      assigned_insp.name AS assigned_inspector_name,
      assigned_mgr.name AS assigned_manager_name,
      rc.name AS category_name,
      rt.customer,
      rt.doc_no,
      rt.rev_no,
      rt.part_no,
      rt.part_description,
      rt.diagram_url,
      rt.created_at AS template_created_at
    FROM report_submissions rs
    LEFT JOIN users u ON u.id = rs.employee_id
    LEFT JOIN users insp ON insp.id = rs.inspector_id
    LEFT JOIN users mgr ON mgr.id = rs.manager_id
    LEFT JOIN users assigned_insp ON assigned_insp.id = rs.assigned_inspector_id
    LEFT JOIN users assigned_mgr ON assigned_mgr.id = rs.assigned_manager_id
    LEFT JOIN report_templates rt ON rt.id = rs.template_id
    LEFT JOIN report_categories rc ON rc.id = rt.category_id
    WHERE rs.id = ? ${ownershipSql}
    LIMIT 1`,
    params
  );

  const submission = subs[0];
  if (!submission) return null;

  const [valueRows] = await db.query(
    `SELECT
      tf.id AS field_id,
      tf.position,
      tf.label,
      tf.specification,
      tf.unit,
      sv.actual_value
    FROM submission_values sv
    JOIN template_fields tf ON tf.id = sv.field_id
    WHERE sv.submission_id = ?
    ORDER BY tf.position ASC, sv.id ASC`,
    [submissionId]
  );

  const grouped = new Map();
  valueRows.forEach((row) => {
    const key = String(row.field_id);
    if (!grouped.has(key)) {
      grouped.set(key, {
        field_id: row.field_id,
        position: row.position,
        label: row.label,
        specification: row.specification,
        unit: row.unit,
        actual_values: [],
      });
    }
    grouped.get(key).actual_values.push(row.actual_value);
  });

  submission.values = Array.from(grouped.values()).sort(
    (a, b) => Number(a.position || 0) - Number(b.position || 0)
  );
  return submission;
};

module.exports = exports;
