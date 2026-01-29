const express = require('express');
const router = express.Router();

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const {
  createPart,
  getPartsByTemplate
} = require('../controllers/reportPart.controller');

// Admin only
router.post('/parts', requireAuth, requireAdmin, createPart);

// Admin + User
router.get('/parts', requireAuth, getPartsByTemplate);

module.exports = router;
