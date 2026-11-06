const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Plan title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      trim: true,
    },
    period: {
      type: String,
      enum: ["MO", "YR", "WK", "DAY"],
      default: "MO",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

