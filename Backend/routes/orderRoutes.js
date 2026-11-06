const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public/User routes
router.post("/", optionalAuth, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", getOrderById);

// Admin routes
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

module.exports = router;

