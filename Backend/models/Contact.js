const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      default: "General Inquiry",
      trim: true,
    },
    interest: {
      type: String,
      default: "Water Delivery",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "unread", "read", "replied"],
      default: "Pending",
    },
    adminReply: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for anti-duplication queries and admin filtering
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Contact", contactSchema);
