const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
} = require("../controllers/blogController");

// Public routes
router.get("/", getBlogs);
router.get("/:idOrSlug", getBlogByIdOrSlug);
router.post("/:id/comments", addComment);

// Admin routes
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;

