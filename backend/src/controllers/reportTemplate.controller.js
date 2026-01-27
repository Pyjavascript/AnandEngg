const { v4: uuid } = require('uuid');
const db = require('../config/db');

exports.createTemplate = async (req, res) => {
  try {
    const { name, code, template_schema } = req.body;

    if (!name || !code || !template_schema) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const id = uuid();

    await db.query(
      `INSERT INTO report_templates (id, name, code, template_schema)
       VALUES (?, ?, ?, ?)`,
      [id, name, code, JSON.stringify(template_schema)]
    );

    res.status(201).json({
      success: true,
      id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
