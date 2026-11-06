const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Image title is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      trim: true,
      default: "Alkaline Water",
    },
    alt: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ category: 1, status: 1 });
gallerySchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model("Gallery", gallerySchema);

