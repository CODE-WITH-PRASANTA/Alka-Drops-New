const Order = require("../models/Order");
const Product = require("../models/Product");
const DeliveryBoy = require("../models/DeliveryBoy");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";
  return new Razorpay({ key_id, key_secret });
};

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

    // Send order confirmation email asynchronously via Nodemailer
    const { sendOrderConfirmationEmail } = require("../services/emailService");
    sendOrderConfirmationEmail({
      order,
      customerEmail: order.shippingAddress?.email,
      customerName: order.shippingAddress?.fullName,
    }).catch((err) => console.error("Failed to send order confirmation email:", err.message));

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
    const { status, paymentStatus, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status.toLowerCase().replace(/\s+/g, "_");
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus.toLowerCase();
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
      .populate("assignedDeliveryBoy")
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
      order = await Order.findById(id).populate("assignedDeliveryBoy");
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: id }).populate("assignedDeliveryBoy");
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

    if (req.body.deliveryBoyId !== undefined) {
      const dbId = req.body.deliveryBoyId;
      if (!dbId || dbId === "unassigned") {
        order.assignedDeliveryBoy = null;
        order.deliveryBoy = {
          id: "",
          name: "Unassigned",
          phone: "",
          partnerId: "",
          vehicleNumber: "",
        };
      } else {
        const rider = await DeliveryBoy.findById(dbId);
        if (rider) {
          order.assignedDeliveryBoy = rider._id;
          order.deliveryBoy = {
            id: rider._id.toString(),
            name: rider.name,
            phone: rider.phone,
            partnerId: rider.partnerId,
            vehicleNumber: rider.vehicleNumber,
          };
        }
      }
    }

    await order.save();
    await order.populate("assignedDeliveryBoy");

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

// @desc    Assign delivery partner to order
// @route   PUT /api/orders/:id/assign-delivery-boy
// @access  Public / Admin
const assignDeliveryBoy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryBoyId } = req.body;

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

    if (!deliveryBoyId || deliveryBoyId === "unassigned" || deliveryBoyId === "") {
      order.assignedDeliveryBoy = null;
      order.deliveryBoy = {
        id: "",
        name: "Unassigned",
        phone: "",
        partnerId: "",
        vehicleNumber: "",
      };
      await order.save();
      return res.json({
        success: true,
        message: "Delivery partner unassigned.",
        order,
      });
    }

    // Find rider
    let rider = null;
    if (deliveryBoyId.match(/^[0-9a-fA-F]{24}$/)) {
      rider = await DeliveryBoy.findById(deliveryBoyId);
    }
    if (!rider) {
      rider = await DeliveryBoy.findOne({ partnerId: deliveryBoyId });
    }

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found.",
      });
    }

    order.assignedDeliveryBoy = rider._id;
    order.deliveryBoy = {
      id: rider._id.toString(),
      name: rider.name,
      phone: rider.phone,
      partnerId: rider.partnerId,
      vehicleNumber: rider.vehicleNumber,
    };

    // If order was in 'confirmed' or 'processing', assigning delivery partner can set orderStatus or leave as is
    await order.save();
    await order.populate("assignedDeliveryBoy");

    return res.json({
      success: true,
      message: `Assigned ${rider.name} (${rider.partnerId}) to order #${order.orderNumber}.`,
      order,
    });
  } catch (error) {
    console.error("Assign Delivery Boy Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign delivery personnel.",
    });
  }
};

// @desc    Submit delivery completion for shop order
// @route   POST /api/orders/:id/submit-delivery
// @access  Public / Admin / Delivery Boy
const submitShopOrderDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      deliveredBy,
      partnerId,
      emptyJarsCollected = 0,
      deliveryNotes = "",
      proofReceivedBy = "",
    } = req.body;

    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.orderStatus = "delivered";
    if (order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    const riderName =
      deliveredBy ||
      (order.deliveryBoy?.name && order.deliveryBoy.name !== "Unassigned"
        ? order.deliveryBoy.name
        : "Delivery Boy");
    const pId = partnerId || order.deliveryBoy?.partnerId || "";

    const numEmpties = Math.max(0, Number(emptyJarsCollected) || 0);
    const deliveredJarsCount = Array.isArray(order.items)
      ? order.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
      : 1;
    const pendingEmpties = Math.max(0, deliveredJarsCount - numEmpties);

    let emptyJarStatus = "Collected";
    if (numEmpties === 0) {
      emptyJarStatus = "Not Returned / Pending";
    } else if (numEmpties < deliveredJarsCount) {
      emptyJarStatus = "Partial Return";
    }

    order.deliveryDetails = {
      deliveredAt: new Date(),
      deliveredBy: riderName,
      partnerId: pId,
      emptyJarsCollected: numEmpties,
      pendingEmptyJars: pendingEmpties,
      emptyJarStatus,
      emptyJarReason: req.body.emptyJarReason
        ? req.body.emptyJarReason.trim()
        : numEmpties === 0
        ? "Customer did not return empty jar today"
        : "",
      deliveryNotes: deliveryNotes ? deliveryNotes.trim() : "Delivered to customer",
      proofReceivedBy: proofReceivedBy
        ? proofReceivedBy.trim()
        : order.shippingAddress?.fullName || "Customer",
    };

    await order.save();
    await order.populate("assignedDeliveryBoy");

    return res.json({
      success: true,
      message: `Order #${order.orderNumber} successfully marked as Delivered!`,
      order,
    });
  } catch (error) {
    console.error("Submit Shop Order Delivery Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit order delivery.",
    });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay/create-order
// @access  Public or Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes = {} } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive amount is required to initiate Razorpay checkout.",
      });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(numericAmount * 100), // convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        company: "Alka Drops",
        ...notes,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4",
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Failed to initialize Razorpay checkout order.",
    });
  }
};

// @desc    Verify Razorpay Payment Signature and finalize order
// @route   POST /api/orders/razorpay/verify-payment
// @access  Public or Private
const verifyRazorpayPayment = async (req, res) => {
  const reservedItems = [];
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      shippingAddress,
      shippingCost = 0,
      discountAmount = 0,
      deliverySlot = "Standard (1-2 days)",
      notes = "",
    } = req.body;

    // 1. Signature Verification
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay verification tokens (orderId, paymentId, signature).",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment verification failed: Invalid transaction signature.",
      });
    }

    // 2. Validate Items & Address
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart has no items to process.",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.addressLine1?.trim() ||
      !shippingAddress.city?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A selected delivery address with name, phone, street, and city is required.",
      });
    }

    // 3. Atomically reserve inventory & compute server verified pricing
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const orderQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const productId = item.product || item._id || item.id;

      let verifiedPrice = Number(item.price);
      let verifiedTitle = item.title || item.name || "Alka Drops Bottle";
      let verifiedImage = item.image || "";
      let verifiedSize = item.size || item.liter || "1 Litre";

      if (productId && productId.toString().match(/^[0-9a-fA-F]{24}$/)) {
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
          const currentProd = await Product.findById(productId);
          const available = currentProd ? currentProd.quantity : 0;
          for (const reserved of reservedItems) {
            await Product.findByIdAndUpdate(reserved.productId, {
              $inc: { quantity: reserved.qty },
            });
          }
          return res.status(400).json({
            success: false,
            message: `Stock ran out for "${verifiedTitle}". Only ${available} unit(s) available.`,
          });
        }

        reservedItems.push({ productId, qty: orderQty });

        if (productDoc.quantity <= 0) {
          productDoc.inStock = false;
          await productDoc.save();
        }

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

    const numShipping = Math.max(0, Number(shippingCost) || 0);
    const numDiscount = Math.max(0, Number(discountAmount) || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal + numShipping - numDiscount);

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
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      orderStatus: "confirmed",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      deliverySlot,
      notes: notes ? notes.trim() : "",
    });

    // Send order confirmation email asynchronously
    const { sendOrderConfirmationEmail } = require("../services/emailService");
    sendOrderConfirmationEmail({
      order,
      customerEmail: order.shippingAddress?.email,
      customerName: order.shippingAddress?.fullName,
    }).catch((err) => console.error("Failed to send order confirmation email:", err.message));

    return res.status(201).json({
      success: true,
      message: `Razorpay payment verified! Order #${order.orderNumber} confirmed.`,
      order,
    });
  } catch (error) {
    for (const reserved of reservedItems) {
      try {
        await Product.findByIdAndUpdate(reserved.productId, {
          $inc: { quantity: reserved.qty },
        });
      } catch (rbErr) {
        console.error("Rollback error:", rbErr);
      }
    }
    console.error("Verify Razorpay Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to finalize paid order.",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryBoy,
  submitShopOrderDelivery,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
