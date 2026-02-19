// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const authMiddleware = require('../middleware/auth');
// const auth = require('../middleware/auth');

// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.put('/profile',authMiddleware,authController.updateProfile)
// router.put(
//   '/change-password',
//   authMiddleware,
//   authController.changePassword
// );

// router.get('/me', auth, (req, res) => {
//   res.json({ user: req.user });
// });
// // /api/users/profile

// module.exports = router;


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile',authMiddleware,authController.updateProfile)
router.put(
  '/change-password',
  authMiddleware,
  authController.changePassword
);

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});
// /api/users/profile

module.exports = router;
