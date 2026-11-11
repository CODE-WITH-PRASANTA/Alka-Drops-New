const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Allowed CORS origins with credentials support
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
if (process.env.ADMIN_URL) allowedOrigins.push(process.env.ADMIN_URL);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, curl) or matching origins or dev environments
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, origin || true);
      }
      return callback(new Error("CORS policy violation: origin not allowed."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Custom cookie parser middleware
const cookieParser = require("./middleware/cookieMiddleware");
app.use(cookieParser);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "Alka Drops API Server",
    status: "online",
    version: "1.0.0",
    docs: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      blogs: "/api/blogs",
      orders: "/api/orders",
      contact: "/api/contact",
      upload: "/api/upload",
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/subscription-plans", require("./routes/subscriptionPlanRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/delivery-boys", require("./routes/deliveryBoyRoutes"));
app.use("/api/admin-users", require("./routes/adminUserRoutes"));
app.use("/api/subscription-orders", require("./routes/subscriptionOrderRoutes"));
app.use("/api/mail", require("./routes/mailRoutes"));

// Error handling middlewares
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// Port setup
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Alka Drops Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment:  ${process.env.NODE_ENV || "development"}`);
  console.log(`===============================================`);

  // Verify SMTP Gmail Connection on server boot
  const { verifySmtp } = require("./config/nodemailer");
  verifySmtp().catch(() => {});
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Keep server alive in development
});

