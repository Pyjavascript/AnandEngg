const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
  const { name, employeeId, role, password, confirmPassword } = req.body;

  if (!name || !employeeId || !role || !password || !confirmPassword)
    return res.status(400).json({ message: 'All fields required' });

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match' });

  User.findByEmployeeId(employeeId, async (err, results) => {
    if (results.length > 0)
      return res.status(400).json({ message: 'Employee already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    User.createUser(
      { name, employeeId, role, password: hashedPassword },
      (err) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
};

exports.login = (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password)
    return res.status(400).json({ message: 'All fields required' });

  User.findByEmployeeId(employeeId, async (err, results) => {
    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  });
};
