const express = require('express');
const { getActiveTemplates } = require('../controllers/reportTemplate.controller');

const router = express.Router();

// Users can see active templates
router.get('/', getActiveTemplates);

module.exports = router;
