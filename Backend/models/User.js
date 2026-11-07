const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    googleId: {
      type: String,
      default: "",
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin", "Subscriber", "Retail Customer", "Corporate", "Administrator", "Delivery Boy", "delivery boy"],
      default: "Retail Customer",
    },
    status: {
      type: String,
      enum: ["Active", "Deactive", "Blocked", "Inactive"],
      default: "Active",
    },
    plan: {
      type: String,
      default: "Standard Retail",
      trim: true,
    },
    subscription: {
      planId: { type: String, default: "" },
      planTitle: { type: String, default: "Daily Alkaline Water (20L Can)" },
      status: { type: String, enum: ["Active", "Paused", "Cancelled", "None"], default: "Active" },
      cadence: { type: String, default: "Alternate Days" },
      bottlesPerDelivery: { type: Number, default: 2 },
      deliveryTimeSlot: { type: String, default: "Morning (7 AM - 10 AM)" },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
      nextDeliveryDate: { type: Date },
      pricePerDelivery: { type: Number, default: 120 },
      autoRenew: { type: Boolean, default: true },
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "Bhubaneswar" },
      state: { type: String, default: "Odisha" },
      postalCode: { type: String, default: "751012" },
    },
    addresses: [
      {
        label: { type: String, default: "Home" },
        recipientName: { type: String, default: "" },
        phone: { type: String, default: "" },
        street: { type: String, default: "" },
        city: { type: String, default: "Bhubaneswar" },
        state: { type: String, default: "Odisha" },
        postalCode: { type: String, default: "751012" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    ordersCount: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for quick lookups, auth and admin queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);


