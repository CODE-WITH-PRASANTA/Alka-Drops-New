const SubscriptionPlan = require("../models/SubscriptionPlan");

const defaultPlans = [
  {
    title: "Basic Plan",
    subtitle: "*Home & Small Families",
    price: "1,499",
    period: "MO",
    description: "Ideal 20 litre water supply home delivery package designed for small households in Bhubaneswar.",
    features: [
      "Free Doorstep Delivery",
      "Max 10 Bottles / Month (20L)",
      "Empty Bottle Pickup",
      "Max 120 Bottles / Year",
      "Mineral Wellness Water",
    ],
    featured: false,
    status: "Active",
    order: 1,
  },
  {
    title: "Premium Plan",
    subtitle: "*BEST VALUE ANNUAL SUBSCRIPTION",
    price: "2,999",
    period: "YR",
    description: "Premium mineral water supply with enriched alkalinity and essential minerals for total wellness.",
    features: [
      "Free Express Delivery",
      "Max 10 Bottles / Month (20L)",
      "Empty Bottle Pickup",
      "Max 120 Bottles / Year",
      "Mineral Wellness Water",
    ],
    featured: true,
    status: "Active",
    order: 2,
  },
  {
    title: "Advanced Plan",
    subtitle: "*Workplaces, Gyms & Studios",
    price: "2,199",
    period: "MO",
    description: "High-demand drinking water supply for corporate offices, gyms, and commercial centers across Bhubaneswar.",
    features: [
      "Priority Free Delivery",
      "Max 15 Bottles / Month (20L)",
      "Empty Bottle Pickup",
      "Flexible Bottle Replacements",
      "Certified Pure Mineral Water",
    ],
    featured: false,
    status: "Active",
    order: 3,
  },
];

// @desc    Get all subscription plans
// @route   GET /api/subscription-plans
// @access  Public
const getPlans = async (req, res, next) => {
  try {
    let plans = await SubscriptionPlan.find().sort({ order: 1, createdAt: 1 });

    // Auto seed if empty
    if (plans.length === 0) {
      plans = await SubscriptionPlan.insertMany(defaultPlans);
    }

    res.json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subscription plan
// @route   POST /api/subscription-plans
// @access  Admin
const createPlan = async (req, res, next) => {
  try {
    const { title, subtitle, price, period, description, features, featured, status, order } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: "Title and price are required.",
      });
    }

    // Process features array if passed as string or array
    let processedFeatures = [];
    if (Array.isArray(features)) {
      processedFeatures = features.filter((f) => f && f.trim());
    } else if (typeof features === "string") {
      processedFeatures = features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    const plan = await SubscriptionPlan.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      price: price.toString().trim(),
      period: period || "MO",
      description: description ? description.trim() : "",
      features: processedFeatures,
      featured: Boolean(featured),
      status: status || "Active",
      order: order ? parseInt(order, 10) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully.",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subscription plan
// @route   PUT /api/subscription-plans/:id
// @access  Admin
const updatePlan = async (req, res, next) => {
  try {
    const { title, subtitle, price, period, description, features, featured, status, order } = req.body;

    let processedFeatures = undefined;
    if (features !== undefined) {
      if (Array.isArray(features)) {
        processedFeatures = features.filter((f) => f && f.trim());
      } else if (typeof features === "string") {
        processedFeatures = features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean);
      }
    }

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
      ...(price && { price: price.toString().trim() }),
      ...(period && { period }),
      ...(description !== undefined && { description: description.trim() }),
      ...(processedFeatures !== undefined && { features: processedFeatures }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
      ...(status && { status }),
      ...(order !== undefined && { order: parseInt(order, 10) }),
    };

    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    res.json({
      success: true,
      message: "Subscription plan updated successfully.",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subscription plan
// @route   DELETE /api/subscription-plans/:id
// @access  Admin
const deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    res.json({
      success: true,
      message: "Subscription plan deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};

