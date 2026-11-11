const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: "" },
  size: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      postalCode: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "online", "razorpay"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "processing",
    },
    deliverySlot: {
      type: String,
      default: "Standard (1-2 days)",
    },
    notes: {
      type: String,
      default: "",
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
    deliveryDetails: {
      deliveredAt: { type: Date, default: null },
      deliveredBy: { type: String, default: "" },
      partnerId: { type: String, default: "" },
      emptyJarsCollected: { type: Number, default: 0 },
      pendingEmptyJars: { type: Number, default: 0 },
      emptyJarStatus: {
        type: String,
        enum: ["Collected", "Not Returned / Pending", "Partial Return", "No Empty Jars"],
        default: "Collected",
      },
      emptyJarReason: { type: String, default: "" },
      deliveryNotes: { type: String, default: "" },
      proofReceivedBy: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performant filtering, sorting & customer lookups
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "shippingAddress.phone": 1 });

module.exports = mongoose.model("Order", orderSchema);

