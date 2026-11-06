const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

// Helper to format date like "JAN 31, 2021 at 2:40pm"
const formatCommentDate = (date) => {
  const d = new Date(date);
  const day = d
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(/\s/g, "")
    .toLowerCase();
  return `${day} at ${time}`;
};

// @desc    Post a new comment from the frontend (created as DRAFT)
// @route   POST /api/comments
// @access  Public
const createComment = async (req, res, next) => {
  try {
    const { blogId, blogSlug, name, email, comment, website, parentCommentId } = req.body;

    // 1. Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name (minimum 2 characters).",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please write your comment (minimum 5 characters).",
      });
    }

    // 2. Resolve target blog
    let targetBlog = null;
    if (blogId && blogId.match(/^[0-9a-fA-F]{24}$/)) {
      targetBlog = await Blog.findById(blogId);
    }
    if (!targetBlog && blogSlug) {
      targetBlog = await Blog.findOne({ slug: blogSlug.trim() });
    }
    if (!targetBlog) {
      // Fallback: pick the first published blog
      targetBlog = await Blog.findOne({ status: "published" });
    }

    if (!targetBlog) {
      return res.status(404).json({
        success: false,
        message: "Referenced blog article could not be found.",
      });
    }

    // 3. Prevent Duplicacy (Anti-Spam Check)
    // Check if identical comment from same email on this blog was created recently (within last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const duplicateComment = await Comment.findOne({
      blog: targetBlog._id,
      email: email.trim().toLowerCase(),
      comment: comment.trim(),
      createdAt: { $gte: tenMinutesAgo },
    });

    if (duplicateComment) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate comment detected! You have already submitted this comment. Please avoid resubmitting.",
      });
    }

    // Also check parentComment if provided
    let parentComment = null;
    if (parentCommentId && parentCommentId.match(/^[0-9a-fA-F]{24}$/)) {
      parentComment = await Comment.findById(parentCommentId);
    }

    // 4. Create comment as DRAFT for admin review
    const newComment = await Comment.create({
      blog: targetBlog._id,
      blogTitle: targetBlog.title,
      blogSlug: targetBlog.slug || targetBlog._id.toString(),
      parentComment: parentComment ? parentComment._id : null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      comment: comment.trim(),
      website: website?.trim() || "",
      avatar: "",
      status: "draft", // Saved as draft for moderation
    });

    res.status(201).json({
      success: true,
      message:
        "Thank you! Your comment has been submitted as draft and is awaiting admin review before appearing on the website.",
      comment: newComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments with filtering, search, pagination (Admin Panel)
// @route   GET /api/comments
// @access  Admin
const getComments = async (req, res, next) => {
  try {
    const { status, blogId, search, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by status (draft vs published)
    if (status && status !== "all" && status !== "All Status") {
      query.status = status.toLowerCase();
    }

    // Filter by specific blog
    if (blogId && blogId !== "all" && blogId !== "All Blogs") {
      if (blogId.match(/^[0-9a-fA-F]{24}$/)) {
        query.blog = blogId;
      } else {
        query.blogSlug = blogId;
      }
    }

    // Search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { comment: searchRegex },
        { blogTitle: searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Comment.countDocuments(query);

    const comments = await Comment.find(query)
      .populate("blog", "title slug coverImage category")
      .populate("parentComment", "name comment")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Also get overall counts for stats
    const totalCount = await Comment.countDocuments();
    const draftCount = await Comment.countDocuments({ status: "draft" });
    const publishedCount = await Comment.countDocuments({ status: "published" });

    // Distinct blogs count with comments
    const blogIds = await Comment.distinct("blog");

    res.json({
      success: true,
      count: comments.length,
      total,
      stats: {
        total: totalCount,
        draft: draftCount,
        published: publishedCount,
        blogsCount: blogIds.length,
      },
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get only published comments for a specific blog (Public Website)
// @route   GET /api/comments/blog/:blogIdOrSlug
// @access  Public
const getCommentsByBlog = async (req, res, next) => {
  try {
    const { blogIdOrSlug } = req.params;

    // Resolve blog
    let blog = null;
    if (blogIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(blogIdOrSlug);
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: blogIdOrSlug });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog article not found.",
        comments: [],
        count: 0,
      });
    }

    // Fetch published comments only
    const allComments = await Comment.find({
      blog: blog._id,
      status: "published",
    }).sort({ createdAt: 1 });

    // Construct hierarchical nested tree
    const commentMap = {};
    const topLevelComments = [];

    allComments.forEach((c) => {
      const formatted = {
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        date: formatCommentDate(c.createdAt),
        message: c.comment,
        avatar: c.avatar || null,
        status: c.status,
        replies: [],
      };
      commentMap[c._id.toString()] = formatted;
    });

    allComments.forEach((c) => {
      const cId = c._id.toString();
      if (c.parentComment && commentMap[c.parentComment.toString()]) {
        commentMap[c.parentComment.toString()].replies.push(commentMap[cId]);
      } else {
        topLevelComments.push(commentMap[cId]);
      }
    });

    res.json({
      success: true,
      count: allComments.length,
      comments: topLevelComments,
      blog: {
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle comment status between 'draft' and 'published' (Admin)
// @route   PATCH /api/comments/:id/status
// @access  Admin
const updateCommentStatus = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Explicit or toggle
    const { status } = req.body;
    if (status) {
      comment.status = status.toLowerCase() === "published" ? "published" : "draft";
    } else {
      comment.status = comment.status === "published" ? "draft" : "published";
    }

    await comment.save();

    res.json({
      success: true,
      message: `Comment is now ${comment.status === "published" ? "Published (Live on Website)" : "Moved to Drafts"}.`,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin replies to a comment (Directly published)
// @route   POST /api/comments/:id/reply
// @access  Admin
const adminReplyComment = async (req, res, next) => {
  try {
    const parentComment = await Comment.findById(req.params.id).populate("blog");

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found.",
      });
    }

    const { replyText, adminName = "Alka Drops Admin" } = req.body;

    if (!replyText || replyText.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Reply message cannot be empty.",
      });
    }

    const reply = await Comment.create({
      blog: parentComment.blog._id || parentComment.blog,
      blogTitle: parentComment.blogTitle || parentComment.blog?.title || "",
      blogSlug: parentComment.blogSlug || parentComment.blog?.slug || "",
      parentComment: parentComment._id,
      name: adminName.trim(),
      email: "admin@alkadrops.com",
      comment: replyText.trim(),
      status: "published", // Admin replies are instantly published
    });

    res.status(201).json({
      success: true,
      message: "Admin reply posted and published successfully!",
      reply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment content (Admin)
// @route   PUT /api/comments/:id
// @access  Admin
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    const { name, email, comment: commentText, status } = req.body;

    if (name) comment.name = name.trim();
    if (email) comment.email = email.trim().toLowerCase();
    if (commentText) comment.comment = commentText.trim();
    if (status) comment.status = status.toLowerCase() === "published" ? "published" : "draft";

    await comment.save();

    res.json({
      success: true,
      message: "Comment updated successfully.",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment and its nested replies (Admin)
// @route   DELETE /api/comments/:id
// @access  Admin
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Delete comment and its replies
    await Comment.deleteMany({
      $or: [{ _id: comment._id }, { parentComment: comment._id }],
    });

    res.json({
      success: true,
      message: "Comment and any child replies deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  getCommentsByBlog,
  updateCommentStatus,
  adminReplyComment,
  updateComment,
  deleteComment,
};

