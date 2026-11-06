const DeliveryBoy = require("../models/DeliveryBoy");
const User = require("../models/User");

// Helper to generate next unique Partner ID (e.g., ALK-DB-001)
const generatePartnerId = async () => {
  const count = await DeliveryBoy.countDocuments();
  let nextNum = count + 1;
  let candidate = `ALK-DB-${String(nextNum).padStart(3, "0")}`;

  // Ensure collision-free candidate
  while (await DeliveryBoy.findOne({ partnerId: candidate })) {
    nextNum += 1;
    candidate = `ALK-DB-${String(nextNum).padStart(3, "0")}`;
  }
  return candidate;
};

// @desc    Get all delivery boys with filtering & search
// @route   GET /api/delivery-boys
// @access  Public / Admin
const getDeliveryBoys = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = { $regex: new RegExp(`^${status.trim()}$`, "i") };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { partnerId: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
        { route: { $regex: s, $options: "i" } },
        { vehicleNumber: { $regex: s, $options: "i" } },
        { aadharNumber: { $regex: s, $options: "i" } },
        { panNumber: { $regex: s, $options: "i" } },
      ];
    }

    const riders = await DeliveryBoy.find(query).sort({ createdAt: -1 });
    const total = await DeliveryBoy.countDocuments();
    const activeDuty = await DeliveryBoy.countDocuments({ status: "On Duty" });
    const totalDispatched = riders.reduce((acc, r) => acc + (r.activeOrders || 0), 0);

    res.json({
      success: true,
      count: riders.length,
      total,
      riders,
      data: riders,
      stats: {
        total,
        activeDuty,
        totalDispatchedToday: totalDispatched,
        verifiedRate: "100%",
      },
    });
  } catch (error) {
    console.error("Error fetching delivery fleet:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch delivery fleet.",
    });
  }
};

// @desc    Get single delivery boy by ID or Partner ID
// @route   GET /api/delivery-boys/:id
// @access  Public / Admin
const getDeliveryBoyById = async (req, res) => {
  try {
    const { id } = req.params;
    let rider = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rider = await DeliveryBoy.findById(id).populate("user", "name email role status");
    }
    if (!rider) {
      rider = await DeliveryBoy.findOne({ partnerId: id.toUpperCase() }).populate(
        "user",
        "name email role status"
      );
    }

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found.",
      });
    }

    res.json({
      success: true,
      rider,
      data: rider,
    });
  } catch (error) {
    console.error("Error fetching delivery personnel details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch delivery personnel.",
    });
  }
};

// @desc    Generate delivery account and register delivery boy
// @route   POST /api/delivery-boys
// @access  Public / Admin
const createDeliveryBoy = async (req, res) => {
  let createdUser = null;
  try {
    const {
      name,
      email,
      password,
      phone,
      aadharNumber,
      panNumber,
      presentAddress,
      permanentAddress,
      vehicleType,
      vehicleNumber,
      route,
      dailyQuota,
      status,
      badgeColor,
      avatar,
      partnerId: customPartnerId,
    } = req.body;

    // Strict validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }
    if (!aadharNumber || !aadharNumber.trim()) {
      return res.status(400).json({ success: false, message: "Aadhar card number is required." });
    }
    if (!panNumber || !panNumber.trim()) {
      return res.status(400).json({ success: false, message: "PAN card number is required." });
    }
    if (!vehicleNumber || !vehicleNumber.trim()) {
      return res.status(400).json({ success: false, message: "Vehicle registration number is required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check email uniqueness across User and DeliveryBoy collections
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email "${cleanEmail}" already exists in the system.`,
      });
    }

    const existingRider = await DeliveryBoy.findOne({ email: cleanEmail });
    if (existingRider) {
      return res.status(400).json({
        success: false,
        message: `Delivery personnel with email "${cleanEmail}" is already registered.`,
      });
    }

    // Determine partner ID
    const partnerId = customPartnerId?.trim()
      ? customPartnerId.trim().toUpperCase()
      : await generatePartnerId();

    // Check partnerId uniqueness
    const idTaken = await DeliveryBoy.findOne({ partnerId });
    if (idTaken) {
      return res.status(400).json({
        success: false,
        message: `Partner ID "${partnerId}" is already assigned. Please choose another or let it auto-generate.`,
      });
    }

    // Step 1: Create the User account with role "Delivery Boy"
    const userPassword = password && password.length >= 6 ? password : "Alka@123456";
    createdUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: userPassword,
      phone: phone.trim(),
      role: "Delivery Boy",
      status: "Active",
      address: {
        street: presentAddress?.street || "",
        city: presentAddress?.city || "Bhubaneswar",
        state: presentAddress?.state || "Odisha",
        postalCode: presentAddress?.postalCode || "751012",
      },
    });

    // Step 2: Create the DeliveryBoy record
    const deliveryBoy = await DeliveryBoy.create({
      partnerId,
      user: createdUser._id,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: "Delivery Boy",
      aadharNumber: aadharNumber.trim(),
      panNumber: panNumber.trim().toUpperCase(),
      presentAddress: {
        street: presentAddress?.street || "",
        city: presentAddress?.city || "Bhubaneswar",
        state: presentAddress?.state || "Odisha",
        postalCode: presentAddress?.postalCode || "751012",
      },
      permanentAddress: {
        street: permanentAddress?.street || presentAddress?.street || "",
        city: permanentAddress?.city || presentAddress?.city || "Bhubaneswar",
        state: permanentAddress?.state || presentAddress?.state || "Odisha",
        postalCode: permanentAddress?.postalCode || presentAddress?.postalCode || "751012",
      },
      vehicleType: vehicleType?.trim() || "Electric Loader Van",
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      route: route?.trim() || "Zone A - Nayapalli / IRC Village",
      dailyQuota: dailyQuota?.trim() || "120 Jars",
      activeOrders: Number(req.body.activeOrders) || 0,
      status: status || "On Duty",
      badgeColor: badgeColor || "#0d9488",
      avatar: avatar?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: `Delivery account created successfully! Role assigned: "Delivery Boy". Partner ID: ${partnerId}`,
      rider: deliveryBoy,
      data: deliveryBoy,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        temporaryPassword: userPassword,
      },
    });
  } catch (error) {
    // Failure cleanup: Remove created User if DeliveryBoy creation failed
    if (createdUser && createdUser._id) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }

    console.error("Error creating delivery boy account:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create delivery account.",
    });
  }
};

// @desc    Update delivery boy details
// @route   PUT /api/delivery-boys/:id
// @access  Public / Admin
const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await DeliveryBoy.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy record not found.",
      });
    }

    const {
      name,
      phone,
      aadharNumber,
      panNumber,
      presentAddress,
      permanentAddress,
      vehicleType,
      vehicleNumber,
      route,
      dailyQuota,
      activeOrders,
      status,
      badgeColor,
      avatar,
    } = req.body;

    if (name) rider.name = name.trim();
    if (phone) rider.phone = phone.trim();
    if (aadharNumber) rider.aadharNumber = aadharNumber.trim();
    if (panNumber) rider.panNumber = panNumber.trim().toUpperCase();
    if (presentAddress) {
      rider.presentAddress = {
        street: presentAddress.street || rider.presentAddress.street,
        city: presentAddress.city || rider.presentAddress.city,
        state: presentAddress.state || rider.presentAddress.state,
        postalCode: presentAddress.postalCode || rider.presentAddress.postalCode,
      };
    }
    if (permanentAddress) {
      rider.permanentAddress = {
        street: permanentAddress.street || rider.permanentAddress.street,
        city: permanentAddress.city || rider.permanentAddress.city,
        state: permanentAddress.state || rider.permanentAddress.state,
        postalCode: permanentAddress.postalCode || rider.permanentAddress.postalCode,
      };
    }
    if (vehicleType) rider.vehicleType = vehicleType.trim();
    if (vehicleNumber) rider.vehicleNumber = vehicleNumber.trim().toUpperCase();
    if (route) rider.route = route.trim();
    if (dailyQuota) rider.dailyQuota = dailyQuota.trim();
    if (typeof activeOrders === "number") rider.activeOrders = activeOrders;
    if (status) rider.status = status;
    if (badgeColor) rider.badgeColor = badgeColor;
    if (avatar !== undefined) rider.avatar = avatar;

    await rider.save();

    // Synchronize linked User name/phone/address
    if (rider.user) {
      await User.findByIdAndUpdate(rider.user, {
        name: rider.name,
        phone: rider.phone,
        address: rider.presentAddress,
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: "Delivery boy details updated successfully.",
      rider,
      data: rider,
    });
  } catch (error) {
    console.error("Error updating delivery boy details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update delivery boy details.",
    });
  }
};

// @desc    Toggle delivery boy status (On Duty / Off Duty)
// @route   PATCH /api/delivery-boys/:id/status
// @access  Public / Admin
const toggleDeliveryBoyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const rider = await DeliveryBoy.findById(id);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found.",
      });
    }

    const nextStatus =
      status || (rider.status === "On Duty" ? "Off Duty" : "On Duty");
    rider.status = nextStatus;
    await rider.save();

    res.json({
      success: true,
      message: `Status updated to ${nextStatus}.`,
      rider,
      data: rider,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update status.",
    });
  }
};

// @desc    Delete delivery boy and associated User account
// @route   DELETE /api/delivery-boys/:id
// @access  Public / Admin
const deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await DeliveryBoy.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found.",
      });
    }

    // Delete linked User account if exists
    if (rider.user) {
      await User.findByIdAndDelete(rider.user).catch(() => {});
    }

    await DeliveryBoy.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Delivery partner "${rider.name}" (${rider.partnerId}) and account removed successfully.`,
    });
  } catch (error) {
    console.error("Error deleting delivery boy:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete delivery partner.",
    });
  }
};

module.exports = {
  getDeliveryBoys,
  getDeliveryBoyById,
  createDeliveryBoy,
  updateDeliveryBoy,
  toggleDeliveryBoyStatus,
  deleteDeliveryBoy,
};

