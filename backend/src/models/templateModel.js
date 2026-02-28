// const db = require('../config/db');

// exports.create = async (data) => {
//   const [result] = await db.query(
//     `INSERT INTO report_templates (category_id, doc_no, customer, part_no, part_description, rev_no, created_at)
//      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
//     [data.category_id, data.doc_no, data.customer, data.part_no, data.part_description, data.rev_no]
//   );
//   return result;
// };

// exports.updateDiagram = async (templateId, url) => {
//   const [result] = await db.query(
//     `UPDATE report_templates SET diagram_url = ? WHERE id = ?`,
//     [url, templateId]
//   );
//   return result;
// };

// exports.getById = async (id) => {
//   const [rows] = await db.query(
//     `SELECT * FROM report_templates WHERE id = ?`,
//     [id]
//   );
//   return rows[0];
// };

// exports.listByCategory = async (categoryId) => {
//   const [rows] = await db.query(
//     `SELECT * FROM report_templates WHERE category_id = ? ORDER BY created_at DESC`,
//     [categoryId]
//   );
//   return rows;
// };

// exports.createField = async (templateId, field) => {
//   const [result] = await db.query(
//     `INSERT INTO template_fields (template_id, label, specification, unit, position, created_at)
//      VALUES (?, ?, ?, ?, ?, NOW())`,
//     [templateId, field.label, field.specification || null, field.unit || 'mm', field.position || null]
//   );
//   return result;
// };

// exports.getFields = async (templateId) => {
//   const [rows] = await db.query(
//     `SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC`,
//     [templateId]
//   );
//   return rows;
// };

// exports.getAllTemplates = async () => {
//   const [rows] = await db.query(
//     `SELECT * FROM report_templates WHERE status = 'active' ORDER BY created_at DESC`
//   );
//   return rows;
// };

// exports.getPartsForTemplate = async (templateId) => {
//   const [rows] = await db.query(
//     `SELECT * FROM report_parts WHERE template_id = ? ORDER BY created_at DESC`,
//     [templateId]
//   );
//   return rows;
// };

// exports.getAllTemplatesWithDimensions = async () => {
//   const [rows] = await db.query(
//     `SELECT * FROM report_templates ORDER BY created_at DESC`
//   );
//   return rows;
// };

// module.exports = exports;


const db = require('../config/db');

exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO report_templates (category_id, doc_no, customer, part_no, part_description, rev_no, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [data.category_id, data.doc_no, data.customer, data.part_no, data.part_description, data.rev_no]
  );
  return result;
};

exports.update = async (templateId, data) => {
  const [result] = await db.query(
    `UPDATE report_templates
     SET category_id = ?, doc_no = ?, customer = ?, part_no = ?, part_description = ?, rev_no = ?
     WHERE id = ?`,
    [
      data.category_id,
      data.doc_no || null,
      data.customer || null,
      data.part_no || null,
      data.part_description || null,
      data.rev_no || null,
      templateId,
    ],
  );
  return result;
};

exports.updateDiagram = async (templateId, url) => {
  const [result] = await db.query(
    `UPDATE report_templates SET diagram_url = ? WHERE id = ?`,
    [url, templateId]
  );
  return result;
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM report_templates WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.listByCategory = async (categoryId) => {
  const [rows] = await db.query(
    `SELECT * FROM report_templates WHERE category_id = ? ORDER BY created_at DESC`,
    [categoryId]
  );
  return rows;
};

exports.createField = async (templateId, field) => {
  const [result] = await db.query(
    `INSERT INTO template_fields (template_id, label, specification, unit, position, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [templateId, field.label, field.specification || null, field.unit || 'mm', field.position || null]
  );
  return result;
};

exports.updateField = async (templateId, fieldId, field) => {
  const [result] = await db.query(
    `UPDATE template_fields
     SET label = ?, specification = ?, unit = ?, position = ?
     WHERE id = ? AND template_id = ?`,
    [
      field.label,
      field.specification || null,
      field.unit || 'mm',
      field.position || null,
      fieldId,
      templateId,
    ],
  );
  return result;
};

exports.getFields = async (templateId) => {
  const [rows] = await db.query(
    `SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC`,
    [templateId]
  );
  return rows;
};

exports.getAllTemplates = async () => {
  const [rows] = await db.query(
    `SELECT * FROM report_templates WHERE status = 'active' ORDER BY created_at DESC`
  );
  return rows;
};

exports.getPartsForTemplate = async (templateId) => {
  const [rows] = await db.query(
    `SELECT * FROM report_parts WHERE template_id = ? ORDER BY created_at DESC`,
    [templateId]
  );
  return rows;
};

exports.getAllTemplatesWithDimensions = async () => {
  const [rows] = await db.query(
    `SELECT 
      rt.*,
      rc.name AS category_name
    FROM report_templates rt
    LEFT JOIN report_categories rc ON rc.id = rt.category_id
    ORDER BY rt.created_at DESC`
  );
  return rows;
};

module.exports = exports;
