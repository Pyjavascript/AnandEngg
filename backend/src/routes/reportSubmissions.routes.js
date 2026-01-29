const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const {
  submitReport,
  approveByInspector,
  rejectSubmission,
  getAllSubmissions
} = require('../controllers/reportSubmission.controller');

router.post('/submit', auth, submitReport);

router.put(
  '/:id/approve/inspector',
  auth,
  requireRole(['quality_inspector']),
  approveByInspector
);

router.put(
  '/:id/reject',
  auth,
  rejectSubmission
);
router.get(
  '/',
  auth,
  requireRole(['admin', 'manager']),
  getAllSubmissions
);

module.exports = router;
