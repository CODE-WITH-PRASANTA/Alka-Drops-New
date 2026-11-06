const Product = require("../models/Product");

// @desc    Get all products with filtering, search & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 100 } = req.query;

    const query = {};

    if (category && category !== "All" && category !== "All Products") {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { name: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
        { category: { $regex: s, $options: "i" } },
        { liter: { $regex: s, $options: "i" } },
        { size: { $regex: s, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-low" || sort === "low") sortOption = { price: 1 };
    if (sort === "price-high" || sort === "high") sortOption = { price: -1 };
    if (sort === "name") sortOption = { title: 1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 100);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products.",
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product.",
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public / Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      name,
      category,
      liter,
      size,
      price,
      discount,
      badge,
      quantity,
      description,
      image,
      images,
      rating,
      oldPrice,
    } = req.body;

    const productTitle = (title || name || "").trim();
    if (!productTitle) {
      return res.status(400).json({
        success: false,
        message: "Product title/name is required.",
      });
    }

    if (price === undefined || price === "" || isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: "A valid numeric price is required.",
      });
    }

    const numPrice = Number(price);
    const numDiscount = discount !== undefined && discount !== "" ? Number(discount) : 0;
    let computedOldPrice = oldPrice ? Number(oldPrice) : 0;
    if (!computedOldPrice && numDiscount > 0 && numPrice > 0) {
      computedOldPrice = Math.round(numPrice / (1 - numDiscount / 100));
    }

    const numQuantity = quantity !== undefined && quantity !== "" ? Number(quantity) : 100;

    const product = await Product.create({
      title: productTitle,
      name: productTitle,
      category: (category || "Alkaline Water").trim(),
      liter: (liter || size || "1 Litre").trim(),
      size: (size || liter || "1 Litre").trim(),
      price: numPrice,
      discount: numDiscount,
      oldPrice: computedOldPrice,
      badge: badge === "None" ? "" : (badge || "").trim(),
      quantity: numQuantity,
      inStock: numQuantity > 0,
      description: description || "",
      image: image || "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85",
      images: Array.isArray(images) ? images : [],
      rating: rating ? Number(rating) : 4.8,
      reviews: req.body.reviews ? Number(req.body.reviews) : 24,
    });

    res.status(201).json({
      success: true,
      message: "Product created and added to stock successfully!",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product.",
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public / Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const updates = { ...req.body };

    if (updates.title) updates.name = updates.title;
    else if (updates.name) updates.title = updates.name;

    if (updates.liter) updates.size = updates.liter;
    else if (updates.size) updates.liter = updates.size;

    if (updates.badge === "None") updates.badge = "";

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.discount !== undefined) updates.discount = Number(updates.discount);
    if (updates.quantity !== undefined) {
      updates.quantity = Number(updates.quantity);
      updates.inStock = updates.quantity > 0;
    }

    const finalPrice = updates.price !== undefined ? updates.price : product.price;
    const finalDiscount = updates.discount !== undefined ? updates.discount : product.discount;
    if (finalDiscount > 0 && finalPrice > 0 && (!updates.oldPrice || updates.oldPrice === 0)) {
      updates.oldPrice = Math.round(finalPrice / (1 - finalDiscount / 100));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product.",
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public / Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product removed from inventory successfully!",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
