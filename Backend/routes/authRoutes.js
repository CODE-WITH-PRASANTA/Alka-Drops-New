const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  forgotPassword,
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", protect, removeAvatar);

// User Management (Admin / Dashboard)
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

module.exports = router;



