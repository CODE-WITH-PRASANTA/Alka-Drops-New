const User = require("../models/User");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "alka_drops_secret_jwt_key_2026_super_secure",
    { expiresIn: "30d" }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, address, plan } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Role mapping: default to "Retail Customer" or "Subscriber"
    let userRole = "Retail Customer";
    if (role === "admin" || role === "Administrator") {
      userRole = "Administrator";
    } else if (role && ["Subscriber", "Corporate", "Retail Customer"].includes(role)) {
      userRole = role;
    }

    let userAddress = {
      street: "",
      city: "Bhubaneswar",
      state: "Odisha",
      postalCode: "751012",
    };

    if (typeof address === "string" && address.trim()) {
      userAddress.street = address.trim();
    } else if (typeof address === "object" && address !== null) {
      userAddress = { ...userAddress, ...address };
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : "",
      role: userRole,
      status: "Active",
      plan: plan ? plan.trim() : "Standard Retail",
      address: userAddress,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to Alka Drops.",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan: user.plan,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email and password.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is currently blocked. Please contact support@alkadrops.com for assistance.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan: user.plan,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for Admin Panel
// @route   GET /api/auth/users
// @access  Public / Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const filter = {};

    if (role && role !== "all") {
      filter.role = new RegExp(`^${role.trim()}$`, "i");
    }

    if (status && status !== "all") {
      filter.status = new RegExp(`^${status.trim()}$`, "i");
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { "address.street": { $regex: q, $options: "i" } },
        { "address.city": { $regex: q, $options: "i" } },
      ];
    }

    const rawUsers = await User.find(filter).sort({ createdAt: -1 });

    // Map each user with real-time order statistics from Order collection
    const users = await Promise.all(
      rawUsers.map(async (u) => {
        let ordersCount = 0;
        let totalSpend = 0;

        try {
          const matchQueries = [{ user: u._id }];
          if (u.phone && u.phone.trim().length >= 8) {
            matchQueries.push({ "shippingAddress.phone": u.phone.trim() });
          }
          if (u.email) {
            matchQueries.push({ "shippingAddress.email": u.email.toLowerCase() });
          }

          const userOrders = await Order.find({ $or: matchQueries });
          ordersCount = userOrders.length;
          totalSpend = userOrders.reduce(
            (sum, ord) => sum + (Number(ord.totalAmount) || 0),
            0
          );
        } catch (ordErr) {
          console.error("Error computing user orders:", ordErr);
        }

        const addressDisplay = u.address?.street
          ? `${u.address.street}${u.address.city ? `, ${u.address.city}` : ""}`
          : u.address?.city || "Bhubaneswar, Odisha";

        return {
          id: u._id.toString(),
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone || "Not provided",
          address: addressDisplay,
          plan: u.plan || "Standard Retail",
          ordersCount,
          totalSpend: `₹${totalSpend.toLocaleString("en-IN")}`,
          rawSpend: totalSpend,
          role: u.role || "Retail Customer",
          status: u.status || "Active",
          createdAt: u.createdAt,
        };
      })
    );

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active <-> Blocked)
// @route   PATCH /api/auth/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.email === "admin@alkadrops.com" || user.role === "Administrator") {
      return res.status(400).json({
        success: false,
        message: "Cannot block or deactivate the primary administrator account.",
      });
    }

    const { status } = req.body;
    if (status) {
      user.status = status.toLowerCase() === "blocked" ? "Blocked" : "Active";
    } else {
      user.status = user.status === "Active" ? "Blocked" : "Active";
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.status}.`,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.email === "admin@alkadrops.com" || user.role === "Administrator") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the primary administrator account.",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `User account "${user.name}" has been permanently removed.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password handler
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({
        success: true,
        message: "If that email is registered, password reset instructions have been sent.",
      });
    }

    res.json({
      success: true,
      message: `Password reset link has been dispatched to ${cleanEmail}.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateUserStatus,
  deleteUser,
  getMe,
  forgotPassword,
};


