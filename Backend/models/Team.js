const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team member name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role or designation is required"],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: "Operations",
    },
    image: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    experience: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
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

// Index for quick search and sorting
teamSchema.index({ name: "text", role: "text", department: "text" });
teamSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model("Team", teamSchema);

