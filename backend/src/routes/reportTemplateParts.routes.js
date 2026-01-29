const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const {
  createPart,
  getPartsByTemplate
} = require('../controllers/reportPart.controller');

// USER: get parts under a template
router.get('/:templateId/parts', requireAuth, getPartsByTemplate);

// ADMIN: create part under a template
router.post('/:templateId/parts', requireAuth, requireAdmin, createPart);

module.exports = router;
