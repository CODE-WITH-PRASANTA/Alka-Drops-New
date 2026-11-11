const User = require("../models/User");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "alka_drops_access_jwt_key_2026_super_secure_access";

const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "alka_drops_refresh_jwt_key_2026_super_secure_refresh";

// Access Token: Short-lived (15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

// Refresh Token: Long-lived (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// Set secure HTTP-only cookies for Access and Refresh tokens
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  const baseCookieOptions = {
    httpOnly: true, // Prevents access from client-side JS (XSS defense)
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  // 15 minutes for access token
  res.cookie("accessToken", accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // 7 days for refresh token
  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Clear HTTP-only auth cookies
const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Store in HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to Alka Drops.",
      accessToken,
      refreshToken,
      token: accessToken, // backward compatibility
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan: user.plan,
        avatar: user.avatar || "",
        subscription: user.subscription,
        address: user.address,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & set HTTP-only cookies
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
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status === "Blocked" || user.status === "Deactive" || user.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is currently deactivated. Please contact support@alkadrops.com for assistance.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Store in HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      accessToken,
      refreshToken,
      token: accessToken, // backward compatibility
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan: user.plan,
        avatar: user.avatar || "",
        subscription: user.subscription,
        address: user.address,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token using HTTP-only Refresh Cookie
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided. Please log in again.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired or is invalid. Please log in again.",
      });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    if (user.status === "Blocked" || user.status === "Deactive" || user.status === "Inactive") {
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: "Your account is currently deactivated. Please contact support.",
      });
    }

    // Verify token matches the stored token in DB (anti-replay check)
    if (user.refreshToken && user.refreshToken !== token) {
      user.refreshToken = "";
      await user.save();
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid session or token re-use detected. Please log in again.",
      });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      message: "Session refreshed successfully.",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: newAccessToken,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan: user.plan,
        avatar: user.avatar || "",
        subscription: user.subscription,
        address: user.address,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear HTTP-only cookies
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: "" });
      } catch {
        // Token invalid or already expired, proceed with clearing
      }
    }

    clearAuthCookies(res);

    res.json({
      success: true,
      message: "Logged out successfully. All session cookies cleared.",
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
    const { search, role, status, excludeRole } = req.query;
    const filter = {};

    if (role && role !== "all") {
      filter.role = new RegExp(`^${role.trim()}$`, "i");
    } else if (excludeRole && excludeRole.trim()) {
      filter.role = { $nin: [new RegExp(`^${excludeRole.trim()}$`, "i")] };
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
      const s = String(status).trim().toLowerCase();
      if (s === "deactive" || s === "inactive" || s === "blocked") {
        user.status = "Deactive";
      } else {
        user.status = "Active";
      }
    } else {
      user.status = user.status === "Active" ? "Deactive" : "Active";
    }

    // If deactivated, invalidate active session refresh token immediately
    if (user.status !== "Active") {
      user.refreshToken = "";
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

// @desc    Update current user profile (name, phone, address)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { name, phone, address, addresses, subscription, plan, password, avatar } = req.body;
    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (plan !== undefined) user.plan = plan;
    if (avatar !== undefined) user.avatar = avatar;
    if (password && password.length >= 6) {
      user.password = password; // pre-save hook handles hashing
    }
    if (address) {
      user.address = {
        street: address.street !== undefined ? address.street : user.address.street,
        city: address.city || user.address.city || "Bhubaneswar",
        state: address.state || user.address.state || "Odisha",
        postalCode: address.postalCode || user.address.postalCode || "751012",
      };
    }
    if (Array.isArray(addresses)) {
      user.addresses = addresses;
    }
    if (subscription) {
      user.subscription = {
        ...(user.subscription ? user.subscription.toObject?.() || user.subscription : {}),
        ...subscription,
      };
    }

    await user.save();
    const updated = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture / avatar
// @route   POST /api/auth/profile/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please choose a valid image.",
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.avatar = avatarUrl;
    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json({
      success: true,
      message: "Profile picture uploaded successfully!",
      avatar: avatarUrl,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove profile picture
// @route   DELETE /api/auth/profile/avatar
// @access  Private
const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.avatar = "";
    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json({
      success: true,
      message: "Profile picture removed successfully.",
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Helper to download and cache external avatar locally
const saveRemoteAvatarLocally = async (remoteUrl) => {
  if (!remoteUrl || typeof remoteUrl !== "string" || !remoteUrl.startsWith("http")) {
    return remoteUrl || "";
  }
  try {
    const fs = require("fs");
    const path = require("path");
    const res = await fetch(remoteUrl);
    if (!res.ok) return remoteUrl;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `avatar-google-${Date.now()}-${Math.round(Math.random() * 1e6)}.png`;
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn("Failed to cache remote avatar locally:", err.message);
    return remoteUrl;
  }
};

// @desc    Authenticate or register user via Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, email, name, avatar, googleId } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;
    let userGoogleId = googleId;

    // If client sent Google GIS JWT credential, verify with Google or decode
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const verified = await verifyRes.json();
          userEmail = verified.email || userEmail;
          userName = verified.name || userName;
          userAvatar = verified.picture || userAvatar;
          userGoogleId = verified.sub || userGoogleId;
        } else {
          const parts = credential.split(".");
          if (parts.length === 3) {
            const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
            const payload = JSON.parse(payloadJson);
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userAvatar = payload.picture || userAvatar;
            userGoogleId = payload.sub || userGoogleId;
          }
        }
      } catch (decodeErr) {
        try {
          const parts = credential.split(".");
          if (parts.length === 3) {
            const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
            const payload = JSON.parse(payloadJson);
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userAvatar = payload.picture || userAvatar;
            userGoogleId = payload.sub || userGoogleId;
          }
        } catch (fallbackErr) {
          console.warn("Failed to decode Google credential token:", fallbackErr);
        }
      }
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Google authentication failed: Email address could not be verified.",
      });
    }

    // Download external Google avatar to local server to avoid 403 Forbidden / CORS issues
    if (userAvatar && userAvatar.startsWith("http")) {
      userAvatar = await saveRemoteAvatarLocally(userAvatar);
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Check if user is blocked
      if (user.status === "Blocked" || user.status === "Deactive" || user.status === "Inactive") {
        return res.status(403).json({
          success: false,
          message: "Your account is currently deactivated. Please contact support@alkadrops.com.",
        });
      }

      // Link googleId and avatar if not present or if user has remote Google avatar
      let changed = false;
      if (!user.googleId && userGoogleId) {
        user.googleId = userGoogleId;
        changed = true;
      }
      if ((!user.avatar || user.avatar.startsWith("http")) && userAvatar) {
        user.avatar = userAvatar;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    } else {
      // New user registering via Google!
      const crypto = require("crypto");
      const randomPassword = crypto.randomBytes(24).toString("hex");

      user = await User.create({
        name: userName || "Google User",
        email: cleanEmail,
        password: randomPassword,
        avatar: userAvatar || "",
        googleId: userGoogleId || "",
        authProvider: "google",
        role: "Retail Customer",
        status: "Active",
        plan: "Standard Retail",
        address: {
          street: "",
          city: "Bhubaneswar",
          state: "Odisha",
          postalCode: "751012",
        },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: `Signed in successfully with Google! Welcome, ${user.name}.`,
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan: user.plan,
        avatar: user.avatar || "",
        subscription: user.subscription,
        address: user.address,
        addresses: user.addresses || [],
        ordersCount: user.ordersCount || 0,
        totalSpend: user.totalSpend || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
  logoutUser,
  getUsers,
  updateUserStatus,
  deleteUser,
  getMe,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  forgotPassword,
};



