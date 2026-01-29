const express = require('express');
const {createTemplate,getActiveTemplates} = require('../controllers/reportTemplate.controller')


const router = express.Router();

// /api/admin/report-templates
router.post('/report-templates',createTemplate)
router.get('/report-templates', getActiveTemplates);

module.exports = router;