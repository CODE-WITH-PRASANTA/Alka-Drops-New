const Order = require("../models/Order");

// @desc    Create new order
// @route   POST /api/orders
// @access  Public or Private
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      shippingCost,
      discountAmount,
      totalAmount,
      paymentMethod,
      deliverySlot,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items specified.",
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1) {
      return res.status(400).json({
        success: false,
        message: "Shipping address details are incomplete.",
      });
    }

    const orderNumber = "ALK-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);

    const order = await Order.create({
      user: req.user ? req.user.id : null,
      orderNumber,
      items,
      shippingAddress,
      subtotal: Number(subtotal) || Number(totalAmount),
      shippingCost: Number(shippingCost) || 0,
      discountAmount: Number(discountAmount) || 0,
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || "cod",
      deliverySlot: deliverySlot || "Standard (1-2 days)",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully!",
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

