const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog reference is required"],
    },
    blogTitle: {
      type: String,
      default: "",
      trim: true,
    },
    blogSlug: {
      type: String,
      default: "",
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    comment: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [5, "Comment must be at least 5 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying & anti-duplication
commentSchema.index({ blog: 1, status: 1, createdAt: -1 });
commentSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);

