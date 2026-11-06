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
    role: {
      type: String,
      enum: ["user", "admin", "Subscriber", "Retail Customer", "Corporate", "Administrator"],
      default: "Retail Customer",
    },
    status: {
      type: String,
      enum: ["Active", "Blocked", "Inactive"],
      default: "Active",
    },
    plan: {
      type: String,
      default: "Standard Retail",
      trim: true,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "Bhubaneswar" },
      state: { type: String, default: "Odisha" },
      postalCode: { type: String, default: "751012" },
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
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


