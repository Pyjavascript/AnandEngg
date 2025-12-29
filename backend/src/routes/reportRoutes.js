const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const ReportController = require('../controllers/reportController')

router.post('/create',auth,ReportController.CreateReport)
router.get('/my-reports',auth,ReportController.GetReport)

module.exports = router;
