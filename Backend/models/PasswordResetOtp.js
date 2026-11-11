const mongoose = require("mongoose");

const passwordResetOtpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: "",
    },
    userType: {
      type: String,
      enum: ["User", "AdminUser", "DeliveryBoy"],
      default: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes TTL
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PasswordResetOtp", passwordResetOtpSchema);

