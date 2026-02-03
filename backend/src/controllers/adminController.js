const User = require('../models/userModel');
const db = require('../config/db')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.id == id) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }

  try {
    await User.deleteUserById(id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowed = [
    'machine_operator',
    'quality_inspector',
    'quality_manager',
    'admin',
  ];

  if (!allowed.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    await User.updateUserRole(id, role);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await User.updateUserStatus(id, status);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const [roles] = await db.query(
      'SELECT id, name, display_name FROM roles'
    );
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT COUNT(*) AS total FROM users'
    );

    const [[reports]] = await db.query(
      'SELECT COUNT(*) AS total FROM reports'
    );

    const [[roles]] = await db.query(
      'SELECT COUNT(DISTINCT role) AS total FROM users;'
    );

    res.json({
        users: user.total,
        reports: reports.total,
        roles:roles.total
        
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
