const SubscriptionOrder = require("../models/SubscriptionOrder");
const User = require("../models/User");

// @desc    Create new subscription order
// @route   POST /api/subscription-orders
// @access  Public / Optional Auth
const createSubscriptionOrder = async (req, res, next) => {
  try {
    const {
      planId,
      planTitle,
      planPrice,
      period,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      startDate,
      endDate,
      deliveryFrequency,
      deliverySlot,
      bottlesPerDelivery,
      paymentMethod,
      notes,
    } = req.body;

    if (!planTitle) {
      return res.status(400).json({ success: false, message: "Subscription plan title is required." });
    }
    if (!customerName || !customerPhone || !customerEmail) {
      return res.status(400).json({ success: false, message: "Customer name, email, and phone number are required." });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Both subscription start date and end date are required." });
    }

    // Clean numeric price
    const cleanPrice = String(planPrice || "1499").replace(/[^0-9.]/g, "");
    const totalAmount = Number(cleanPrice) || 1499;

    // Unique Subscription Order Number
    const orderNumber = `SUB-${Math.floor(100000 + Math.random() * 900000)}`;

    // Identify user
    let userId = req.user?.id || null;
    let linkedUser = null;

    if (userId) {
      linkedUser = await User.findById(userId);
    } else if (customerEmail) {
      linkedUser = await User.findOne({ email: customerEmail.trim().toLowerCase() });
      if (linkedUser) userId = linkedUser._id;
    }

    const order = await SubscriptionOrder.create({
      orderNumber,
      user: userId,
      planId: planId || "",
      planTitle: planTitle.trim(),
      planPrice: String(planPrice || "1,499").trim(),
      period: period || "MO",
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: {
        street: deliveryAddress?.street?.trim() || "",
        city: deliveryAddress?.city?.trim() || "Bhubaneswar",
        state: deliveryAddress?.state?.trim() || "Odisha",
        postalCode: deliveryAddress?.postalCode?.trim() || "751012",
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      deliveryFrequency: deliveryFrequency || "Alternate Days",
      deliverySlot: deliverySlot || "Morning (7 AM - 10 AM)",
      bottlesPerDelivery: Number(bottlesPerDelivery) || 2,
      totalAmount,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "online" ? "Paid" : "Pending",
      status: "Active",
      notes: notes?.trim() || "",
    });

    // If a linked user exists, immediately synchronize their active subscription in User model
    if (linkedUser) {
      linkedUser.subscription = {
        planId: planId || "",
        planTitle: planTitle.trim(),
        status: "Active",
        cadence: deliveryFrequency || "Alternate Days",
        bottlesPerDelivery: Number(bottlesPerDelivery) || 2,
        deliveryTimeSlot: deliverySlot || "Morning (7 AM - 10 AM)",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        nextDeliveryDate: new Date(startDate),
        pricePerDelivery: Math.round(totalAmount / 15) || 120,
        autoRenew: true,
      };

      if (deliveryAddress?.street) {
        linkedUser.address = {
          street: deliveryAddress.street.trim(),
          city: deliveryAddress.city?.trim() || linkedUser.address?.city || "Bhubaneswar",
          state: deliveryAddress.state?.trim() || linkedUser.address?.state || "Odisha",
          postalCode: deliveryAddress.postalCode?.trim() || linkedUser.address?.postalCode || "751012",
        };
      }

      if (linkedUser.role === "Retail Customer" || linkedUser.role === "user") {
        linkedUser.role = "Subscriber";
      }

      await linkedUser.save();
    }

    res.status(201).json({
      success: true,
      message: `Subscription for ${planTitle} activated successfully! Order #${orderNumber}`,
      order,
      user: linkedUser
        ? {
            id: linkedUser._id,
            name: linkedUser.name,
            email: linkedUser.email,
            role: linkedUser.role,
            subscription: linkedUser.subscription,
            address: linkedUser.address,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscription orders for Admin Panel
// @route   GET /api/subscription-orders
// @access  Public / Admin
const getAllSubscriptionOrders = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = new RegExp(`^${status.trim()}$`, "i");
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { orderNumber: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
        { customerPhone: { $regex: q, $options: "i" } },
        { planTitle: { $regex: q, $options: "i" } },
        { "deliveryAddress.street": { $regex: q, $options: "i" } },
        { "deliveryAddress.city": { $regex: q, $options: "i" } },
        { "deliveryBoy.name": { $regex: q, $options: "i" } },
      ];
    }

    const orders = await SubscriptionOrder.find(filter).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const activeCount = orders.filter((o) => o.status === "Active").length;
    const pausedCount = orders.filter((o) => o.status === "Paused").length;
    const totalDailyJars = orders
      .filter((o) => o.status === "Active")
      .reduce((sum, o) => sum + (o.bottlesPerDelivery || 1), 0);

    res.json({
      success: true,
      count: orders.length,
      orders,
      stats: {
        totalOrders,
        activeCount,
        pausedCount,
        totalDailyJars,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription orders for currently logged in user
// @route   GET /api/subscription-orders/my-subscriptions
// @access  Private
const getMySubscriptionOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const matchQueries = [{ user: userId }];
    if (user?.email) matchQueries.push({ customerEmail: user.email.toLowerCase() });
    if (user?.phone && user.phone.trim().length >= 8) {
      matchQueries.push({ customerPhone: user.phone.trim() });
    }

    const orders = await SubscriptionOrder.find({ $or: matchQueries }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
      activeSubscription: orders.find((o) => o.status === "Active") || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription order status
// @route   PATCH /api/subscription-orders/:id/status
// @access  Admin
const updateSubscriptionOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    const order = await SubscriptionOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Subscription order not found." });
    }

    order.status = status;
    await order.save();

    // If order is linked to a user, synchronize user.subscription.status
    if (order.user) {
      await User.findByIdAndUpdate(order.user, {
        "subscription.status": status === "Active" ? "Active" : status === "Paused" ? "Paused" : "Cancelled",
      });
    }

    res.json({
      success: true,
      message: `Subscription order #${order.orderNumber} is now ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery partner
// @route   PATCH /api/subscription-orders/:id/assign
// @access  Admin
const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryBoyName, deliveryBoyPhone } = req.body;

    const order = await SubscriptionOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Subscription order not found." });
    }

    order.deliveryBoy = {
      name: deliveryBoyName || "Unassigned",
      phone: deliveryBoyPhone || "",
    };

    await order.save();

    res.json({
      success: true,
      message: `Assigned ${deliveryBoyName} to subscription order #${order.orderNumber}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscription order
// @route   DELETE /api/subscription-orders/:id
// @access  Admin
const deleteSubscriptionOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await SubscriptionOrder.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Subscription order not found." });
    }

    res.json({
      success: true,
      message: `Subscription order #${order.orderNumber} permanently removed.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscriptionOrder,
  getAllSubscriptionOrders,
  getMySubscriptionOrders,
  updateSubscriptionOrderStatus,
  assignDeliveryPartner,
  deleteSubscriptionOrder,
};

