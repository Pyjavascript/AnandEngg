// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const userController = require('../controllers/userController');

// router.get('/:employeeId', auth, userController.getUserByEmployeeId);

// module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/:employeeId', auth, userController.getUserByEmployeeId);

module.exports = router;
