const { v4: uuid } = require('uuid');
const db = require('../config/db');
const validateAgainstTemplate = require('../services/reportValidator');

exports.submitReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { template_id, data } = req.body;

    if (!template_id || !data) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // 1️⃣ Load template
    const [rows] = await db.query(
      `SELECT template_schema, version 
       FROM report_templates 
       WHERE id = ? AND status = 'active'`,
      [template_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = rows[0];

    // 2️⃣ Validate
    const error = validateAgainstTemplate(template.template_schema, data);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // 3️⃣ Store submission
    const id = uuid();

    await db.query(
      `INSERT INTO report_submissions
       (id, template_id, template_version, submitted_by, data)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        template_id,
        template.version,
        userId,
        JSON.stringify(data),
      ]
    );

    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
