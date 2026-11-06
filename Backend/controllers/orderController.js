const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create new order with atomic inventory reservation
// @route   POST /api/orders
// @access  Public or Private
const createOrder = async (req, res, next) => {
  const reservedItems = []; // Track reserved inventory for rollback if transaction fails

  try {
    const {
      items,
      shippingAddress,
      shippingCost = 0,
      discountAmount = 0,
      paymentMethod = "cod",
      deliverySlot = "Standard (1-2 days)",
      notes = "",
    } = req.body;

    // 1. Validate Items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order must contain at least one item.",
      });
    }

    // 2. Validate Shipping Address
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.addressLine1?.trim() ||
      !shippingAddress.city?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping details (Name, Phone, Address, City).",
      });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // 3. Atomically check and reserve stock for each product
    for (const item of items) {
      const orderQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const productId = item.product || item._id || item.id;

      let verifiedPrice = Number(item.price);
      let verifiedTitle = item.title || item.name || "Alka Drops Bottle";
      let verifiedImage = item.image || "";
      let verifiedSize = item.size || item.liter || "1 Litre";

      if (productId && productId.toString().match(/^[0-9a-fA-F]{24}$/)) {
        // Atomic decrement using conditional query to prevent race conditions / negative stock
        const productDoc = await Product.findOneAndUpdate(
          {
            _id: productId,
            quantity: { $gte: orderQty },
          },
          {
            $inc: { quantity: -orderQty },
          },
          { new: true }
        );

        if (!productDoc) {
          // Check current stock to provide informative human-readable message
          const currentProd = await Product.findById(productId);
          const available = currentProd ? currentProd.quantity : 0;

          // Rollback any items already reserved in this request
          for (const reserved of reservedItems) {
            await Product.findByIdAndUpdate(reserved.productId, {
              $inc: { quantity: reserved.qty },
            });
          }

          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${verifiedTitle}". Only ${available} unit(s) available.`,
          });
        }

        // Track successful reservation
        reservedItems.push({ productId, qty: orderQty });

        // Update inStock flag if depleted
        if (productDoc.quantity <= 0) {
          productDoc.inStock = false;
          await productDoc.save();
        }

        // Use authoritative server-side pricing to prevent tampering
        verifiedPrice = productDoc.price;
        verifiedTitle = productDoc.title || productDoc.name;
        verifiedImage = productDoc.image || verifiedImage;
        verifiedSize = productDoc.liter || productDoc.size || verifiedSize;
      }

      calculatedSubtotal += verifiedPrice * orderQty;

      validatedItems.push({
        product: productId && productId.toString().match(/^[0-9a-fA-F]{24}$/) ? productId : null,
        title: verifiedTitle,
        price: verifiedPrice,
        quantity: orderQty,
        image: verifiedImage,
        size: verifiedSize,
      });
    }

    // 4. Calculate total securely on backend
    const numShipping = Math.max(0, Number(shippingCost) || 0);
    const numDiscount = Math.max(0, Number(discountAmount) || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal + numShipping - numDiscount);

    // 5. Generate unique human-readable order number with timestamp + randomness
    const orderNumber =
      "ALK-" +
      Date.now().toString().slice(-6) +
      "-" +
      Math.floor(100 + Math.random() * 900);

    const order = await Order.create({
      user: req.user ? req.user.id : null,
      orderNumber,
      items: validatedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: shippingAddress.email ? shippingAddress.email.trim().toLowerCase() : "support@alkadrops.com",
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2 ? shippingAddress.addressLine2.trim() : "",
        city: shippingAddress.city.trim(),
        state: shippingAddress.state ? shippingAddress.state.trim() : "Odisha",
        postalCode: shippingAddress.postalCode ? shippingAddress.postalCode.trim() : "751012",
      },
      subtotal: calculatedSubtotal,
      shippingCost: numShipping,
      discountAmount: numDiscount,
      totalAmount: calculatedTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: "processing",
      deliverySlot,
      notes: notes ? notes.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: `Order #${order.orderNumber} placed successfully!`,
      order,
    });
  } catch (error) {
    // Rollback any reserved stock on unhandled errors
    for (const reserved of reservedItems) {
      try {
        await Product.findByIdAndUpdate(reserved.productId, {
          $inc: { quantity: reserved.qty },
        });
      } catch (rbErr) {
        console.error("Rollback error:", rbErr);
      }
    }
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process order.",
    });
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
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user orders.",
    });
  }
};

// @desc    Get all orders with filtering & pagination
// @route   GET /api/orders
// @access  Public / Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status.toLowerCase().replace(/\s+/g, "_");
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { orderNumber: { $regex: s, $options: "i" } },
        { "shippingAddress.fullName": { $regex: s, $options: "i" } },
        { "shippingAddress.phone": { $regex: s, $options: "i" } },
        { "items.title": { $regex: s, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 100);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
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
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order details.",
    });
  }
};

// @desc    Update order status with inventory rollback on cancellation
// @route   PUT /api/orders/:id/status
// @access  Public / Admin
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

    const previousStatus = order.orderStatus;
    const nextStatus = orderStatus ? orderStatus.toLowerCase().replace(/\s+/g, "_") : previousStatus;

    // Handle cancellation: restore inventory if previously uncancelled
    if (nextStatus === "cancelled" && previousStatus !== "cancelled") {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: item.quantity },
            inStock: true,
          });
        }
      }
    }

    // Handle un-cancelling (restoring to processing): re-decrement if was cancelled
    if (previousStatus === "cancelled" && nextStatus !== "cancelled") {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: -item.quantity },
          });
        }
      }
    }

    if (orderStatus) order.orderStatus = nextStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus.toLowerCase();

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${order.orderStatus}.`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status.",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
