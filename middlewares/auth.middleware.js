const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const protect = async (req, res, next) => {
  try {
    // Token kadhto header madhe
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin DB madhe ahe ka check
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found. Token invalid." });
    }

    // ✅ req.admin set — controllers madhe req.admin._id vaparta yeil
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired." });
    }
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { protect };