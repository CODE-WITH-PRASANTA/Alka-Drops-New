const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Check Authorization Bearer header as standard fallback
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        "alka_drops_access_jwt_key_2026_super_secure_access"
    );

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    if (req.user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is currently blocked. Please contact support.",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Access token has expired. Please refresh your session.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
      error: error.message,
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "Administrator")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Admin privileges required.",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        "alka_drops_access_jwt_key_2026_super_secure_access"
    );
    req.user = await User.findById(decoded.id).select("-password");
  } catch (err) {
    // ignore invalid/expired token in optionalAuth
  }
  next();
};

module.exports = { protect, admin, optionalAuth };


