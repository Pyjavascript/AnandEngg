const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { employee_id, role, iat, exp }

    const rows = await User.findByEmployeeId(decoded.employee_id);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0]; // ✅ actual user row

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account deactivated",
        code: "ACCOUNT_INACTIVE",
      });
    }
    req.user = {
      id: user.id,
      employee_id: user.employee_id,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
