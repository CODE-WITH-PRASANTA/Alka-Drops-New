const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    comment: { type: String, required: true },
    website: { type: String, default: "" },
    avatar: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "Water & Health",
      trim: true,
    },
    author: {
      type: String,
      default: "Alka Drops Team",
      trim: true,
    },
    postedBy: {
      type: String,
      trim: true,
    },
    authorRole: {
      type: String,
      default: "Hydration Expert",
      trim: true,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    tags: {
      type: [String],
      default: ["Alkaline Water"],
    },
    quote: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    excerpt: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    // Single Blog Image (WebP)
    coverImage: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    featuredImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "draft", "scheduled", "Published", "Draft", "Scheduled"],
      default: "published",
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save to synchronize aliases and slug
blogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Sync author and postedBy
  if (!this.author && this.postedBy) {
    this.author = this.postedBy;
  } else if (!this.postedBy && this.author) {
    this.postedBy = this.author;
  }

  // Sync content and description
  if (!this.content && this.description) {
    this.content = this.description;
  } else if (!this.description && this.content) {
    this.description = this.content;
  }

  // Sync single image fields
  const img = this.featuredImage || this.coverImage || this.image;
  if (img) {
    this.featuredImage = img;
    this.coverImage = img;
    this.image = img;
  }

  next();
});

module.exports = mongoose.model("Blog", blogSchema);
