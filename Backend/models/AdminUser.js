const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD format e.g. "2026-11-12"
      required: true,
    },
    clockIn: {
      type: Date,
      default: Date.now,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Present", "On Duty", "Completed", "Half Day", "Leave"],
      default: "Present",
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    jarsDelivered: {
      type: Number,
      default: 0,
    },
    emptyJarsCollected: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    clockInLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      address: { type: String, default: "" },
    },
    clockOutLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      address: { type: String, default: "" },
    },
  },
  { _id: true, timestamps: true }
);

const adminUserSchema = new mongoose.Schema(
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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "delivery_boy"],
      default: "admin",
      index: true,
    },
    partnerId: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
      index: true,
    },
    deliveryBoyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    dutyStatus: {
      type: String,
      enum: ["On Duty", "Off Duty"],
      default: "On Duty",
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    attendance: [attendanceSchema],
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminUserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("AdminUser", adminUserSchema);

