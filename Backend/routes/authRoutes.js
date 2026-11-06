const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/me", protect, getMe);

// User Management (Admin / Dashboard)
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

module.exports = router;


