const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Public: for registration role selector (admin excluded by can_self_register flag).
router.get('/', roleController.listPublicRoles);

// Admin-only role management.
router.get('/admin', auth, requireAdmin, roleController.listAdminRoles);
router.post('/', auth, requireAdmin, roleController.createRole);
router.delete('/:id', auth, requireAdmin, roleController.deleteRole);

module.exports = router;

