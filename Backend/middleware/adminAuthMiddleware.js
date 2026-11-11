const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "alka_drops_secret_jwt_key_2026";

// Protect route for Admin / Staff users
const protectAdminUser = async (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.alka_admin_token) {
    // 2. Fallback to HTTP-only cookie
    token = req.cookies.alka_admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch AdminUser without password
    const adminUser = await AdminUser.findById(decoded.id)
      .select("-password")
      .populate("deliveryBoyRef");

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. User no longer exists.",
      });
    }

    if (adminUser.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or suspended. Please contact administrator.",
      });
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// Role-based authorization middleware
const authorizeAdminRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request.",
      });
    }

    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.adminUser.role}' is not authorized to access this resource. Required: [${roles.join(", ")}]`,
      });
    }

    next();
  };
};

module.exports = {
  protectAdminUser,
  authorizeAdminRoles,
};

