const express = require("express");
const router = express.Router();
const {
  loginAdminUser,
  getAdminProfile,
  updateAdminProfile,
  clockInAttendance,
  clockOutAttendance,
  getAttendanceLogs,
  getDeliveryBoyWorkDetails,
  registerAdminUser,
  getAllAdminUsers,
} = require("../controllers/adminUserController");

const {
  protectAdminUser,
  authorizeAdminRoles,
} = require("../middleware/adminAuthMiddleware");

const {
  sendResetOtp,
  verifyResetOtp,
  resetPasswordWithOtp,
} = require("../controllers/authController");

// Public authentication endpoint
router.post("/login", loginAdminUser);

// OTP-based password reset for Admin & Delivery Partners
router.post("/forgot-password", sendResetOtp);
router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPasswordWithOtp);

// Authenticated current user profile
router.get("/me", protectAdminUser, getAdminProfile);
router.put("/me", protectAdminUser, updateAdminProfile);

// Attendance system endpoints (Delivery Boy & Admin)
router.post("/attendance/clock-in", protectAdminUser, clockInAttendance);
router.post("/attendance/clock-out", protectAdminUser, clockOutAttendance);
router.get("/attendance", protectAdminUser, getAttendanceLogs);

// Delivery boy dedicated work details & orders
router.get("/delivery-work", protectAdminUser, getDeliveryBoyWorkDetails);

// Administrative staff management endpoints (Admin only)
router.post(
  "/register",
  protectAdminUser,
  authorizeAdminRoles("admin"),
  registerAdminUser
);
router.get(
  "/",
  protectAdminUser,
  authorizeAdminRoles("admin"),
  getAllAdminUsers
);

module.exports = router;

