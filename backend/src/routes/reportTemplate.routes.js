const express = require('express');
const {createTemplate} = require('../controllers/reportTemplate.controller')


const router = express.Router();

// /api/admin/report-templates
router.post('/report-templates',createTemplate)

module.exports = router;