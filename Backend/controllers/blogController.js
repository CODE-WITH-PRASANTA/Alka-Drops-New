const Blog = require("../models/Blog");

// @desc    Get all blogs (with optional search, tag, category, status, pagination)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const { category, tag, search, status, page = 1, limit = 100 } = req.query;

    const query = {};

    // For public website, only show published blogs unless requested with status
    if (status && status !== "all" && status !== "All Status") {
      query.status = { $regex: `^${status}$`, $options: "i" };
    }

    if (category && category !== "All" && category !== "All Categories") {
      query.category = { $regex: category, $options: "i" };
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { postedBy: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: blogs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:idOrSlug
// @access  Public
const getBlogByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let blog;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(idOrSlug);
    }

    if (!blog) {
      blog = await Blog.findOne({ slug: idOrSlug });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    res.json({
      success: true,
      blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a blog post
// @route   POST /api/blogs
// @access  Public / Admin
const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      author,
      postedBy,
      authorRole,
      readTime,
      tags,
      quote,
      location,
      excerpt,
      content,
      description,
      featuredImage,
      coverImage,
      image,
      status,
    } = req.body;

    const blogContent = content || description;
    if (!title || !blogContent) {
      return res.status(400).json({
        success: false,
        message: "Blog title and content/description are required.",
      });
    }

    // Process tags into array
    let processedTags = ["Alkaline Water"];
    if (Array.isArray(tags)) {
      processedTags = tags.filter(Boolean);
    } else if (typeof tags === "string" && tags.trim()) {
      processedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const singleImage = featuredImage || coverImage || image || "";

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      category: category || "Water & Health",
      author: (author || postedBy || "Alka Drops Team").trim(),
      postedBy: (postedBy || author || "Alka Drops Team").trim(),
      authorRole: authorRole || "Hydration Expert",
      readTime: readTime || "5 min read",
      tags: processedTags,
      quote: quote ? quote.trim() : "",
      location: location ? location.trim() : "",
      excerpt: excerpt || "",
      content: blogContent,
      description: blogContent,
      featuredImage: singleImage,
      coverImage: singleImage,
      image: singleImage,
      status: (status || "published").toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: "Blog post published successfully!",
      blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Public / Admin
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    const body = { ...req.body };

    if (body.content && !body.description) {
      body.description = body.content;
    } else if (body.description && !body.content) {
      body.content = body.description;
    }

    if (body.postedBy && !body.author) {
      body.author = body.postedBy;
    } else if (body.author && !body.postedBy) {
      body.postedBy = body.author;
    }

    const singleImage = body.featuredImage || body.coverImage || body.image;
    if (singleImage) {
      body.featuredImage = singleImage;
      body.coverImage = singleImage;
      body.image = singleImage;
    }

    if (body.tags && typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    if (body.status) {
      body.status = body.status.toLowerCase();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Blog post updated successfully!",
      blog: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Public / Admin
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Blog post deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a blog post
// @route   POST /api/blogs/:id/comments
// @access  Public
const addComment = async (req, res, next) => {
  try {
    const { name, email, comment, website } = req.body;

    if (!name || !email || !comment) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and comment are required.",
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    const newComment = {
      name,
      email,
      comment,
      website: website || "",
      createdAt: new Date(),
    };

    blog.comments.unshift(newComment);
    await blog.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully!",
      comments: blog.comments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
};
