const { v4: uuid } = require('uuid');
const db = require('../config/db');

// ADMIN: create part under a report type
exports.createPart = async (req, res) => {
  const { templateId } = req.params;
  try {
    const {
    //   template_id,
      part_no,
      description,
      doc_no,
      rev_no,
      diagram_url,
      dimension_schema
    } = req.body;

    if (!templateId || !part_no || !dimension_schema) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const id = uuid();

    await db.query(
      `INSERT INTO report_parts
       (id, template_id, part_no, description, doc_no, rev_no, diagram_url, dimension_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        templateId,
        part_no,
        description,
        doc_no,
        rev_no,
        diagram_url,
        JSON.stringify(dimension_schema)
      ]
    );

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN / USER: get parts for a report type
exports.getPartsByTemplate = async (req, res) => {
  try {
    // const { template_id } = req.query;
    const { templateId } = req.params;

    if (!templateId) {
      return res.status(400).json({ message: 'template_id required' });
    }

    const [rows] = await db.query(
      `SELECT id, part_no, description, doc_no, rev_no, diagram_url, dimension_schema
       FROM report_parts
       WHERE template_id = ?`,
      [templateId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load parts' });
  }
};
