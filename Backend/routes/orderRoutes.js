const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryBoy,
  submitShopOrderDelivery,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public/User routes
router.post("/", optionalAuth, createOrder);
router.post("/razorpay/create-order", optionalAuth, createRazorpayOrder);
router.post("/razorpay/verify-payment", optionalAuth, verifyRazorpayPayment);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", getOrderById);

// Admin / Delivery routes
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/assign-delivery-boy", assignDeliveryBoy);
router.post("/:id/submit-delivery", submitShopOrderDelivery);

module.exports = router;

