const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customer: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: "Verified Customer",
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    product: {
      type: String,
      default: "Alka Drops 20L Premium Alkaline Jar",
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      default: 5,
    },
    title: {
      type: String,
      default: "Pure & Crisp Alkaline Water",
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Review comment/feedback is required"],
      trim: true,
    },
    text: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Published", "Pending", "Hidden"],
      default: "Published",
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminReply: {
      type: String,
      default: "",
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize alias fields before saving
reviewSchema.pre("save", function (next) {
  if (!this.customer && this.name) this.customer = this.name;
  if (!this.name && this.customer) this.name = this.customer;

  if (!this.image && this.avatar) this.image = this.avatar;
  if (!this.avatar && this.image) this.avatar = this.image;

  if (!this.text && this.comment) this.text = this.comment;
  if (!this.comment && this.text) this.comment = this.text;
  if (!this.feedback && this.comment) this.feedback = this.comment;

  next();
});

// Indexes for fast lookup by status, rating, and creation date
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

module.exports = mongoose.model("Review", reviewSchema);

