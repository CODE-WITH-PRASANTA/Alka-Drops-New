const express = require("express");
const router = express.Router();
const {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
} = require("../controllers/galleryController");

// Public endpoints
router.get("/", getGalleryItems);
router.get("/:id", getGalleryItemById);

// Admin endpoints
router.post("/", createGalleryItem);
router.put("/:id", updateGalleryItem);
router.delete("/:id", deleteGalleryItem);
router.patch("/:id/status", toggleGalleryStatus);

module.exports = router;

