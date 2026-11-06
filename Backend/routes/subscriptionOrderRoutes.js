const express = require("express");
const router = express.Router();
const {
  createSubscriptionOrder,
  getAllSubscriptionOrders,
  getMySubscriptionOrders,
  updateSubscriptionOrderStatus,
  assignDeliveryPartner,
  deleteSubscriptionOrder,
} = require("../controllers/subscriptionOrderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public / Customer Endpoints
router.post("/", optionalAuth, createSubscriptionOrder);
router.get("/my-subscriptions", protect, getMySubscriptionOrders);

// Admin Endpoints
router.get("/", getAllSubscriptionOrders);
router.patch("/:id/status", updateSubscriptionOrderStatus);
router.patch("/:id/assign", assignDeliveryPartner);
router.delete("/:id", deleteSubscriptionOrder);

module.exports = router;

