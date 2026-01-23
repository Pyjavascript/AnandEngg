const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [roles] = await db.query(
      'SELECT id, name, display_name FROM roles'
    );
    res.json(roles);
  } catch (err) {
    console.error('ROLES API ERROR:', err);
    res.status(500).json({ message: 'Failed to load roles' });
  }
});

module.exports = router;
