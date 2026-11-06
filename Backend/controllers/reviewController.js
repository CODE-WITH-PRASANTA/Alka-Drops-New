const Review = require("../models/Review");

// @desc    Get all reviews with filtering & search
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const { status, rating, search, page = 1, limit = 100 } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = { $regex: new RegExp(`^${status.trim()}$`, "i") };
    }

    if (rating && rating !== "all" && !isNaN(Number(rating))) {
      query.rating = Number(rating);
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { customer: { $regex: s, $options: "i" } },
        { title: { $regex: s, $options: "i" } },
        { comment: { $regex: s, $options: "i" } },
        { product: { $regex: s, $options: "i" } },
        { role: { $regex: s, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 100);
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      reviews,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews.",
    });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }
    res.json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch review.",
    });
  }
};

// @desc    Create a new customer review
// @route   POST /api/reviews
// @access  Public / Customer / Admin
const createReview = async (req, res, next) => {
  try {
    const {
      name,
      customer,
      role,
      avatar,
      image,
      product,
      rating,
      title,
      comment,
      text,
      feedback,
      verified,
      status,
      helpful,
    } = req.body;

    const customerName = (name || customer || "").trim();
    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    const reviewContent = (comment || text || feedback || "").trim();
    if (!reviewContent) {
      return res.status(400).json({
        success: false,
        message: "Review comment or feedback is required.",
      });
    }

    const reviewRating = Number(rating) || 5;
    if (reviewRating < 1 || reviewRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars.",
      });
    }

    const review = await Review.create({
      name: customerName,
      customer: customerName,
      role: (role || "Verified Buyer, Bhubaneswar").trim(),
      avatar: avatar || image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      image: image || avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      product: (product || "20L Alkaline Mineral Water Jar").trim(),
      rating: reviewRating,
      title: (title || "Alkaline Water Customer Review").trim(),
      comment: reviewContent,
      text: reviewContent,
      feedback: reviewContent,
      verified: verified !== undefined ? Boolean(verified) : true,
      status: status || "Published",
      helpful: Number(helpful) || 0,
      adminReply: req.body.adminReply || "",
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create review.",
    });
  }
};

// @desc    Update review (status, reply, content)
// @route   PUT /api/reviews/:id
// @access  Admin
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const updates = { ...req.body };
    if (updates.customer && !updates.name) updates.name = updates.customer;
    if (updates.name && !updates.customer) updates.customer = updates.name;
    if (updates.image && !updates.avatar) updates.avatar = updates.image;
    if (updates.avatar && !updates.image) updates.image = updates.avatar;
    if (updates.comment) {
      updates.text = updates.comment;
      updates.feedback = updates.comment;
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Review updated successfully!",
      review: updated,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update review.",
    });
  }
};

// @desc    Toggle review status (Published <-> Hidden)
// @route   PATCH /api/reviews/:id/status
// @access  Admin
const toggleReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const { status } = req.body;
    if (status) {
      review.status = status;
    } else {
      review.status = review.status === "Published" ? "Hidden" : "Published";
    }

    await review.save();

    res.json({
      success: true,
      message: `Review is now ${review.status}.`,
      review,
    });
  } catch (error) {
    console.error("Error toggling review status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update review status.",
    });
  }
};

// @desc    Add or update admin official reply
// @route   POST /api/reviews/:id/reply
// @access  Admin
const addAdminReply = async (req, res, next) => {
  try {
    const { adminReply } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    review.adminReply = adminReply ? adminReply.trim() : "";
    await review.save();

    res.json({
      success: true,
      message: "Official reply saved successfully!",
      review,
    });
  } catch (error) {
    console.error("Error saving admin reply:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save official reply.",
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Customer review removed successfully!",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review.",
    });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  toggleReviewStatus,
  addAdminReply,
  deleteReview,
};
