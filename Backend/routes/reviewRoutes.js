const express = require("express");
const router = express.Router();
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  toggleReviewStatus,
  addAdminReply,
  deleteReview,
} = require("../controllers/reviewController");

// Public endpoints
router.get("/", getReviews);
router.get("/:id", getReviewById);
router.post("/", createReview);

// Admin review management endpoints
router.put("/:id", updateReview);
router.patch("/:id/status", toggleReviewStatus);
router.post("/:id/reply", addAdminReply);
router.delete("/:id", deleteReview);

module.exports = router;

