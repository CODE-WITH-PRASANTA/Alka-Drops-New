const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: "", trim: true },
    city: { type: String, default: "Bhubaneswar", trim: true },
    state: { type: String, default: "Odisha", trim: true },
    postalCode: { type: String, default: "751012", trim: true },
  },
  { _id: false }
);

const deliveryBoySchema = new mongoose.Schema(
  {
    partnerId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Delivery personnel full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "Delivery Boy",
      enum: ["Delivery Boy", "delivery boy"],
    },
    aadharNumber: {
      type: String,
      required: [true, "Aadhar card number is required"],
      trim: true,
    },
    panNumber: {
      type: String,
      required: [true, "PAN card number is required"],
      trim: true,
      uppercase: true,
    },
    presentAddress: {
      type: addressSchema,
      default: () => ({}),
    },
    permanentAddress: {
      type: addressSchema,
      default: () => ({}),
    },
    vehicleType: {
      type: String,
      default: "Electric Loader Van",
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle registration number is required"],
      trim: true,
      uppercase: true,
    },
    route: {
      type: String,
      default: "Zone A - Nayapalli / IRC Village",
      trim: true,
    },
    dailyQuota: {
      type: String,
      default: "120 Jars",
      trim: true,
    },
    activeOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["On Duty", "Off Duty", "Active", "Inactive"],
      default: "On Duty",
    },
    badgeColor: {
      type: String,
      default: "#0d9488",
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

deliveryBoySchema.index({ status: 1, route: 1 });
deliveryBoySchema.index({ createdAt: -1 });

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);

