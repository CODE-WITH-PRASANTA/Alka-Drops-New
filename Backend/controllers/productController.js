const Product = require("../models/Product");

// @desc    Get all products with filtering, search & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    if (category && category !== "All" && category !== "All Products") {
      query.category = { $regex: category, $options: "i" };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
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
    } = req.body;

    const productTitle = title || name;
    if (!productTitle || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product title/name and price are required.",
      });
    }

    const product = await Product.create({
      title: productTitle,
      name: productTitle,
      category: category || "Alkaline Water",
      liter: liter || size || "1 Litre",
      size: size || liter || "1 Litre",
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      badge: badge || "",
      quantity: quantity ? Number(quantity) : 100,
      description: description || "",
      image: image || "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85",
      images: images || [],
      rating: rating ? Number(rating) : 4.8,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (req.body.title) {
      req.body.name = req.body.title;
    } else if (req.body.name) {
      req.body.title = req.body.name;
    }

    if (req.body.liter) {
      req.body.size = req.body.liter;
    } else if (req.body.size) {
      req.body.liter = req.body.size;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
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
      message: "Product deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

