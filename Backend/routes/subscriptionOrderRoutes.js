const express = require("express");
const router = express.Router();
const {
  createSubscriptionOrder,
  getAllSubscriptionOrders,
  getMySubscriptionOrders,
  toggleMySubscriptionStatus,
  updateMySubscriptionSchedule,
  updateSubscriptionOrderStatus,
  assignDeliveryPartner,
  recordSubscriptionDrop,
  deleteSubscriptionOrder,
} = require("../controllers/subscriptionOrderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public / Customer Endpoints
router.post("/", optionalAuth, createSubscriptionOrder);
router.get("/my-subscriptions", protect, getMySubscriptionOrders);
router.patch("/my-subscriptions/toggle-status", protect, toggleMySubscriptionStatus);
router.patch("/my-subscriptions/update-schedule", protect, updateMySubscriptionSchedule);

// Admin / Delivery Endpoints
router.get("/", getAllSubscriptionOrders);
router.patch("/:id/status", updateSubscriptionOrderStatus);
router.patch("/:id/assign", assignDeliveryPartner);
router.post("/:id/record-drop", recordSubscriptionDrop);
router.delete("/:id", deleteSubscriptionOrder);

module.exports = router;

