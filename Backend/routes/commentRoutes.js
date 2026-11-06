const express = require("express");
const router = express.Router();
const {
  createComment,
  getComments,
  getCommentsByBlog,
  updateCommentStatus,
  adminReplyComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

// Public endpoints
router.post("/", createComment);
router.get("/blog/:blogIdOrSlug", getCommentsByBlog);

// Admin endpoints
router.get("/", getComments);
router.patch("/:id/status", updateCommentStatus);
router.post("/:id/reply", adminReplyComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

module.exports = router;

