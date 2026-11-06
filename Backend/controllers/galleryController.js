const Gallery = require("../models/Gallery");

// @desc    Get all gallery images (with filtering & search)
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res, next) => {
  try {
    const { status, category, search, sort } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    if (category && category !== "all" && category !== "All Categories") {
      query.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { alt: searchRegex },
      ];
    }

    let sortOptions = { order: 1, createdAt: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "title_asc") sortOptions = { title: 1 };
    if (sort === "title_desc") sortOptions = { title: -1 };

    const items = await Gallery.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gallery image by ID
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryItemById = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found.",
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new gallery image
// @route   POST /api/gallery
// @access  Admin
const createGalleryItem = async (req, res, next) => {
  try {
    const { title, image, category, alt, order, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Image title is required.",
      });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Image file/URL is required.",
      });
    }

    const item = await Gallery.create({
      title: title.trim(),
      image: image.trim(),
      category: category?.trim() || "Alkaline Water",
      alt: alt?.trim() || title.trim(),
      order: Number(order) || 0,
      status: status?.toLowerCase() === "inactive" ? "inactive" : "active",
    });

    res.status(201).json({
      success: true,
      message: "Gallery image added successfully.",
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a gallery image
// @route   PUT /api/gallery/:id
// @access  Admin
const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found.",
      });
    }

    const { title, image, category, alt, order, status } = req.body;

    if (title !== undefined) item.title = title.trim();
    if (image !== undefined) item.image = image.trim();
    if (category !== undefined) item.category = category.trim();
    if (alt !== undefined) item.alt = alt.trim();
    if (order !== undefined) item.order = Number(order) || 0;
    if (status !== undefined) {
      item.status = status.toLowerCase() === "inactive" ? "inactive" : "active";
    }

    const updated = await item.save();

    res.json({
      success: true,
      message: "Gallery image updated successfully.",
      item: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Admin
const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found.",
      });
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Image "${item.title}" removed from gallery.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle gallery item active/inactive status
// @route   PATCH /api/gallery/:id/status
// @access  Admin
const toggleGalleryStatus = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found.",
      });
    }

    item.status = item.status === "active" ? "inactive" : "active";
    await item.save();

    res.json({
      success: true,
      message: `Gallery image is now ${item.status}.`,
      status: item.status,
      item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
};

