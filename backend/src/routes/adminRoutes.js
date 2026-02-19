// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const requireAdmin = require('../middleware/requireAdmin');
// const adminController = require('../controllers/adminController');

// router.use(auth, requireAdmin);

// router.get('/users', adminController.getAllUsers);
// router.delete('/users/:id', adminController.deleteUser);
// router.put('/users/:id/role', adminController.updateRole);
// router.put('/users/:id/status', adminController.updateStatus);
// router.get('/roles', adminController.getAllRoles);
// // router.get('/getStats',adminController.getStats)


// module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');

router.use(auth, requireAdmin);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/role', adminController.updateRole);
router.put('/users/:id/status', adminController.updateStatus);
router.get('/roles', adminController.getAllRoles);
router.get('/getStats',adminController.getStats)


module.exports = router;
