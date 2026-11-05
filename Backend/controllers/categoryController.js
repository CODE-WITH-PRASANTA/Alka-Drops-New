const Category = require("../models/Category");
const Blog = require("../models/Blog");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });

    // Calculate dynamic post counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const postCount = await Blog.countDocuments({
          category: { $regex: `^${cat.name}$`, $options: "i" },
        });
        const catObj = cat.toObject();
        catObj.postCount = postCount;
        return catObj;
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    }

    if (!category) {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const postCount = await Blog.countDocuments({
      category: { $regex: `^${category.name}$`, $options: "i" },
    });

    const result = category.toObject();
    result.postCount = postCount;

    res.json({
      success: true,
      category: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public / Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, status, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const trimmedName = name.trim();

    // Check if category name already exists (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category "${trimmedName}" already exists.`,
      });
    }

    const category = await Category.create({
      name: trimmedName,
      description: description ? description.trim() : "",
      status: status || "active",
      color: color || "#0ea5e9",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public / Admin
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, color } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Check if name is being changed and if it conflicts with another category
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const existing = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another category named "${name.trim()}" already exists.`,
        });
      }

      // If category name updated, also update existing blogs referencing old category name
      const oldName = category.name;
      category.name = name.trim();
      await Blog.updateMany(
        { category: oldName },
        { category: category.name }
      );
    }

    if (description !== undefined) category.description = description.trim();
    if (status !== undefined) category.status = status;
    if (color !== undefined) category.color = color;

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully!",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public / Admin
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

