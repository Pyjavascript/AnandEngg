// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
// const requireAdmin = require('../middleware/requireAdmin');


router.post('/categories',auth, categoryController.addCategory);
router.get('/categories',auth, categoryController.getCategories);

module.exports = router;
