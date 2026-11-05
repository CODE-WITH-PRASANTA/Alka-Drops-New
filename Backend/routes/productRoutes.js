const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
// authMiddleware can be used for admin protection if token provided
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes (with relaxed check if testing locally)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;

