const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
  logoutUser,
  getMe,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  forgotPassword,
  sendResetOtp,
  verifyResetOtp,
  resetPasswordWithOtp,
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

// Password Reset via OTP (Step 1 -> Step 2 -> Step 3)
router.post("/forgot-password", forgotPassword);
router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPasswordWithOtp);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", protect, removeAvatar);

// User Management (Admin / Dashboard)
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

module.exports = router;



