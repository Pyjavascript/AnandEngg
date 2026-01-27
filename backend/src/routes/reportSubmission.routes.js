const express = require('express');
const { submitReport } = require('../controllers/reportSubmission.controller');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/reports/submit
router.post('/submit', requireAuth, submitReport);

module.exports = router;
