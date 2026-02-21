const db = require('../config/db');

async function ensureRolesTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      display_name VARCHAR(150) NOT NULL,
      description VARCHAR(255) DEFAULT '',
      is_protected TINYINT(1) DEFAULT 0,
      can_self_register TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Backward-compatible migration for older MySQL versions (without ADD COLUMN IF NOT EXISTS).
  const addColumnIfMissing = async (columnName, sqlTypeClause) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'roles'
         AND COLUMN_NAME = ?`,
      [columnName]
    );
    if (Number(rows[0]?.total || 0) === 0) {
      await db.query(`ALTER TABLE roles ADD COLUMN ${columnName} ${sqlTypeClause}`);
    }
  };

  await addColumnIfMissing('description', "VARCHAR(255) DEFAULT ''");
  await addColumnIfMissing('is_protected', 'TINYINT(1) DEFAULT 0');
  await addColumnIfMissing('can_self_register', 'TINYINT(1) DEFAULT 0');
  await addColumnIfMissing('created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

  // If legacy column `protected` exists, sync it into `is_protected`.
  const [legacyProtectedCol] = await db.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'roles'
       AND COLUMN_NAME = 'protected'`
  );
  if (Number(legacyProtectedCol[0]?.total || 0) > 0) {
    await db.query(
      `UPDATE roles
       SET is_protected = COALESCE(is_protected, protected, 0)`
    );
  }

  await db.query(
    `INSERT IGNORE INTO roles (name, display_name, description, is_protected, can_self_register)
     VALUES
     ('machine_operator', 'Machine Operator', 'Operates machines and submits inspection reports', 1, 1),
     ('quality_inspector', 'Quality Inspector', 'Inspects and reviews submitted reports', 1, 1),
     ('quality_manager', 'Quality Manager', 'Approves quality reports and manages quality flow', 1, 1),
     ('admin', 'Admin', 'System administrator', 1, 0)`
  );
}

exports.listPublicRoles = async (req, res) => {
  try {
    await ensureRolesTable();
    const [rows] = await db.query(
      `SELECT id, name, display_name
       FROM roles
       WHERE can_self_register = 1
       ORDER BY id ASC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load roles' });
  }
};

exports.listAdminRoles = async (req, res) => {
  try {
    await ensureRolesTable();
    const [rows] = await db.query(
      `SELECT id, name, display_name, description, is_protected, can_self_register
       FROM roles
       ORDER BY id ASC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load roles' });
  }
};

exports.createRole = async (req, res) => {
  try {
    await ensureRolesTable();
    const { name, display_name, description = '', can_self_register = 0 } = req.body;

    if (!name || !display_name) {
      return res.status(400).json({ message: 'name and display_name are required' });
    }

    const normalizedName = String(name).trim().toLowerCase().replace(/\s+/g, '_');
    const nameOk = /^[a-z_][a-z0-9_]*$/.test(normalizedName);
    if (!nameOk) {
      return res.status(400).json({ message: 'Invalid role name format' });
    }

    if (normalizedName === 'admin') {
      return res.status(400).json({ message: 'admin role cannot be created from panel' });
    }

    const [exists] = await db.query('SELECT id FROM roles WHERE name = ?', [normalizedName]);
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const [result] = await db.query(
      `INSERT INTO roles (name, display_name, description, is_protected, can_self_register)
       VALUES (?, ?, ?, 0, ?)`,
      [normalizedName, String(display_name).trim(), String(description || '').trim(), can_self_register ? 1 : 0]
    );

    return res.status(201).json({
      id: result.insertId,
      name: normalizedName,
      display_name: String(display_name).trim(),
      description: String(description || '').trim(),
      is_protected: 0,
      can_self_register: can_self_register ? 1 : 0,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create role' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await ensureRolesTable();
    const roleId = Number(req.params.id);
    if (!roleId) {
      return res.status(400).json({ message: 'Invalid role id' });
    }

    const [[role]] = await db.query(
      'SELECT id, name, is_protected FROM roles WHERE id = ?',
      [roleId]
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (Number(role.is_protected) === 1 || role.name === 'admin') {
      return res.status(400).json({ message: 'Protected role cannot be deleted' });
    }

    const [[used]] = await db.query(
      'SELECT COUNT(*) AS total FROM users WHERE role = ?',
      [role.name]
    );

    if (Number(used.total) > 0) {
      return res.status(400).json({ message: 'Role is assigned to users. Reassign users first.' });
    }

    await db.query('DELETE FROM roles WHERE id = ?', [roleId]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete role' });
  }
};

exports.ensureRolesTable = ensureRolesTable;
