const mongoose = require("mongoose");

const subscriptionOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    planId: {
      type: String,
      default: "",
    },
    planTitle: {
      type: String,
      required: [true, "Plan title is required"],
      trim: true,
    },
    planPrice: {
      type: String,
      default: "1,499",
      trim: true,
    },
    period: {
      type: String,
      default: "MO",
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "Bhubaneswar" },
      state: { type: String, default: "Odisha" },
      postalCode: { type: String, default: "751012" },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    deliveryFrequency: {
      type: String,
      enum: ["Daily", "Alternate Days", "Twice a Week", "Weekly"],
      default: "Alternate Days",
    },
    deliverySlot: {
      type: String,
      default: "Morning (7 AM - 10 AM)",
      trim: true,
    },
    bottlesPerDelivery: {
      type: Number,
      default: 2,
    },
    totalAmount: {
      type: Number,
      default: 1499,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "online"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Paused", "Completed", "Cancelled"],
      default: "Active",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },
    deliveryBoy: {
      id: { type: String, default: "" },
      name: { type: String, default: "Unassigned" },
      phone: { type: String, default: "" },
      partnerId: { type: String, default: "" },
      vehicleNumber: { type: String, default: "" },
    },
    totalQuotaJars: {
      type: Number,
      default: 30,
    },
    bottlesDelivered: {
      type: Number,
      default: 0,
    },
    emptyJarsCollected: {
      type: Number,
      default: 0,
    },
    pendingEmptyJars: {
      type: Number,
      default: 0,
    },
    dailyDrops: [
      {
        dropDate: { type: Date, default: Date.now },
        bottlesDelivered: { type: Number, default: 2 },
        emptyJarsCollected: { type: Number, default: 0 },
        emptyJarStatus: {
          type: String,
          enum: ["Collected", "Not Returned / Pending", "Partial Return", "Extra Collected"],
          default: "Collected",
        },
        emptyJarReason: { type: String, default: "" },
        deliveredBy: { type: String, default: "" },
        partnerId: { type: String, default: "" },
        status: {
          type: String,
          enum: ["Delivered", "Missed", "Skipped", "Pending"],
          default: "Delivered",
        },
        notes: { type: String, default: "" },
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

subscriptionOrderSchema.index({ orderNumber: 1, user: 1, status: 1 });

module.exports = mongoose.model("SubscriptionOrder", subscriptionOrderSchema);

