const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const DeliveryBoy = require("../models/DeliveryBoy");
const Order = require("../models/Order");
const SubscriptionOrder = require("../models/SubscriptionOrder");

const JWT_SECRET = process.env.JWT_SECRET || "alka_drops_secret_jwt_key_2026";

// Generate signed JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      partnerId: user.partnerId || "",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Helper: Get Today's Date String in YYYY-MM-DD
const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

// Auto-seed default Super Admin if collection is completely empty
const seedDefaultAdminIfEmpty = async () => {
  const adminCount = await AdminUser.countDocuments({ role: "admin" });
  if (adminCount === 0) {
    const defaultAdmin = new AdminUser({
      name: "Super Administrator",
      email: "admin@alkadrops.com",
      password: "AlkaAdmin@2026",
      phone: "+91 9876543210",
      role: "admin",
      status: "Active",
      dutyStatus: "On Duty",
    });
    await defaultAdmin.save();
    console.log("Seeded default Super Admin: admin@alkadrops.com / AlkaAdmin@2026");
  }
};

// @desc    Login Admin or Delivery Boy
// @route   POST /api/admin-users/login
// @access  Public
const loginAdminUser = async (req, res) => {
  try {
    await seedDefaultAdminIfEmpty();

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both username/email/partner ID and password.",
      });
    }

    const cleanId = identifier.trim();
    const digitsOnly = cleanId.replace(/\D/g, "");

    const searchConditions = [
      { email: cleanId.toLowerCase() },
      { partnerId: cleanId.toUpperCase() },
      { phone: cleanId },
    ];

    if (digitsOnly.length >= 7) {
      const last10 = digitsOnly.slice(-10);
      const flexiblePattern = last10.split("").join("[\\s\\-]*");
      searchConditions.push({ phone: { $regex: flexiblePattern, $options: "i" } });
    }

    // 1. Search in AdminUser collection by email, partnerId, or phone
    let user = await AdminUser.findOne({
      $or: searchConditions,
    }).populate("deliveryBoyRef");

    // 2. If not found in AdminUser, check if this is an existing DeliveryBoy registered earlier
    if (!user) {
      const riderConditions = [
        { email: cleanId.toLowerCase() },
        { partnerId: cleanId.toUpperCase() },
        { phone: cleanId },
      ];
      if (digitsOnly.length >= 7) {
        const last10 = digitsOnly.slice(-10);
        const flexiblePattern = last10.split("").join("[\\s\\-]*");
        riderConditions.push({ phone: { $regex: flexiblePattern, $options: "i" } });
      }

      const rider = await DeliveryBoy.findOne({
        $or: riderConditions,
      });

      if (rider) {
        // Auto-create AdminUser account for this DeliveryBoy with standard password
        user = new AdminUser({
          name: rider.name,
          email: rider.email,
          password: password || rider.phone || "AlkaDelivery@2026",
          phone: rider.phone,
          role: "delivery_boy",
          partnerId: rider.partnerId,
          deliveryBoyRef: rider._id,
          avatar: rider.avatar || "",
          status: "Active",
          dutyStatus: rider.status === "Off Duty" ? "Off Duty" : "On Duty",
        });
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Account not found.",
      });
    }

    // Check account status
    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or blocked. Please contact admin.",
      });
    }

    // Verify Password
    let isMatch = await user.matchPassword(password);

    // If standard match fails and user is a delivery boy, allow first-time login credentials:
    if (!isMatch && user.role === "delivery_boy") {
      // 1. Allow default onboarding delivery passwords
      if (password === "AlkaDelivery@2026" || password === "Alka@123456") {
        isMatch = true;
      }

      // 2. Allow registered phone number (first-time login with phone number)
      const enteredDigits = password.replace(/\D/g, "");
      const userPhoneDigits = (user.phone || (user.deliveryBoyRef && user.deliveryBoyRef.phone) || "").replace(/\D/g, "");
      if (
        enteredDigits.length >= 7 &&
        userPhoneDigits.length >= 7 &&
        (userPhoneDigits.endsWith(enteredDigits) || enteredDigits.endsWith(userPhoneDigits.slice(-10)))
      ) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password or mobile number. Please check your credentials.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    // Set HTTP-only cookie as fallback
    res.cookie("alka_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! Logged in as ${user.role === "admin" ? "Administrator" : "Delivery Partner"}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        partnerId: user.partnerId,
        avatar: user.avatar,
        status: user.status,
        dutyStatus: user.dutyStatus,
        deliveryBoy: user.deliveryBoyRef || null,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during admin authentication.",
    });
  }
};

// @desc    Get Current Authenticated Admin/Staff Profile
// @route   GET /api/admin-users/me
// @access  Protected
const getAdminProfile = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.adminUser._id)
      .select("-password")
      .populate("deliveryBoyRef");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        partnerId: user.partnerId,
        avatar: user.avatar,
        status: user.status,
        dutyStatus: user.dutyStatus,
        deliveryBoy: user.deliveryBoyRef || null,
        attendance: user.attendance || [],
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve profile.",
    });
  }
};

// @desc    Update Authenticated Profile
// @route   PUT /api/admin-users/me
// @access  Protected
const updateAdminProfile = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.adminUser._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { name, phone, avatar, password, dutyStatus } = req.body;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (avatar) user.avatar = avatar.trim();
    if (dutyStatus) user.dutyStatus = dutyStatus;

    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();

    // If delivery boy, keep DeliveryBoy doc synced
    if (user.deliveryBoyRef) {
      await DeliveryBoy.findByIdAndUpdate(user.deliveryBoyRef, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
        ...(dutyStatus && { status: dutyStatus }),
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        partnerId: user.partnerId,
        avatar: user.avatar,
        dutyStatus: user.dutyStatus,
      },
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

// Helper: Format coordinates into locality label if address not provided (Zero raw coordinates)
const formatCoordinatesAddress = (lat, lng, defaultName = "Bhubaneswar Logistics Operational Zone") => {
  return defaultName;
};

// @desc    Delivery Boy Clock In for Attendance
// @route   POST /api/admin-users/attendance/clock-in
// @access  Protected (Delivery Boy & Admin)
const clockInAttendance = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.adminUser._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const today = getTodayDateStr();
    const existingIndex = user.attendance.findIndex((a) => a.date === today);

    const { notes, latitude, longitude, accuracy, address } = req.body;
    const resolvedAddress =
      typeof address === "string" && address.trim() !== ""
        ? address.trim()
        : typeof address === "object" && address !== null
        ? address.full || address.primary || address.address || "Bhubaneswar Operational Zone"
        : latitude && longitude
        ? formatCoordinatesAddress(latitude, longitude, "Bhubaneswar Operational Zone")
        : "Alka Drops Main Hub, Bhubaneswar";

    if (existingIndex !== -1 && !user.attendance[existingIndex].clockOut) {
      if (latitude && !user.attendance[existingIndex].clockInLocation?.latitude) {
        user.attendance[existingIndex].clockInLocation = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy ? Number(accuracy) : null,
          address: resolvedAddress,
        };
        await user.save();
      }
      return res.json({
        success: true,
        message: "You are already clocked in as Present for today's shift.",
        attendance: user.attendance[existingIndex],
        dutyStatus: "On Duty",
      });
    }

    const clockInRecord = {
      date: today,
      clockIn: new Date(),
      clockOut: null,
      status: "Present",
      totalHours: 0,
      jarsDelivered: 0,
      emptyJarsCollected: 0,
      notes: notes || "Marked Present - Shift started on schedule",
      clockInLocation: {
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        accuracy: accuracy ? Number(accuracy) : null,
        address: resolvedAddress,
      },
    };

    if (existingIndex !== -1) {
      // Re-clock in
      user.attendance[existingIndex].clockIn = new Date();
      user.attendance[existingIndex].clockOut = null;
      user.attendance[existingIndex].status = "Present";
      if (latitude) {
        user.attendance[existingIndex].clockInLocation = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy ? Number(accuracy) : null,
          address: resolvedAddress,
        };
      }
    } else {
      user.attendance.unshift(clockInRecord);
    }

    user.dutyStatus = "On Duty";
    await user.save();

    // Sync DeliveryBoy model status
    if (user.deliveryBoyRef || user.partnerId) {
      await DeliveryBoy.findOneAndUpdate(
        { $or: [{ _id: user.deliveryBoyRef }, { partnerId: user.partnerId }] },
        { status: "On Duty" }
      );
    }

    res.json({
      success: true,
      message: `Shift started! Marked Present at ${new Date().toLocaleTimeString("en-IN")}.`,
      attendance: user.attendance[0],
      dutyStatus: "On Duty",
    });
  } catch (error) {
    console.error("Clock In Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clock in for shift.",
    });
  }
};

// @desc    Delivery Boy Clock Out
// @route   POST /api/admin-users/attendance/clock-out
// @access  Protected (Delivery Boy & Admin)
const clockOutAttendance = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.adminUser._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const today = getTodayDateStr();
    const existingIndex = user.attendance.findIndex((a) => a.date === today);

    if (existingIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No active clock-in found for today. Please clock in first.",
      });
    }

    const record = user.attendance[existingIndex];
    const { notes, latitude, longitude, accuracy, address } = req.body;
    const now = new Date();
    record.clockOut = now;
    record.status = "Present";

    const diffMs = now - new Date(record.clockIn);
    record.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    if (notes) record.notes = notes;

    if (latitude) {
      const resolvedOutAddress =
        typeof address === "string" && address.trim() !== ""
          ? address.trim()
          : typeof address === "object" && address !== null
          ? address.full || address.primary || address.address || "Bhubaneswar Return Hub"
          : formatCoordinatesAddress(latitude, longitude, "Bhubaneswar Return Hub");

      record.clockOutLocation = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy ? Number(accuracy) : null,
        address: resolvedOutAddress,
      };
    }

    user.dutyStatus = "Off Duty";
    await user.save();

    // Sync DeliveryBoy status
    if (user.deliveryBoyRef || user.partnerId) {
      await DeliveryBoy.findOneAndUpdate(
        { $or: [{ _id: user.deliveryBoyRef }, { partnerId: user.partnerId }] },
        { status: "Off Duty" }
      );
    }

    res.json({
      success: true,
      message: `Shift completed! Clocked out at ${now.toLocaleTimeString("en-IN")}. Marked Present (${record.totalHours} hrs).`,
      attendance: record,
      dutyStatus: "Off Duty",
    });
  } catch (error) {
    console.error("Clock Out Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clock out.",
    });
  }
};

// @desc    Get Attendance Logs (Personal for Delivery Boy, Fleet-wide for Admin)
// @route   GET /api/admin-users/attendance
// @access  Protected
const getAttendanceLogs = async (req, res) => {
  try {
    if (req.adminUser.role === "delivery_boy") {
      const user = await AdminUser.findById(req.adminUser._id).select("attendance name partnerId");
      
      // Attendance: Only show HIS attendance where he is marked Present
      const presentLogs = (user?.attendance || []).filter((record) => {
        const s = (record.status || "").toLowerCase();
        return s === "present" || s === "on duty" || s === "completed" || Boolean(record.clockIn);
      });

      return res.json({
        success: true,
        attendance: presentLogs,
      });
    }

    // If Admin, can view all or filter by partnerId
    const { partnerId } = req.query;
    const query = { role: "delivery_boy" };
    if (partnerId) query.partnerId = partnerId.toUpperCase();

    const deliveryUsers = await AdminUser.find(query).select(
      "name email phone partnerId dutyStatus attendance avatar"
    );

    res.json({
      success: true,
      count: deliveryUsers.length,
      attendanceList: deliveryUsers,
    });
  } catch (error) {
    console.error("Get Attendance Logs Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve attendance logs.",
    });
  }
};

// @desc    Get Delivery Boy's Personal Work & Assigned Orders Details
// @route   GET /api/admin-users/delivery-work
// @access  Protected (Delivery Boy & Admin)
const getDeliveryBoyWorkDetails = async (req, res) => {
  try {
    const user = req.adminUser;
    const riderId = String(user._id);
    const partnerId = user.partnerId || "";
    const deliveryBoyDocId = user.deliveryBoyRef ? String(user.deliveryBoyRef._id || user.deliveryBoyRef) : "";

    let shopFilter = {};
    let subFilter = {};

    if (user.role === "admin") {
      // Admin sees all paid retail orders and all subscriptions
      shopFilter = { paymentStatus: "paid" };
      subFilter = {};
    } else {
      const orConditions = [
        { "assignedDeliveryBoy._id": riderId },
        { "deliveryBoy.id": riderId },
      ];
      if (deliveryBoyDocId) {
        orConditions.push({ "assignedDeliveryBoy._id": deliveryBoyDocId });
        orConditions.push({ "deliveryBoy.id": deliveryBoyDocId });
      }
      if (partnerId) {
        orConditions.push({ "assignedDeliveryBoy.partnerId": partnerId });
        orConditions.push({ "deliveryBoy.partnerId": partnerId });
      }
      shopFilter = { $or: orConditions };
      subFilter = { $or: orConditions };
    }

    // Query both shop orders and subscriptions
    let [shopOrders, subOrders, deliveryBoyDetails] = await Promise.all([
      Order.find(shopFilter).sort({ createdAt: -1 }),
      SubscriptionOrder.find(subFilter).sort({ createdAt: -1 }),
      user.deliveryBoyRef
        ? DeliveryBoy.findById(user.deliveryBoyRef)
        : DeliveryBoy.findOne({ partnerId: partnerId }),
    ]);

    // If delivery partner has no orders assigned to their specific ID yet, provide active fleet runs
    if (shopOrders.length === 0) {
      shopOrders = await Order.find({ paymentStatus: "paid" }).limit(20).sort({ createdAt: -1 });
    }
    if (subOrders.length === 0) {
      subOrders = await SubscriptionOrder.find({}).limit(20).sort({ createdAt: -1 });
    }

    const todayStr = getTodayDateStr();

    // Calculate delivery metrics
    let totalJarsToDeliver = 0;
    let deliveredTodayCount = 0;
    let emptyJarsCollectedToday = 0;
    let pendingJarsTotal = 0;

    // Process subscriptions
    subOrders.forEach((sub) => {
      const quota = Number(sub.bottlesPerDelivery) || 2;
      totalJarsToDeliver += quota;

      const droppedToday = Array.isArray(sub.dailyDrops)
        ? sub.dailyDrops.find(
            (d) =>
              d.status === "Delivered" &&
              new Date(d.dropDate || d.deliveredAt).toISOString().slice(0, 10) === todayStr
          )
        : null;

      if (droppedToday) {
        deliveredTodayCount += 1;
        emptyJarsCollectedToday += Number(droppedToday.emptyJarsCollected) || 0;
      }

      pendingJarsTotal += Number(sub.pendingEmptyJars) || 0;
    });

    // Process shop orders
    shopOrders.forEach((ord) => {
      const isDelivered = (ord.orderStatus || "").toLowerCase() === "delivered";
      if (isDelivered) {
        deliveredTodayCount += 1;
        emptyJarsCollectedToday += Number(ord.deliveryDetails?.emptyJarsCollected) || 0;
      }
      pendingJarsTotal += Number(ord.deliveryDetails?.pendingEmptyJars) || 0;
    });

    const totalTasks = shopOrders.length + subOrders.length;
    const pendingTasks = Math.max(0, totalTasks - deliveredTodayCount);

    res.json({
      success: true,
      partner: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        partnerId: user.partnerId,
        avatar: user.avatar,
        dutyStatus: user.dutyStatus,
        route: deliveryBoyDetails?.route || "Zone A - Nayapalli / IRC Village",
        vehicleType: deliveryBoyDetails?.vehicleType || "Electric Loader Van",
        vehicleNumber: deliveryBoyDetails?.vehicleNumber || "OD-02-AK-2026",
        dailyQuota: deliveryBoyDetails?.dailyQuota || "120 Jars",
      },
      metrics: {
        totalTasks,
        pendingTasks,
        deliveredTodayCount,
        totalJarsToDeliver,
        emptyJarsCollectedToday,
        pendingJarsTotal,
      },
      assignedShopOrders: shopOrders,
      assignedSubscriptionOrders: subOrders,
    });
  } catch (error) {
    console.error("Get Delivery Work Details Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch delivery work details.",
    });
  }
};

// @desc    Register new Admin or Delivery Boy (Admin only)
// @route   POST /api/admin-users/register
// @access  Protected (Admin only)
const registerAdminUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, partnerId, vehicleNumber, route } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    let finalPartnerId = partnerId ? partnerId.trim().toUpperCase() : "";
    let deliveryBoyDoc = null;

    if (role === "delivery_boy") {
      if (!finalPartnerId) {
        const count = await AdminUser.countDocuments({ role: "delivery_boy" });
        finalPartnerId = `ALK-DB-${String(count + 1).padStart(3, "0")}`;
      }

      // Also create companion DeliveryBoy doc
      deliveryBoyDoc = new DeliveryBoy({
        partnerId: finalPartnerId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || "+91 9000000000",
        role: "Delivery Boy",
        aadharNumber: "1234 5678 9012",
        panNumber: "ABCDE1234F",
        vehicleType: "Electric Loader Van",
        vehicleNumber: vehicleNumber || "OD-02-ALKA-1",
        route: route || "Zone A - Central",
        status: "On Duty",
      });
      await deliveryBoyDoc.save();
    }

    const newUser = new AdminUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      phone: phone || "",
      role: role || "admin",
      partnerId: finalPartnerId,
      deliveryBoyRef: deliveryBoyDoc ? deliveryBoyDoc._id : null,
      status: "Active",
      dutyStatus: "On Duty",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: `Successfully created ${role === "delivery_boy" ? "Delivery Boy" : "Admin"} user.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        partnerId: newUser.partnerId,
      },
    });
  } catch (error) {
    console.error("Register Admin User Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user.",
    });
  }
};

// @desc    Get All Admin & Staff Users
// @route   GET /api/admin-users
// @access  Protected (Admin only)
const getAllAdminUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await AdminUser.find(query)
      .select("-password")
      .populate("deliveryBoyRef")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Admin Users Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users.",
    });
  }
};

module.exports = {
  loginAdminUser,
  getAdminProfile,
  updateAdminProfile,
  clockInAttendance,
  clockOutAttendance,
  getAttendanceLogs,
  getDeliveryBoyWorkDetails,
  registerAdminUser,
  getAllAdminUsers,
};

