// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");

// const register = async (req, res) => {
//   try {
//     const { name, employeeId, email, phone, role, password, confirmPassword } =
//       req.body;

//     if (
//       !name ||
//       !employeeId ||
//       !email ||
//       !phone ||
//       !role ||
//       !password ||
//       !confirmPassword
//     )
//       return res.status(400).json({ message: "All fields required" });

//          // 🔒 BLOCK ADMIN REGISTRATION
//     const allowedRoles = [
//       'machine_operator',
//       'quality_inspector',
//       'quality_manager'
//     ];

//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({ message: 'Invalid role' });
//     }

//     if (password !== confirmPassword)
//       return res.status(400).json({ message: "Passwords do not match" });

//     const existing = await User.findByEmployeeId(employeeId);
//     if (existing.length > 0)
//       return res.status(400).json({ message: "Employee already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.createUser({
//       name,
//       employeeId,
//       email,
//       phone,
//       role,
//       password: hashedPassword,
//     });
//     return res.status(201).json({ message: "User registered successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "DB error" });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { employeeId, password } = req.body;

//     if (!employeeId || !password)
//       return res.status(400).json({ message: "All fields required" });

//     const users = await User.findByEmployeeId(employeeId);
//     if (users.length === 0)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const user = users[0];

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid credentials" });

//     /* 🔒 ADD THIS BLOCK — THIS IS THE KEY */
//     if (user.status !== "active") {
//       return res.status(403).json({
//         message: "Account deactivated ! Please contact admin",
//         code: "ACCOUNT_INACTIVE",
//       });
//     }

//     /* ✅ ONLY ACTIVE USERS REACH HERE */
//     const token = jwt.sign(
//       {
//         id: user.id,
//         employee_id: user.employee_id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" },
//     );

//     return res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         role: user.role,
//         email: user.email,
//         phone: user.phone,
//         employee_id: user.employee_id,
//         status: user.status, // optional but useful
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "DB error" });
//   }
// };

// const updateProfile = async (req, res) => {
//   try {
//     const { name, email, phone } = req.body;
//     const employeeId = req.user.employee_id; // JWT source of truth

//     if (!name || !email || !phone) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     await User.updateProfile(employeeId, name, email, phone);

//     res.json({ message: "Profile updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // const changePassword = async (req, res) => {
// //   try {
// //     const { currentPassword, newPassword, confirmPassword } = req.body;
// //     const employeeId = req.user.employee_id; // from JWT

// //     if (!currentPassword || !newPassword || !confirmPassword) {
// //       return res.status(400).json({ message: "All fields required" });
// //     }

// //     if (newPassword !== confirmPassword) {
// //       return res.status(400).json({ message: "Passwords do not match" });
// //     }
// //     // const users = await User.findByEmployeeId(employeeId);
// //     if (users.length === 0) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     const user = users[0];

// //     const isMatch = await bcrypt.compare(currentPassword, user.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ message: "Current password is incorrect" });
// //     }

// //     const hashedPassword = await bcrypt.hash(newPassword, 10);
// //     await User.updatePassword(employeeId, hashedPassword);

// //     res.json({ message: "Password changed successfully" });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;
//     const employeeId = req.user.employee_id;

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     const users = await User.findByEmployeeId(employeeId);

//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = users[0];

//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Current password is incorrect" });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await User.updatePassword(employeeId, hashedPassword);


//     res.json({ message: "Password changed successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// module.exports = { register, login, updateProfile, changePassword };


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { name, employeeId, email, phone, role, password, confirmPassword } =
      req.body;

    if (
      !name ||
      !employeeId ||
      !email ||
      !phone ||
      !role ||
      !password ||
      !confirmPassword
    )
      return res.status(400).json({ message: "All fields required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const existing = await User.findByEmployeeId(employeeId);
    if (existing.length > 0)
      return res.status(400).json({ message: "Employee already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.createUser({
      name,
      employeeId,
      email,
      phone,
      role,
      password: hashedPassword,
    });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "DB error" });
  }
};

// const login = async (req, res) => {
//   try {
//     const { employeeId, password } = req.body;

//     if (!employeeId || !password)
//       return res.status(400).json({ message: "All fields required" });

//     const users = await User.findByEmployeeId(employeeId);
//     if (users.length === 0)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const user = users[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid credentials" });

//     // const token = jwt.sign(
//     //   { id: user.id, role: user.role },
//     //   process.env.JWT_SECRET,
//     //   { expiresIn: "1d" }
//     // );
//     const token = jwt.sign(
//       {
//         id: user.id,
//         employee_id: user.employee_id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         role: user.role,
//         email: user.email,
//         phone: user.phone,
//         employee_id: user.employee_id,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "DB error" });
//   }
// };
const login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password)
      return res.status(400).json({ message: "All fields required" });

    const users = await User.findByEmployeeId(employeeId);
    if (users.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    /* 🔒 ADD THIS BLOCK — THIS IS THE KEY */
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account deactivated ! Please contact admin",
        code: "ACCOUNT_INACTIVE",
      });
    }

    /* ✅ ONLY ACTIVE USERS REACH HERE */
    const token = jwt.sign(
      {
        id: user.id,
        employee_id: user.employee_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        status: user.status, // optional but useful
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "DB error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const employeeId = req.user.employee_id; // JWT source of truth

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    await User.updateProfile(employeeId, name, email, phone);

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const employeeId = req.user.employee_id; // from JWT

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const users = await User.findByEmployeeId(employeeId);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(employeeId, hashedPassword);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, updateProfile, changePassword };
