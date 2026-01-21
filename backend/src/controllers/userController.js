const User = require('../models/userModel');

exports.getUserByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const users = await User.findByEmployeeId(employeeId);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    delete user.password;

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
