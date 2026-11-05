const User = require("../models/User");
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
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || "",
      role: role === "admin" ? "admin" : "user",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id),
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
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: "Login successful!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security practice: Don't reveal whether user exists
      return res.json({
        success: true,
        message: "If that email is registered, password reset instructions have been sent.",
      });
    }

    // In a full production setup with mailer, send email here
    res.json({
      success: true,
      message: `Password reset link has been dispatched to ${email}.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
};

